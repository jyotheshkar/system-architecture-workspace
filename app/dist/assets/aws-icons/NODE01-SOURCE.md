# Node 01 service icons

The node01-*.svg files were extracted without artwork changes from the supplied `Agentic-Core-Node-01-AWS-v7.1-Official-Icons.drawio`, page 02 Detailed Deployment Architecture. These are the official service/resource symbols embedded in that source; their presence describes the proposed service mapping, not deployment or AWS approval.

Source cells: p2c13 Amplify, p2c19 Cognito, p2c23 API Gateway, p2c27 Lambda, p2c35 DynamoDB, p2c39 DynamoDB Streams, p2c47 EventBridge Scheduler, p2c55 SQS, p2-official-iam, p2-official-cloudwatch, p2-official-cloudtrail.

Architecture conventions checked against AWS documentation:
- https://docs.aws.amazon.com/lambda/latest/dg/configuration-vpc.html
- https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues.html
- https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html

Lambda runs in AWS-managed infrastructure; this baseline does not place managed services inside customer VPC subnets. The Standard queue allows duplicates, and Lambda event source mappings poll and batch records. Node 02 is an interface boundary only. Offline site checks do not establish runtime enforcement.
