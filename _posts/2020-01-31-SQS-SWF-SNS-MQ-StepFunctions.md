---
title: "SQS vs. SWF vs. SNS vs. MQ vs. StepFunctions"
excerpt: "AWS Message Que"
toc: true
toc_sticky: true
categories:
  - AWS
modified_date: 2020-04-08 09:36:28 +0900
---
## SQS
### Features
![sqs-concept](assets/images/image/sqs.png)
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
- **SNS vs. SES**
  - Amazon SES는 이메일을 통해 커뮤니케이션을 전송해야 하는 애플리케이션을 위한 서비스입니다. 그리고 사용자 지정 이메일 헤더 필드와 여러 MIME 유형을 지원합니다. Amazon SES는 사내 이메일 솔루션을 구축하거나 타사 이메일 서비스를 라이선싱, 설치 및 운영하는 데 따르는 복잡성과 비용을 없애줍니다.
  - 반면에 Amazon Simple Notification Service(Amazon SNS)는 메시징 지향 애플리케이션입니다. 여기에서는 타이밍이 중요한 "푸시" 알림을 요청하고 수신하는 구독자가 여러 명으로, HTTP, Amazon SQS, 이메일 등의 전송 프로토콜을 직접 선택할 수 있습니다. Amazon SNS 알림의 본문은 UTF-8 스트링 8,192자로 제한되고, 멀티미디어 콘텐츠는 지원하지 않습니다.

## Amazon MQ
### Features
- a managed message broker service for **Apache ActiveMQ** that makes it easy to set up and operate message brokers in the cloud. 
- Easy Connecting : industry-standard APIs and protocols for messaging (**JMS, NMS, AMQP, STOMP, MQTT, WebSocket**)
- **UseCase**
  - If you're using messaging with **existing applications** and want to move your messaging service to the cloud quickly and easily
  - It supports industry-standard APIs and protocols so you can switch from any standards-based message broker to Amazon MQ without rewriting the messaging code in your applications.
- **SQS/SNS UseCase**
  - If you are building **brand new applications** in the cloud
  - Amazon SQS and SNS are lightweight, fully managed message queue and topic services that scale almost infinitely and provide simple, easy-to-use APIs.

## Step Functions
-  serverless orchestration for modern applications

## Scenario
- You have a web application hosted in EC2 that consumes messages from an **SQS** queue and is integrated with SNS to send out an email to you once the process is complete. You received 5 orders but after a few hours, you saw 20 email notifications in your inbox.    
Which of the following could be the possible culprit for this issue?
  - **A) The web application is not deleting the messages in the SQS queue after it has processed them.**
  - Always remember that the messages in the SQS queue will continue to exist even after the EC2 instance has processed it, until you delete that message. You have to ensure that you delete the message after processing to prevent the message from being received and processed again once the visibility timeout expires.

- A multi-tiered application hosted in your on-premises data center is scheduled to be migrated to AWS. The application has a **message broker service** which uses **industry standard messaging APIs** and protocols that must be migrated as well, without rewriting the messaging code in your application.    
Which of the following is the most suitable service that you should use to move your messaging service to AWS?
  - **A) Amazon MQ**
  - Amazon MQ, Amazon SQS, and Amazon SNS are messaging services that are suitable for anyone from startups to enterprises. If you're using messaging with existing applications and want to move your messaging service to the cloud quickly and easily, it is recommended that you consider Amazon MQ. It supports industry-standard APIs and protocols so you can switch from any standards-based message broker to Amazon MQ without rewriting the messaging code in your application
  - Amazon SWF : is incorrect because this is a fully-managed state tracker and task coordinator service and not a messaging service

- A software company has resources hosted in AWS and on-premises servers. You have been requested to create a **decoupled architecture** for applications which make use of both resources.    
Which of the following options are valid? (Choose 2)
  - **A1) Use SWF to utilize both on-premise servers and EC2 instances for your decoupled application**
  - **A2) Use SQS to utilize both on-premise servers and EC2 instances for your decoupled application**
  - **Decoupled architecture** : computing architecture that enables computing components or layers to execute independently while still interfacing with each other.
  - **Amazon SQS** lets you move data between distributed application components and helps you decouple these components. **Amazon SWF** is a web service that makes it easy to coordinate work across distributed application components.

- You have built a web application that checks for new items in an S3 bucket once every hour. If new items exist, a message is added to an **SQS** queue. You have a fleet of EC2 instances which retrieve messages from the SQS queue, process the file, and finally, send you and the user an email confirmation that the item has been successfully processed. Your officemate uploaded one test file to the S3 bucket and after a couple of hours, you noticed that you and your officemate have 50 emails from your application with the same message.    
Which of the following is most likely the root cause why the application has sent you and the user multiple emails?
  - **A) Your application does not issue a delete command to the SQS queue after processiong the message, which is why this message went back to the queue and was processed multiple times.**

- You run a website which accepts high-quality photos and turns them into a downloadable video montage. The website offers a free account and a premium account that guarantees faster processing. All requests by both free and premium members go through a single **SQS** queue and then processed by a group of EC2 instances which generate the videos. You need to ensure that **the premium users** who paid for the service have **higher priority than your free members**.       
How do you re-design your architecture to address this requirement?
  - **A) Create an SQS queue for free members and another one for premium members. Configure your EC2 instances to consume message from the premium queue first and if it is empty, poll from the free member's SQS queue**

- You developed a web application and deployed it on a fleet of EC2 instances, which is **using Amazon SQS**. The requests are saved as messages in the SQS queue which is configured with the maximum message retention period.  However, **after thirteen days** of operation, the web application suddenly **crashed** and there are 10,000 unprocessed messages that are still waiting in the queue. Since you developed the application, you can easily resolve the issue but you need to send a communication to the users on the issue.     
What information will you provide and **what will happen to the unprocessed messages**?
  - **A) Tell the users that the application will be operational shortly and all received requests will be processed after the web application is restarted.**
  - The maximum message retention in SQS is 14 days 

- You are working for a startup as its AWS Chief Architect. You are currently assigned on a project that develops an online registration platform for events, which uses Simple Workflow for complete control of your orchestration logic. A decider ingests the customer name, address, contact number, and email address while the activity workers update the customer with the status of their online application status via email. Recently, you were having problems with your online registration platform which was solved by checking the decision task of your workflow.       
In **SWF**, what is the purpose of a **decision task**?
  - **A) It tells the decider the state the workflow execution**
  - **Workflow** : It defines all the activities in the workflow. 
  - **Activity Task** : It tells the worker to perform a function.
  - **Lambda Task** : It executes a Lambda Function
  - **Decision Task** : It tells a decider that the state of the workflow execution has changed    
  so that the decider can determine the next activity that needs to be performed.(**current workflow history**)
  - **Workflow Starter** : Any application that can initiate workflow executions.
  - **Activity Worker** : A program that receives activity tasks, performs them, and provides results back.
  - **Decider** : It schedules activity tasks, provides input data to the activity workers, processes events.
 
- A leading media company has an application hosted in an EBS-backed EC2 instance which uses **Simple Workflow Service (SWF)** to handle its sequential background jobs. The application works well in production and your manager asked you to also implement the same solution to other areas of their business.        
In which other scenarios can you **use both Simple Workflow Service (SWF) and Amazon EC2** as a solution? (Choose 2)
  - **A1) Managing a multi-step and multi-decision checkout process of an e-commerce mobile app.**
  - **A2) Orchestrating the execution of distributed business processes.**
  - **For a distributed session management for your mobile application** : is incorrect as **Elasticache**

- You are working as a Solutions Architect for a leading airline company where you are building a decoupled application in AWS using EC2, Auto Scaling group, S3 and SQS. You designed the architecture in such a way that the EC2 instances will consume the message from the SQS queue and will automatically scale up or down based on the number of messages in the queue.   
In this scenario, which of the following statements is false about **SQS**?
  - **A) Standard queues preserve the order of messages**
  - **Only FIFO queues can preserve the order of messages and not standard queues.**

- A manufacturing company has EC2 instances running in AWS. The EC2 instances are configured with Auto Scaling. There are a lot of requests being lost because of too much load on the servers. The Auto Scaling is launching new EC2 instances to take the load accordingly yet, there are still some requests that are being lost.    
Which of the following is the MOST suitable solution that you should implement to **avoid losing recently submitted requests**?
  - **A) Use an SQS queue to decouple the application components**
  - **Keeping one extra Spot EC2 instance always ready in case a spike occurs or using larger instances for your application** : are incorrect because using a Spot or a larger EC2 instance would not prevent data from being lost in case of a larger spike. You can take advantage of the durability and elasticity of SQS to keep the messages available for consumption by your instances.
  - **Pre-warming your Elastic Load Balancer** : is incorrect because it would be difficult to predict how much traffic your load balancer will be receiving in a certain period of time, which corresponds to how long you will pre-warm the load balancer. It is still better to use SQS in this scenario rather than re-configuring your load balancer.
 
- A customer is transitioning their **ActiveMQ messaging broker service** onto the AWS cloud in which they require an alternative asynchronous service that **supports NMS and MQTT messaging protocol**. The customer does not have the time and resources needed to recreate their messaging service in the cloud. The service has to be highly available and should require almost no management overhead.    
Which of the following is the most suitable service to use to meet the above requirement?
  - **A) Amazon MQ**
- A tech company is currently using **Amazon Simple Workflow (SWF)** service with a default configuration for their order processing system. The system works fine but you noticed that some of the **orders seem to be stuck for almost 4 weeks**.
What could be the possible reason for this?
  - **A) It is because SWF is waiting human input from an activity task.**
  - 기본적으로 각 워크 플로 실행은 Amazon SWF에서 최대 1 년 동안 실행될 수 있습니다. 즉, 워크 플로에 유휴 상태가되는 수동 작업이 필요한 일부 작업이있을 수 있습니다.
  - Amazon SWF는 워크플로 실행이 오랫동안 유휴 상태(idle)로 있어도 특별한 조치를 취하지 않습니다. 유휴 실행에 대해서는 귀하가 설정한 시간제한이 적용됩니다. 예를 들어, 하나의 실행을 수행할 수 있는 최대 시간을 1일로 설정하는 경우 유휴 실행이 1일 제한을 초과하면 시간 초과가 됩니다. 하나의 실행이 진행될 수 있는 시간에 대한 Amazon SWF의 제한(1년)도 유휴 실행에 적용됩니다.

- You have a web-based order processing system which is currently using a queue in **Amazon SQS**. The support team noticed that there are a lot of cases where **an order was processed twice**. This issue has caused a lot of trouble in your processing and made your customers very unhappy. Your IT Manager has asked you to ensure that this issue does not happen again.
What can you do to prevent this from happening again in the future?
   - **A) Replace Amazon SQS and instead, use Amazon Simple Workflow service**
   - Amazon SWF에는 작업 배정을 보장하는 유용한 기능이 있습니다. 이를 통해 작업 배정이 중복 없이 한 번만 이루어지도록 보장할 수 있습니다. 따라서 특정 활동 유형에 대해 여러 워커가 있는 경우라도(또는 한 디사이더에 여러 인스턴스가 있는 경우), Amazon SWF에서 하나의 특정 작업은 하나의 워커(또는 하나의 디사이더 인스턴스)에게만 전달될 것입니다. 또한 Amazon SWF에서는 한 워크플로우 실행에 대해 한 번에 최대 하나의 의사 결정 작업만 보관합니다. 즉, 여러 디사이더 인스턴스를 실행하는 경우에도 동일한 실행에 두 인스턴스가 동시에 작동하지는 않습니다. 이러한 기능을 통해 워크플로를 조정하면 작업의 중복, 손실, 충돌 등에 대해 걱정할 필요가 없습니다.
   - **Altering the retention period in Amazon SQS** :  is incorrect because the **retention period** simply specifies if the Amazon SQS should **delete the messages** that have been in a queue for a certain period of time.
   - **Altering the visibility timeout of SQS** : is incorrect. 제한 시간 초과는 Amazon SQS가 메시지를 소비하는 다른 구성 요소에서 메시지를 수신 및 처리하지 못하도록 하는 기간. 표준 대기열(Standard queues)에서 제한 시간 초과는 메시지가 두 번 수신되지 않도록 보장하지 않습니다. 
    - **SQS At-Least-Once Delivery** : Amazon SQS는 중복성과 고가용성을 위해 여러 대의 서버에 메시지 사본을 저장합니다. 드물게는 메시지 사본을 받거나 삭제할 때 메시지 사본을 저장하는 서버 중 하나를 사용할 수 없을 수도 있습니다.    
이 문제가 발생할 경우 사용 불가능한 해당 서버에서 메시지의 사본이 삭지되지 않으며, 메시지를 받을 때 해당 메시지 사본을 다시 가져올 수 있습니다. 따라서 애플리케이션이 idempotent가 되도록 설계해야 합니다(다시 말해 동일한 메시지를 두 번 이상 처리할 경우 부정적인 영향을 받지 않아야 함).

- A financial company instructed you to automate the recurring tasks in your department such as patch management, infrastructure selection, and data synchronization to improve their current processes. You need to have a service which can **coordinate multiple AWS services into serverless workflows**.       
Which of the following is the most cost-effective service to use in this scenario?
  - **A) AWS Step Functions**
  - **Step Functions** makes it easy to coordinate applications and microservices using **visual workflows**.
  - **SWF** : is incorrect because this is a fully-managed state tracker and task coordinator service. It does not provide serverless orchestration to multiple AWS resources.

- The start-up company that you are working for has a batch job application that is currently hosted on an EC2 instance. **It is set to process messages from a queue created in SQS with default settings**. You configured the application to process the messages once a week. After 2 weeks, you **noticed that not all messages are being processed** by the application.    
What is the root cause of this issue?
  - **A) Amazon SQS has automatically deleted the messages that have been in a queue for more than the maximum message retention period.**
  - Amazon SQS는 최대 메시지 보존 기간(retention period)보다 오래 대기열에 있었던 메시지를 자동으로 삭제합니다. **기본 메시지 보존 기간은 4 일**입니다. 대기열이 기본 설정으로 구성되어 있고 일괄 작업 응용 프로그램은 일주일에 한 번만 메시지를 처리하므로 4 일 이상 대기열에있는 메시지는 삭제됩니다. 이것이 문제의 근본 원인입니다.    
  이 문제를 해결하려면 SetQueueAttributes 작업을 사용하여 메시지 보존 기간을 최대 14 일로 늘릴 수 있습니다.

- Your company has a web-based ticketing service that utilizes Amazon SQS and a fleet of EC2 instances. The EC2 instances that consume messages from the SQS queue are configured to poll the queue as often as possible to keep end-to-end throughput as high as possible. You noticed that **polling the queue in tight loops is using unnecessary CPU cycles, resulting in increased operational costs due to empty responses.**        
In this scenario, what will you do to make the system more cost-effective?
  - **A) Configure Amazon SQS to use long polling by setting the ReceiveMessageWaitTimeSeconds to a number greater than zero.**
  - Amazon SQS는 기본적으로 짧은 폴링을 사용하여 가중치 가중 분포를 기반으로 서버의 하위 집합 만 쿼리하여 응답에 포함 할 수있는 메시지가 있는지 확인합니다. **짧은 폴링(short polling)은 더 높은 처리량이 필요한 시나리오에서 작동**합니다. 그러나 대신 긴 폴링(long polling)을 사용하도록 큐를 구성하여 비용을 줄일 수도 있습니다.    
  **ReceiveMessageWaitTimeSeconds**는 **Short 또는 Long 폴링을 사용 중인지 여부를 결정하는 큐 속성**입니다. 기본적으로이 값은 0이며 이는 짧은 폴링을 사용하고 있음을 의미합니다. 0보다 큰 값으로 설정되면 Long polling입니다.
  - **SQS Long Polling**
    - 긴 폴링은 Amazon SQS 큐로 전송 된 ReceiveMessage 요청에 대한 응답으로 회신 할 수있는 메시지가 없을 때 빈 응답 수를 줄이고 , 큐에서 메시지를 사용할 수있지만 응답에는 포함되지 않을 때 false 빈 응답을 제거하여 Amazon SQS 사용 비용을 절감합니다. 
    - 긴 폴링은 Amazon SQS가 응답을 보내기 전에 대기열에서 메시지를 사용할 수있을 때까지 대기 할 수 있도록하여 빈 응답 수를 줄입니다. 연결 시간이 초과되지 않으면 ReceiveMessage 요청에 대한 응답에는 사용 가능한 메시지 중 하나 이상 (ReceiveMessage 작업에 지정된 최대 메시지 수까지)이 포함됩니다.
    - 긴 폴링은 제한된 수가 아닌 모든 서버를 쿼리하여 빈 응답을 제거합니다. 긴 폴링은 메시지를 사용할 수있게되면 즉시 메시지를 반환합니다.
 
 - An investment bank has a distributed batch processing application which is hosted in an Auto Scaling group of Spot EC2 instances with an SQS queue. You configured your components to use client-side buffering so that the calls made from the client will be buffered first and then sent as a batch request to SQS. What is **a period of time during which the SQS queue prevents other consuming components from receiving and processing a message**?
  - **A) Visibility Timeout**
  - 제한 시간 초과(Visibility Timeout)는 **Amazon SQS가 메시지를 소비하는 다른 구성 요소에서 메시지를 수신 및 처리하지 못하도록 하는 기간**입니다.
  - 소비자가 대기열에서 메시지를 수신하고 처리하면 메시지는 계속 대기열에 있습니다. Amazon SQS는 메시지를 자동으로 삭제하지 않습니다. Amazon SQS는 분산 시스템이므로 소비자가 메시지를 실제로 받는지 보장할 수 없습니다(예를 들어, 연결 문제 또는 소비자 애플리케이션 문제로 인해). 또한, 소비자는 메시지를 수신하고 처리한 후 대기열에서 이 메시지를 삭제해야 합니다.    
  메시지를 수신한 직후에는 메시지가 대기열에 그대로 있습니다. **다른 소비자가 메시지를 다시 처리할 수 없도록 하기 위해 Amazon SQS에서는 다른 소비자가 Amazon SQS에서 메시지를 수신 및 처리할 수 없는 기간인 제한 시간 초과를 설정**합니다. 메시지의 기본 제한 시간은 30초입니다. 최소값은은 0초입니다. 최대는 12시간입니다.
  
  - An e-commerce application is using a **fanout messaging pattern** for its order management system. For every order, it sends an Amazon SNS message to an SNS topic, and the message is replicated and pushed to multiple Amazon SQS queues for parallel asynchronous processing. A Spot EC2 instance retrieves the message from each SQS queue and processes the message. There was an incident that while an EC2 instance is currently processing a message, **the instance was abruptly terminated, and the processing was not completed in time**.    
In this scenario, **what happens to the SQS message**?
  - **A) When the message visivility timeout expires, the message becomes available for processing by other EC2 instances.**
  - **"팬아웃" 시나리오**는 Amazon SNS 메시지가 주제에 전송 및 복제되어 다중 Amazon SQS 대기열, HTTP 엔드포인트 또는 이메일 주소로 푸시되는 경우를 말합니다. 따라서 평행한 비동시적 처리가 가능합니다. 예를 들어, 사용자는 제품에 대한 **주문이 생성될 때 주제에 Amazon SNS 메시지를 전송**하는 애플리케이션을 개발할 수 있습니다. 그러면 **해당 주제를 구독하는 Amazon SQS 대기열**은 새 주문에 대해 동일한 **알림을 수신**합니다. 대기열 중 하나에 연결된 Amazon EC2 서버 인스턴스는 주문의 처리 또는 이행을 처리할 수 있으며, 그동안 다른 서버 인스턴스는 수신된 모든 주문을 분석하기 위해 데이터 웨어하우스에 연결할 수 있습니다.
  - 소비자가 대기열에서 메시지를 수신하고 처리하면 메시지는 계속 대기열에 있습니다. **Amazon SQS는 메시지를 자동으로 삭제하지 않습니다**. Amazon SQS는 분산 시스템이므로 소비자가 메시지를 실제로 받는지 보장할 수 없습니다(예를 들어, 연결 문제 또는 소비자 애플리케이션 문제로 인해). 또한, **소비자는 메시지를 수신하고 처리한 후 대기열에서 이 메시지를 삭제해야 합니다**.    
  메시지를 수신한 직후에는 메시지가 대기열에 그대로 있습니다. **다른 소비자가 메시지를 다시 처리할 수 없도록 하기 위해 Amazon SQS에서는 다른 소비자가 Amazon SQS에서 메시지를 수신 및 처리할 수 없는 기간인 제한 시간 초과를 설정**합니다. 메시지의 기본 제한 시간은 30초입니다. 최소값은은 0초입니다. 최대는 12시간입니다.
