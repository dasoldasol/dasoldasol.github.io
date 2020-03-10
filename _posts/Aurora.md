## Aurora CheatSheet 
### Features 
- A **relational database engine** that combines the speed and realiability of high-end commercial databases with the simplicity and cost-effective of open source databases 
- Fully managed, **MySQL/PostgreSQL compatible**, relational database engine
  - applications developed with MySQL can switch to Aurora with no changes
- Delivers up to **5x performance** of MySQL without requiring any changes to most MySQL applications 
- Aurora PostgreSQL delivers up to 3x performance of PostgreSQL
- RDS managed the Aurora databases, handling time-consiming tasks such as provisioning, patching, backup, recovery, failure detection and repair
- Based on the database usage, Aurora **storage will automatically grow**, from **10GB to 64GB**

### High Availability and Replication
- Data durability and reliability by **replicating** the database volume **6 ways across 3 AZs in a SINGLE region**
  - Aurora automatically divides the database volume into 10GB segments spread across many disks
  - Each 10GB chunk of your database volume is replicated 6 ways, across 3 Availability Zones
- **RDS databases**(MySQL, Oracle..) have the data in a **single AZ**
- Transparently handle the loss of up to 2 copies of data without affecting database write availability and up to 3 copies without affecting read availability 
- Aurora **Storage is also self-healing**. Data blocks and disks are continuously scanned for errors and repaired automatically
- **Aurora Replicas** 
  - share the same underlying volume as primary instance. Updates made by the primary are visible to all Aurora Replicas
  - As Aurora Replicas share the same data volume as the primary instance, there is virtually **no replication lag**.
  - Any Aurora Replica can be promoted to become primary without any data loss and therefore can be used for **enhancing fault tolerance** in the event of a primary DB Instance failure 
  - To increase database availability, 1~15 replicas can be created in any of 3 AZs, and RDS will automatically include them in failover primary selection in the event of a database outage.
  
### Security 
- Aurora uses **SSL(AES-256) to secure the connection** between the database instance and the application
- Aurora allows **database encryption** using keys managed through AWS Key Management Service(**KMS**)
- Encryption and decryption are handled seamlessly 
- With Aurora encryption, data stored at rest in the underlying storage is encrypted, as are its automated backups, snapshots, and replicas in the same cluster
- Encryption of existing unencrypted Aurora instance is NOT supported. Create a new encrypted Aurora instance and migrate the data

### Backup and Restore 
- **Automated backups** are always enabled on Aurora DB instances 
- Backups do NOT impact database performance 
- Aurora also allows creation of manual snapshots
- Aurora **automatically maintains 6 copies of your data across 3 AZs** and will automatically attempt to recover your database in a healthy AZ with no data loss
- If the data is unavailable within Aurora Storage, 
  - **DB Snapshot** can be restored
  - **point-in-time restore operation** can be performed to a new instance. 
- Restoring a snapshot creates a new Aurora DB instance 
- **Deleting Aurora database deletes all the automated backups** (with an option to create a final snapshot), **NOT manual snapshots**
- Snapshots (including encrypted ones) can be shared with another AWS accounts  


## Features
- 2 copies in each AZ, with min 3 AZs. = 6 copies
- Snapshot : you can take & share Snapshots with other AWS accounts
- Replica : Aurora Replicas/MySQL Replicas 
  - **Automated failover** is ONLY available with **Aurora Replicas**
- Backups : automated backups turned on by default  


## Scenarios 
- An application requires a highly available relational database with an initial storage capacity of 8 TB. The database will grow by 8 GB every day. To support expected traffic, at least eight read replicas will be required to handle database reads. Which option will meet these requirements?
  - **Amazon Aurora**
  - Aurora **storage will automatically grow**, from **10GB to 64GB**  

- A company is migrating their on-premise 10TB MySQL database to AWS. As a compliance requirement, the company wants to have the data **replicated across three availability zones**. Which Amazon RDS engine meets the above business requirement?
  - **Amazon Aurora**

- An online shopping platform is hosted on an Auto Scaling group of Spot EC2 instances and uses Amazon Aurora PostgreSQL as its database. There is a requirement to **optimize your database workloads** in your cluster where you have to direct the **write** operations of the production traffic **to your high-capacity instances** and point the **reporting queries** sent by your internal staff **to the low-capacity instances**.    
Which is the most suitable configuration for your application as well as your Aurora database cluster to achieve this requirement?
  - **A) Create a custom endpoint in Aurora based on the specified criteria for the production traffic and another custom endpoint to handle the reporting queries.  
 
- A tech startup is launching an on-demand food delivery platform using Amazon ECS cluster with an AWS Fargate serverless compute engine and Amazon Aurora. It is expected that the database **read queries will significantly increase** in the coming weeks ahead. A Solutions Architect recently launched two Read Replicas to the database cluster to improve the platform's scalability.    
Which of the following is the MOST suitable configuration that the Architect should implement to load balance all of the **incoming read requests equally to the two Read Replicas**?
  - **A) Use the built-in Reader endpoint of the Amazon Aurora database.**
  - **A reader endpoint** for an Aurora DB cluster provides load-balancing support for read-only connections to the DB cluster.     
  Use the reader endpoint for read operations, such as queries.    
  By processing those statements on the read-only Aurora Replicas, this endpoint reduces the overhead on the primary instance.     
  It also helps the cluster to scale the capacity to handle simultaneous SELECT queries, proportional to the number of Aurora Replicas in the cluster. Each Aurora DB cluster has one reader endpoint.
  - **A cluster endpoint** : is incorrect because a cluster endpoint (also known as a writer endpoint) simply connects to the current primary DB instance for that DB cluster. This endpoint can perform write operations in the database such as DDL statements, which is perfect for handling production traffic but not suitable for handling queries for reporting since there will be no write database operations that will be sent.
  - **Aurora Parallel Query** : is incorrect because this feature simply enables Amazon Aurora to push down and distribute the computational load of a single query across thousands of CPUs in Aurora's storage layer. Take note that it does not load balance all of the incoming read requests equally to the two Read Replicas. With Parallel Query, query processing is pushed down to the Aurora storage layer. The query gains a large amount of computing power, and it needs to transfer far less data over the network. In the meantime, the Aurora database instance can continue serving transactions with much less interruption. This way, you can run transactional and analytical workloads alongside each other in the same Aurora database, while maintaining high performance.
