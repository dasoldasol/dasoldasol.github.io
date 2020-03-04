## DynamoDB
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
