/* Presentation only. Layer identities, selection state and event handlers stay
 * with the architecture renderer. Each selected segment keeps its own state. */
(() => {
  'use strict';
  const artwork = {
    core: '<path d="M12 2v20M2 12h20"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1"/>',
    memory: '<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v13c0 4 14 4 14 0V5M5 11c0 4 14 4 14 0"/>',
    learning: '<path d="M12 3v4m0 10v4M3 12h4m10 0h4M5.6 5.6l2.8 2.8m7.2 7.2 2.8 2.8M5.6 18.4l2.8-2.8m7.2-7.2 2.8-2.8"/><circle cx="12" cy="12" r="4"/>',
    tools: '<path d="m14 4-3 3 3 3 3-3a6 6 0 0 1-7 7l-6 6-2-2 6-6a6 6 0 0 1 6-8Z"/>',
    recovery: '<path d="M20 7a8 8 0 0 0-14-2L3 8m0-5v5h5M4 17a8 8 0 0 0 14 2l3-3m0 5v-5h-5"/>',
    specialists: '<circle cx="12" cy="4" r="2"/><circle cx="4" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><path d="m11 6-6 11m8-11 6 11M6 19h12"/>',
    pic: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/><path d="m9 12 2 2 4-4"/>',
    runtime: '<rect x="2" y="8" width="5" height="8" rx="1"/><rect x="17" y="8" width="5" height="8" rx="1"/><path d="M7 12h10m-4-3 3 3-3 3"/>',
    services: '<path d="M5 3h14v5H5zm0 7h14v5H5zm0 7h14v4H5zM8 5.5h.01M8 12.5h.01M8 19h.01"/>',
    experience: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 8h18M8 8v13M6 5.5h.01M9 5.5h.01"/>',
    design: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="12" r="2"/><circle cx="5" cy="19" r="2"/><path d="M7 5h5v7h5M7 19h5v-7"/>',
    storage: '<path d="M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
    delivery: '<path d="m12 2 9 5v10l-9 5-9-5V7Zm-9 5 9 5 9-5M12 12v10M7.5 4.5l9 5"/>',
    all: '<rect x="3" y="2" width="6" height="6" rx="1"/><rect x="15" y="16" width="6" height="6" rx="1"/><path d="M9 5h6v6H9v8h6M6 8v3h3"/>',
    fallback: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M7 5h10M6 7l5 10m7-10-5 10"/>'
  };
  const colors = {core:'#90939d', memory:'#76b8af', learning:'#c4a75a', tools:'#84a6d6', recovery:'#c58d77', specialists:'#ae91d4', pic:'#c77881', runtime:'#90a7cf', services:'#aaa3cd', experience:'#9caec7', design:'#bca278', storage:'#91b3a2', delivery:'#b2a0cc', all:'#acc36d', fallback:'#a6acb6'};
  function decorate(toolbar, groups = []) {
    if (!toolbar) return;
    toolbar.classList.add('layerToolbar');
    const definitions = new Map(groups.map(group => [group.id, group]));
    toolbar.querySelectorAll('button[data-site-group]').forEach(button => {
      const id = button.dataset.siteGroup;
      const label = definitions.get(id)?.label || (id === 'all' ? 'Full Architecture' : button.textContent.trim());
      const key = id + ':' + label;
      if (button.dataset.layerDecoration === key) return;
      const symbol = document.createElement('span');
      symbol.className = 'layerToolbarIcon'; symbol.setAttribute('aria-hidden', 'true');
      symbol.style.setProperty('--layer-color', colors[id] || colors.fallback);
      symbol.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" focusable="false" aria-hidden="true">' + (artwork[id] || artwork.fallback) + '</svg>';
      const text = document.createElement('span');text.className = 'layerToolbarLabel';text.textContent = label;
      button.type = 'button';button.replaceChildren(symbol, text);button.dataset.layerDecoration = key;
    });
  }
  window.SAWLayerToolbar = Object.freeze({decorate});
})();
