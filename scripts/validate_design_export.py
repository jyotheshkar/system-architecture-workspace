#!/usr/bin/env python3
"""Validate this design-data export without executing the app or contacting providers."""
from __future__ import annotations
import argparse
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INDEX = ROOT / "docs" / "SOURCE_INDEX.json"
MANIFEST = ROOT / "docs" / "DESIGN_DATA_MANIFEST.json"
RECEIPT = ROOT / "docs" / "VALIDATION_RECEIPT.json"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, "Duplicate JSON object key")
        result[key] = value
    return result


def reject_constant(value):
    raise ValueError("Non-finite JSON constant")


def load_json(path):
    return json.loads(path.read_text(encoding="utf-8"),
                      object_pairs_hook=unique_object,
                      parse_constant=reject_constant)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def git_blob_sha(data):
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()


def graph_check(path, document):
    graph = document.get("blueprint", document)
    if "nodes" not in graph:
        return None
    nodes, edges = graph["nodes"], graph["edges"]
    ids = [node["id"] for node in nodes]
    require(len(ids) == len(set(ids)), str(path) + ": duplicate node ID")
    edge_ids = [edge["id"] for edge in edges]
    require(len(edge_ids) == len(set(edge_ids)), str(path) + ": duplicate edge ID")
    for edge in edges:
        start = edge.get("source", edge.get("from"))
        end = edge.get("target", edge.get("to"))
        require(start in ids and end in ids, str(path) + ": unknown edge endpoint")
        if "from" in edge:
            require(edge["from"] == start and edge["to"] == end,
                    str(path) + ": conflicting edge endpoints")
    return {"path": path, "node_count": len(nodes), "edge_count": len(edges)}


def validate():
    index = load_json(INDEX)
    require(index["source_commit_sha"] == "dacd1ad369be24d5d0d8536ee10ed075e61feb23",
            "Unexpected design-data source commit")
    private_url = "https://github.com/" + index["source_repository_name"]
    entries = index["files"]
    paths = [entry["path"] for entry in entries]
    require(len(paths) == 6 and len(set(paths)) == 6, "Expected six unique data files")
    graphs = []
    documents = {}
    unchanged = 0
    for entry in entries:
        relative = entry["path"]
        target = (ROOT / relative).resolve()
        require(target.is_relative_to(ROOT.resolve()), "Unsafe data path")
        data = target.read_bytes()
        documents[relative] = load_json(target)
        if not entry["editorially_modified"]:
            require(git_blob_sha(data) == entry["source_git_blob_sha"],
                    relative + ": original Git blob mismatch")
            require(len(data) == entry["source_size_bytes"],
                    relative + ": original byte-size mismatch")
            unchanged += 1
        graph = graph_check(relative, documents[relative])
        if graph:
            graphs.append(graph)
    pages = [(path, doc) for path, doc in documents.items()
             if path.startswith("workspace/pages/") or path.startswith("workspace/retired-pages/")]
    page_ids = [doc["id"] for _, doc in pages]
    require(len(page_ids) == len(set(page_ids)), "Duplicate page ID")
    for path, doc in pages:
        require(doc["schemaVersion"] == 1, path + ": unexpected page schema")
        require(doc["coreVersion"] in {"agentic-core-reference-v1", "system-architecture-workspace-v1"},
                path + ": unknown core reference")
        require(isinstance(doc["modules"], list) and isinstance(doc["sections"], list),
                path + ": invalid page collections")
    website = documents["workspace/website-reference.json"]
    require("repository" not in website["evidence"], "Original private source link retained")
    require("repositoryVisibility" not in website["evidence"], "Original private visibility retained")
    allowed = paths + ["README.md", "docs/PROVENANCE.md", "docs/SOURCE_INDEX.json",
                       "scripts/validate_design_export.py"]
    patterns = {
        "private_key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
        "aws_key": re.compile(r"\b(?:AKIA|ASIA)[A-Z0-9]{16}\b"),
        "github_or_api_key": re.compile(r"\b(?:ghp_|github_pat_|sk-proj-)[A-Za-z0-9_-]{20,}"),
        "email": re.compile(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", re.I),
        "absolute_windows_path": re.compile(r"(?<![A-Za-z])\b[A-Za-z]:[\\/]"),
    }
    hashes = []
    for relative in sorted(allowed):
        target = ROOT / relative
        data = target.read_bytes()
        text = data.decode("utf-8")
        require(private_url not in text, relative + ": private source URL retained")
        for category, pattern in patterns.items():
            require(not pattern.search(text), relative + ": selected sensitive pattern: " + category)
        hashes.append({"path": relative, "size_bytes": len(data), "sha256": sha256(data)})
    return index, hashes, graphs, unchanged


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--write-manifest", action="store_true",
                        help="Write this export's manifest and validation receipt after validation.")
    args = parser.parse_args()
    index, hashes, graphs, unchanged = validate()
    manifest = {"schema_version": "1.0.0", "scope": "design_data_and_export_docs_only",
                "source_repository_id": index["source_repository_id"],
                "source_commit_sha": index["source_commit_sha"],
                "excluded_separate_directory": "app/",
                "files": hashes}
    if args.write_manifest:
        MANIFEST.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
        receipt = {"review_date_utc": "2026-10-25", "result": "passed",
                   "json_data_files_parsed": 6, "duplicate_keys_rejected": True,
                   "non_finite_constants_rejected": True,
                   "unchanged_files_matching_source_git_blobs": unchanged,
                   "graph_checks": graphs, "page_records_checked": 3,
                   "selected_sensitive_pattern_matches": 0,
                   "manifest_sha256": sha256(MANIFEST.read_bytes()),
                   "network_calls": 0, "app_executed": False,
                   "aws_deployment_verified": False,
                   "limits": "Static JSON, relationships and byte integrity only; not runtime, deployment or exhaustive security verification."}
        RECEIPT.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    else:
        require(load_json(MANIFEST) == manifest, "Export manifest does not match current files")
        receipt = load_json(RECEIPT)
        require(receipt["manifest_sha256"] == sha256(MANIFEST.read_bytes()),
                "Validation receipt does not match manifest")
    print("PASS: 6 JSON data files; %d unchanged source blobs; %d graphs; 3 page records; no app/provider execution."
          % (unchanged, len(graphs)))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
