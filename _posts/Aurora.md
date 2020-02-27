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
