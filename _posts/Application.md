## SQS
### Features
![sqs-concept](./image/sqs.png)
- A Web Service that gives you access to a message queue that can be used to store messages while waiting for a computer to process them
- A Queue is a **temporary repository** for messages that are awaiting processing
- Using SQS, you can **decouple the components** of an application so they run independently.
- SQS is **Pull-basexd**
- Messages are 256KB in size
- Messages can be kept in the queue from 1min to 14 days; the default retention period is 4 days
- SQS guarantees that your messages will be processed **at least once**
- **SQS long polling**
  - A way to retrieve messages from SQS queues
  - While the regular **short polling** returns immediately, long polling doesn't return a response until a message arrives in the message queue, or the long poll times out.

### 2 Queue Types 
- Standard Queues(default) 
- FIFO Queues : exactly-once processing

### Visibility Time Out
- The amount of time that the message is invisible in the SQS queue after a reader picks up that message.
- Provided the job is processed before the visibility time out expires, the message will then be deleted from the queue
- If the job is not processed within that time, the message will become visible again and another reader will process. This could result in the same message being **delievered twice**
- Visibility timeout max is 12 hours


## SWF
### Features
- Simple Workflow Service 
- **Tasks** represent invocations of various processing steps in an application which can be performed by execurable code, web service calls, human actions, and scripts. 
- **SWF Actors** : Workflow Starters, Deciders, Activity Workers
### SWF vs. SQS
|Feature|SWF|SQS|
|:-------------:|:-------------:|:-------------:|
|retention period|1 year|14 days|
|API|Task-oriented API|Message-oriented API|
|duplicated|a task is assigned only once. NEVER duplicated|you need to handle duplicated messages|
|tracking|keeps track of all the tasks and events|you need to implement your own application-level tracking

## SNS
### Features 
- Simple Notification Service
- Makes it easy to set up, operate, and send notifications from the cloud. 
- **SQS Integration** : SNS can also deliver notifications by SMS or email to SQS queues / HTTP endpoint
- Instantaneous, **push-based** delivery (no polling)
- Simple APIs and easy integration with applications 
- Flexible message delivery over multiple transport protocols
- Inexpensive, pay-as-you-go model with no up-front costs 
- Web-based AWS Management Console offers the simplicity
- **SNS vs. SQS**
  - Both Messaging Service
  - SNS - Push
  - SQS - Polls(Pulls)

## Elastic Transcoder
- Media transcoder in the cloud.

## API Gateway 
- API Gateway Options
- API Gateway Configuration
- API Gateway Deployment
- API Gateway Caching : increase performance 
- **Same Origin Policy** : A web browser permits scripts contained in a first web page to access data in a second web page. This is done to prevent **Cross-Site Scripting(XSS)** attacks. 
- **CORS(Cross-Origin Resource Sharing)** : allows restricted resources to be requested from another domain
  - If you are using Javascript/AZAX that uses multiple domains with API Gateway, you have to enable CORS on API Gateway

## Kinesis
- Streaming Data : Purchases from online stores, Stock Prices, Game data, Social network data, Geospatial data(uber), IoT sensor data
### 3 Types of Kinesis
- Kinesis Streams 
  - Shards : the total capacity of the stream is the sum of the capacities of its shards.
![kinesis-stream](./image/kinesis-stream.png)
- Kinesis Firehose
![kinesis-firehose](./image/kinesis-firehose.png)
- Kinesis Analytics
![kinesis-analytics](./image/kinesis-analytics.png)

## Cognito - Web Identity Federation
- **Web Identity Federation**
  - Give your users access to AWS resources after they have authenticated with a Web ID Provider(Amazon, Facebook, Google..)
  - Following successful authentication, the user receives an **authentication code** from web id provider, which they can trade for **temporary AWS security credentials**.
- Use Cases
![cognito-process](./image/cognito-1.png)
- Cognito User Pools vs. Identity Pools(actual granting)
  - **User Pool** : A **User Directory** used to sign-in directly to the User Pool. Cognito acts as an Identity Broker between the id provider and AWS. Successful authentication generates a JSON Web Token(JWTs)
  - **Identity Pool** : enable **provide temporary AWS credentials**
- Cognito Synchronisation : Various different devices
