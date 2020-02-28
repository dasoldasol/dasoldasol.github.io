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
