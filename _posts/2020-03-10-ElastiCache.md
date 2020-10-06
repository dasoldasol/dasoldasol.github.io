---
title: "ElastiCache"
excerpt: "AWS ElastiCache"
toc: true
toc_sticky: true
categories:
  - AWS
modified_date: 2020-03-10 10:36:28 +0900
---
## ElastiCache CheatSheet
- **in-memory caching** to deploy and run Memcached or Redis protocol-compliant cache clusters
- can be used state management to keep the web applications stateless

### ElastiCache with Redis
- like RDS, supports **Multi-AZ, Read Replicas and Snapshots**
- Read Replicas are created across AZ within same region using **Redis's asynchronous replication technology**
- Multi-AZ differs from RDS as there is no standby
  - but **if the primary go down, a Read Replica is promoted as primary**
- **Read Replicas cannot span regions**
- cannot be scale out and if scaled up cannot be scaled down 
- allows **snapshots for backup and restore**
- **AOF(Append Only Files)** can be enabled for **recovery scenarios**, to recover the data in case the node fails or service crashes. But it does NOT help in case the hardware fails 
- **Fault Tolerance** : Enable **Redis Multi-AZ**

### ElastiCache with Memcached
- can be scaled up by increasing size and scaled out by adding nodes
- nodes can **span across multiple AZs** within the same region
- **cached data is spread across the nodes**, and a node failure will always result in some data loss from the cluster 
- supports **auto discovery**
- **every node shoud be homogenous** and of same instance type 

### ElastiCache Redis vs. Memcached
|Redis|Memcached|
|:-------:|:-------:|
|Complex data objects|Simple key value storage|
|persistent|non persistent, pure caching|
|automatic failover with Multi-AZ|Multi-AZ not supported|
|scaling using Read Replicas|scaling using multiple nodes|
|backup & restore supported|not supported|
 
## Features
- Use Elasticache to increase database and web application performance
- Redis : Multi-AZ, backups and retores
- Memcached : if you need to scale horizontally

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

- **You are designing a banking portal which uses Amazon ElastiCache for Redis as its distributed session management component. Since the other Cloud Engineers in your department have access to your ElastiCache cluster, you have to secure the session data in the portal by requiring them to enter a password before they are granted permission to execute Redis commands.    
As the Solutions Architect, which of the following should you do to meet the above requirement?**
  - **A) Authenticate the users using Redis AUTH by creating a new Redis Cluster with both the `--transit-encryption-enabled` and `--auth-token` parameters enabled.**
  - To require that users enter a password on a password-protected Redis server, include the parameter `--auth-token` with the correct password
  - Enabling the `AtRestEncryptionEnabled` parameter : the Redis At-Rest Encryption ONLY secures the data inside.

- A startup based in Australia is deploying a new two-tier web application in AWS. The Australian company wants to store their most frequently used data in an **in-memory data store to improve the retrieval and response time** of their web application.    
Which of the following is the most suitable service to be used for this requirements?
  - **A) Amazon ElastiCache**
  - ElastiCache makes it easy to deploy, operate, and scale an **in-memory** data store or cache. The service improves the performance of web applications by allowing you to **retrieve** information from fast, managed, in-memory data stores, instead of slow disk-based DBs.

- Your web application is relying entirely on slower disk-based databases, causing it to perform slowly. To improve its performance, you integrated an in-memory data store to your web application using ElastiCache. **How does Amazon ElastiCache improve database performance?**
  - **A) By caching database query results.**
  - The primary purpose of an in-memory key-value store is to provide ultra-fast (submillisecond latency) and inexpensive access to copies of data. Most data stores have areas of data that are frequently accessed but seldom updated. Additionally, querying a database is always slower and more expensive than locating a key in a key-value pair cache. Some database queries are especially expensive to perform, for example, queries that involve joins across multiple tables or queries with intensive calculations.    
By caching such query results, you pay the price of the query once and then are able to quickly retrieve the data multiple times without having to re-execute the query.
  - **DynamoDB Accelerator (DAX)** : provides an in-memory cache that delivers up to 10x performance improvement from milliseconds to microseconds or even at millions of requests per second
  - **CloudFront** : securely delivers data to customers globally with low latency and high transfer speeds
  - **RDS Read Replica** : reduces the load on your database by routing read queries from your applications to the Read Replica

- You are designing an online banking application which needs to have a **distributed session** data management. Currently, the application is hosted on an Auto Scaling group of On-Demand EC2 instances across multiple Availability Zones with a Classic Load Balancer that distributes the load.        
Which of the following options should you do to satisfy the given requirement?
  - **A) Use Amazon ElastiCache**
  - **Classic Load Balancer Sticky Sessions** is incorrect : Classic Load Balancer의 고정 세션 기능은 세션 관리도 제공 할 수 있지만 이 기능에는 장애 발생시 장애가 발생한 노드에 상주 한 세션이 유실될 수 있는 등의 제한 사항이 있습니다. Auto Scaling이 시작될 때 웹 서버의 수가 변경되는 경우 특정 서버에 활성 세션이 있을 수 있으므로 트래픽이 웹 서버에 불균형하게 분산 될 수 있습니다. 제대로 완화되지 않으면 응용 프로그램의 확장성을 방해 할 수 있습니다. 따라서 고정 세션은 ElastiCache와 비교하여 확장 가능하거나 "분배되지"않습니다.
  - Redis 및 Memcached와 같은 In memory Key / Value Store를 사용하여 웹 서버에서 HTTP 세션 데이터를 관리 할 수 있습니다. Redis는 데이터베이스, 캐시 및 메시지 브로커로 사용되는 오픈 소스 In memory data structure store입니다. Memcached는 데이터베이스 호출, API 호출 또는 페이지 렌더링 결과에서 작은 임의의 데이터 (문자열, 객체)를위한 In memory Key-Value Store입니다.       
  AWS에서는 완전 관리 형 Redis 및 Memcached 서비스를 제공하는 Amazon ElastiCache를 사용하여 웹 애플리케이션의 세션 데이터를 관리하고 저장할 수 있습니다.
