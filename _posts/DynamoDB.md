## DynamoDB
### Point 
- Amazon DynamoDB는 어떤 규모에서도 10밀리초 미만의 성능을 제공하는 키-값 및 문서 데이터베이스입니다. 완전관리형의 내구성이 뛰어난 **다중 리전(cross region replication)**, 다중 마스터 데이터베이스로서, 인터넷 규모 애플리케이션을 위한 보안, 백업 및 복원, 인 메모리 캐싱 기능을 기본적으로 제공합니다.
- **대규모 성능 지원** 
  - **key-value data model** : 관계형 데이터베이스에서처럼 테이블 스키마를 재정의할 필요 없이 비즈니스 요구사항이 변경되면 테이블을 쉽게 조정할 수 있습니다.
  - **DynamoDB Accelerator**를 사용하여 지연 시간을 마이크로초 수준으로 최소화
  - 전역 테이블(global table)을 사용하여 전역 복제(global replication) 자동화
  - **DynamoDB Streams**를 사용하여 실시간 데이터 처리 : 항목 변경 사항이 있으면 시간 순서에 따라 이 정보를 수집하여 최대 24시간 동안 로그에 저장
- **서버리스** : DynamoDB는 서버리스이므로, 서버를 프로비저닝하거나 패치를 적용하거나 관리할 필요가 없으며, 소프트웨어를 설치하거나 관리하거나 운영할 필요도 없습니다. DynamoDB는 용량에 맞게 테이블을 자동으로 확장하고 축소하며 성능을 유지합니다. 
  - **읽기/쓰기 용량 모드** : DynamoDB는 각 테이블에 대해 온디맨드와 프로비저닝의 용량 모드를 제공합니다. 사용률이 높을지 확신할 수 없어서 예측이 어려운 워크로드의 경우, 온디맨드 용량 모드를 사용하면 용량을 관리하고 사용량에 대해서만 비용을 지불할 수 있습니다. 프로비저닝 용량 모드를 사용하는 테이블에는 읽기 및 쓰기 용량을 설정해야 합니다. 지정한 프로비저닝 용량을 충분히 사용할 것으로 확신할 경우에는 프로비저닝 용량 모드가 더 비용 효율적입니다.
  - **온디맨드 모드** : 온디맨드 용량 모드를 사용하는 테이블의 경우, DynamoDB는 워크로드가 이전에 도달했던 트래픽 수준으로 증가하거나 감소하면서 즉시 워크로드를 수용합니다. 워크로드 트래픽 수준이 새로운 피크를 기록할 경우에는 DynamoDB가 워크로드를 수용하기 위해 신속하게 조정을 수행합니다.** : 
  - **Auto Scaling** : **프로비저닝 용량**을 사용하는 테이블의 경우에는 DynamoDB가 애플리케이션의 성능 사용량을 모니터링하여 이전에 설정한 용량을 기반으로 처리량과 스토리지를 자동으로 조정합니다
  - **Trigger** : with Lambda
- 극도의 동시성(concurrency), 트래픽 급증(traffic spike)에 대해 인터넷 규모의 사용사례를 처리하면서 10밀리초 미만의 일관된 지연 시간 유지.

### UseCase
- **서버리스 웹 앱** : S3 - API Gateway - Lambda - DynamoDB
- **모바일 백엔드** : DynamoDB 및 AWS AppSync를 사용하면 실시간 업데이트, 오프라인 데이터 액세스, 내장된 충돌 해결을 통한 데이터 동기화를 지원하는 대화형 모바일 및 웹 앱을 구축할 수 있습니다.
- **마이크로 서비스** : DynamoDB를 서버리스 데이터 스토어로 사용. Kinesis - Lambda - DynamoDB
- **광고기술** : RTB 및 광고 타게팅의 사용자 프로필 스토어/ 사용자 이벤트, 클릭스트림, 노출 데이터 스토어 / 자산용 메타데이터 스토어 / 인기 항목 캐시
- **게임** : 게임 상태 / 플레이어 데이터 스토어 / 플레이어 세션 기록 데이터 스토어 / 순위표
- **소매** : 장바구니 / 워크플로엔진 / 인벤토리 추적 및 주문 처리 / 고객 프로필
- **은행** : 사용자 트랜잭션 / 이벤트 중심의 트랜잭션 처리 / 사기 탐지 / 메인프레임 오프로딩 및 변경 데이터 캡처
- **미디어** : 미디어 메타데이터 스토어 / 사용자 데이터 스토어 / 디지털 권한 관리 데이터 스토어 
- **소프트웨어** : 사용자 콘텐츠 메타데이터 스토어 / 관계 그래프 데이터 스토어 / 메타데이터 캐시 / 승차 추적 데이터 스토어 / 사용자, 차량 및 운전자 데이터 스토어 / 사용자 어휘 데이터 스토어 

### Features 
- fully managed **NoSQL** database service 
- synchronously **replicates data across 3 facilities** in an AWS Region, with high availability and data durability 
- runs exclusively on **SSD** to provide high I/O performance
- provides **provisioned table reads and writes**
- **automatically partitions, reallocates and re-partitions the data** and provisions additional server capacity as data changes
- **Eventual Consistent(by default) / Strongly Consistent** option during an read option
- supports **cross region replication** using DynamoDB streams : leverages Kinesis and provides **time-ordered sequence of item-level changes** and can help for lower RPO, lower RTO disaster Recovery
- supports **triggers**

### Indexes
- creates and maintains **indexes for the primary key attributes** for efficient access of data in the table 
- **Secondary indexes**
  - allows querying attributes other then the primary key attributes without impacting performance 
  - automatically maintained as **sparse objects**
  
## Features 
- Stored on SSD storage (serverless)
- Spread Across 3 data centers
- Eventual Consistent Reads(default) : do NOT update data within 1 second
- Strongly Consistent Reads : DO update data within 1 second

## Scenarios 
- **A company is developing a highly available web application using stateless web servers. Which
services are suitable for storing session state data? (Select TWO.)**       
        
  A. CloudWatch       
  **B. DynamoDB**       
  C. Elastic Load Balancing       
  **D. ElastiCache**        
  E. Storage Gateway        
    - Both DynamoDB and ElastiCache provide high performance storage of key-value pairs.
    - CloudWatch and ELB are not storage services 
    - Storage Gateway is a hybrid storage service that enables on-premises applpications to use cloud storage
 
- **You are working as a Solutions Architect for a technology company which is in the process of migrating their applications to AWS. One of their systems requires a database that can scale globally and can handle frequent schema changes. The application should not have any downtime or performance issues whenever there is a schema change in the database. It should also provide low-latency response to high-traffic queries.    
Which is the most suitable database solution to use to achieve this requirement?**
  - **A) Amazon DynamoDB**
  - Scema flexibility : Since the scenario requires that the **schema** changes frequently, then you have to puck a database which provides a **non-rigid** and flexible way of adding or removing new types of data.(NoSQL database)
  
- A popular social network is hosted in AWS and is using a **DynamoDB** table as its database. There is a requirement to implement a 'follow' feature where users can subscribe to **certain updates** made by a particular user and be notified via email. Which of the following is the most suitable solution that you should implement to meet the requirement?
  - **A) Enable DynamoDB Stream and create an AWS Lambda trigger, as well as the IAM role which contains all of the permissions that the Lambda function will need at runtime. The data from the stream record will be processed by the Lambda function which will then publish a message to SNS Topic that will notify the subscribers via email.**
  - **Dynamo Stream** : an ordered flow of information about changes to items in an Amazon DynamoDB table. When you enable a stream on a table, DynamoDB captures information about every modification to data items in the table.    
  Amazon DynamoDB is integrated with AWS Lambda so that you can create **triggers**-pieces of code that automatically respond to events in DynamoDB Streams. With triggers, you can build applications that react to data modifications in DynamoDB tables.
  - DynamoDB Accelerator (DAX) feature is primarily used to significantly improve the in-memory read performance of your database, and not to capture the time-ordered sequence of item-level modifications.

- A Docker application, which is running on an Amazon ECS cluster behind a load balancer, is heavily using DynamoDB. You are instructed to improve the database performance by **distributing the workload evenly** and using the provisioned throughput efficiently.   
Which of the following would you consider to implement for your DynamoDB table?
  - **A) Use partition keys with high-cardinality attributes, which have a large number of distinct values for each item**
  - The optimal usage of a table's provisioned throughput depends on the partition-key design. The more distinct partition key values that your workload accesses, the more those requests will be spread across the partitioned space.

- A popular mobile game uses CloudFront, Lambda, and DynamoDB for its backend services. The player data is persisted on a DynamoDB table and the static assets are distributed by CloudFront. However, there are a lot of **complaints** that saving and retrieving player information is **taking a lot of time**.       
To improve the game's performance, which AWS service can you use to **reduce DynamoDB response times from milliseconds to microseconds**?
  - **A) Amazon DynamoDB Accelerator(DAX)**
  - **DynamoDB Accelerator (DAX)** : a fully managed, highly available, **in-memory cache** that can reduce Amazon DynamoDB response times from milliseconds to microseconds    
  - ElastiCache : is incorrect because it cannot reduce time from milliseconds to microseconds
  
- As a Junior Software Engineer, you are developing a hotel reservations application and are given the task of improving the database aspect of the app. You found out that RDS does not satisfy the needs of your application because it does not scale as easily compared with DynamoDB. You need to demonstrate to your Senior Software Engineer **the advantages of using DynamoDB over RDS**.       
What are the **valid use cases for Amazon DynamoDB**? (Choose 2)
  - **A1) Storing metadata for Amazon S3 objects**
  - **A2) Managing web sessions**
  - **Storing metadata for Amazon S3 objects** : is correct because the Amazon DynamoDB stores structured data indexed by primary key and allow low latency read and write access to items ranging from 1 byte up to 400KB. Amazon S3 stores unstructured blobs and is suited for storing large objects up to 5 TB. In order to optimize your costs across AWS services, **large objects or infrequently accessed data sets should be stored in Amazon S3, while smaller data elements or file pointers (possibly to Amazon S3 objects) are best saved in Amazon DynamoDB.**    
To speed up access to relevant data, you can pair Amazon S3 with a search engine such as Amazon CloudSearch or a database such as Amazon DynamoDB or Amazon RDS. In these scenarios, Amazon S3 stores the actual information, and the search engine or database serves as the repository for associated **metadata such as the object name, size, keywords**, and so on. Metadata in the database can easily be indexed and queried, making it very efficient to locate an object’s reference by using a search engine or a database query. This result can be used to **pinpoint and retrieve the object itself from Amazon S3**.
  - **Managing web sessions** : is correct because the **DynamoDB Time-to-Live (TTL) mechanism** enables you to manage web sessions of your application easily. It lets you set a specific timestamp to delete expired items from your tables. **Once the timestamp expires, the corresponding item is marked as expired and is subsequently deleted** from the table. By using this functionality, you do not have to track expired data and delete it manually. TTL can help you reduce storage usage and reduce the cost of storing data that is no longer relevant.
  - **Storing BLOB data** : is incorrect because BLOB(Binary Large Object) data is too large to be put into a NoSQL database 

- As an AWS Cloud Consultant working for a record company, you are building an application that will **store both key-value store and document models like band ID, album ID, song ID and composer ID**.       
Which AWS service will suit your needs for your application?
  - **A) DynamoDB**
  - Amazon DynamoDB is a fast and flexible NoSQL database service. It supports both document and key-value store models. used for mobile, web, gaming, ad tech, IoT, and many other applications.
  - ![dynamodb](./image/dynamodb.png)

- You are working as a Solutions Architect for a tech company where you are instructed to build a web architecture using On-Demand EC2 instances and a database in AWS. However, due to **budget constraints**, the company instructed you to choose a database service in which they **no longer need to worry about** database management tasks such as hardware or software provisioning, setup, configuration, **scaling** and backups.   
Which database service in AWS is best to use in this scenario?
  - **A) DynamoDB**
  - you simply create a database table, set your target utilization for Auto Scaling, and let the service handle the rest. You no longer need to worry about database management tasks such as hardware or software provisioning, setup and configuration, software patching, operating a reliable, distributed database cluster, or partitioning data over multiple instances as you scale. DynamoDB also lets you backup and restore all your tables for data archival, helping you meet your corporate and governmental regulatory requirements.
  - **RDS** : In RDS, you still have to manually scale up your resources and create Read Replicas to improve scalability while in DynamoDB, this is automatically done. RDS is incorrect because this is just a "managed" service and not "fully managed". This means that you still have to handle the backups and other administrative tasks such as when the automated OS patching will take place.
  - **Amazon ElastiCache** : is incorrect because although ElastiCache is fully managed, it is not a database service but an In-Memory Data Store.
  - **Redshift** : is incorrect because although this is fully managed, it is not a database service but a Data Warehouse.

- You currently have an Augment Reality (AR) mobile game which has a serverless backend. It is using a **DynamoDB table** which was launched using the AWS CLI to store all the user data and information gathered from the players and a **Lambda function** to pull the data from DynamoDB. The game is being used by millions of users each day to read and store data.     
How would you design the application to **improve its overall performanc**e and make it **more scalable** while keeping the **costs low**? (Choose 2)
  - **A1) Enable DynamoDB Accelerator(DAX) and ensure that the Auto Scaling is enabled and increase the maximum provisioned read and write capacity.**
  - **A2) Use API Gateway in conjunction with Lambda and turn on the caching on frequently accessed data and enable DynamoDB global replication**
  - DAX does all the heavy lifting required to add in-memory acceleration to your DynamoDB tables
  - Amazon API Gateway lets you create an API that acts as a "front door" for applications to access data, business logic, or functionality from your back-end services, such as code running on AWS Lambda. 
  - **Configure CloudFront with DynamoDB as the origin; cache frequently accessed data on client device using ElastiCache** : is incorrect because **CloudFront and DynamoDB are imcompatible**

- Your manager has asked you to deploy a mobile application that can collect votes for a popular singing competition. Millions of users from around the world will submit votes using their mobile phones. These votes must be collected and stored in a highly scalable and highly available data store which will be queried for real-time ranking.    
Which of the following combination of services should you use to meet this requirement?
  - **A) Amazon DynamoDB and AWS AppSync**
  - **DynamoDB** is durable, scalable, and highly available data store which can be used for **real-time tabulation**. You can also use **AppSync** with DynamoDB to make it easy for you to build collaborative apps that keep **shared data updated in real time**.

- A popular augmented reality (AR) mobile game is heavily using a RESTful API which is hosted in AWS. The API uses Amazon API Gateway and a DynamoDB table with a preconfigured read and write capacity. Based on your systems monitoring, the DynamoDB table begins to throttle requests during high peak loads which causes the slow performance of the game.     
Which of the following can you do to improve the performance of your app? 
  - **A)Use DynamoDB Auto Scaling**
  - DynamoDB는 응용 프로그램에 필요한 읽기 및 쓰기 용량을 설정할 수 있는 프로비저닝 용량 모델을 제공합니다. 이로 인해, 용량 걱정 없이 간단한 API 호출 또는 AWS 관리 콘솔에서 버튼 클릭으로 테이블에 대한 용량을 변경할 수 있습니다.    
이에 더 나아가 오늘 DynamoDB에 자동 스케일링(Auto Scaling)을 도입하여 테이블 및 글로벌 보조 인덱스 용량 관리를 자동화 기능을 출시합니다. 이는 원하는 대상 활용 방법에 대해  읽기 및 쓰기 용량의 상한 및 하한선을 설정하면 됩니다. 그런 다음 DynamoDB는 Amazon CloudWatch 알림을 사용하여 처리량 소비를 모니터링 한 다음 필요할 때 프로비저닝 된 용량을 조정합니다. Auto Scaling은 모든 새로운 테이블과 인덱스에 대해 기본적으로 설정 되며, 기존 테이블과 인덱스에도 구성 할 수 있습니다.    
DynamoDB Auto Scaling은 테이블 및 인덱스를 모니터링하여 응용 프로그램 트래픽의 변화에 따라 처리량을 자동 조정합니다. 이를 통해 DynamoDB 데이터를 보다 쉽게 관리하고 응용 프로그램의 가용성을 극대화하며 DynamoDB 비용을 줄일 수 있습니다.

- A leading IT consulting company has an application which processes a large stream of financial data by an Amazon ECS Cluster then stores the result to a DynamoDB table. You have to design a solution to **detect new entries in the DynamoDB table then automatically trigger a Lambda function** to run some tests to verify the processed data.    
What solution can be easily implemented to alert the Lambda function of new entries while requiring minimal configuration change to your architecture?
  - **A) Enable DynamoDB Streams to capture table activity and automatically trigger the Lambda function**

- In a startup company you are working for, you are asked to design a web application that requires a NoSQL database that has no limit on the storage size for a given table. The startup is still new in the market and it has very limited human resources who can take care of the database infrastructure.    
Which is the most suitable service that you can implement that provides a **fully managed**, scalable and highly available NoSQL service?
  - **A)DynamoDB**
  - "**fully managed**(완전 관리)"라는 용어는 Amazon이 서비스의 기본 인프라를 관리하므로 서비스를 지원하거나 유지 관리하기 위해 추가 인적 자원이 필요하지 않음을 의미합니다. 따라서 Amazon DynamoDB가 정답입니다. Amazon RDS는 관리형 서비스이지만 데이터베이스의 기본 서버를 유지 관리 및 구성 할 수있는 옵션이 있으므로 "완전히 관리되지는 않음"을 기억하십시오.
  - **Neptune** : graph database
  - **Aurora** : relational database
