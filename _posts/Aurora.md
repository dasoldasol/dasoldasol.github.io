## Aurora CheatSheet 
### Point 
- Amazon Aurora는 고성능 상용 데이터베이스(high-end commercial databases) 의 성능(speed)과 가용성(realiability)에 오픈 소스 데이터베이스의 간편성과 비용 효율성을 결합하였으며 클라우드를 위해 구축된 MySQL 및 PostgreSQL 호환(compatible) **관계형 데이터베이스**입니다.
- Amazon Aurora는 표준 MySQL 데이터베이스보다 최대 5배 빠르고 표준 PostgreSQL 데이터베이스보다 3배 빠릅니다. 또한, 1/10의 비용으로 상용 데이터베이스의 보안, 가용성 및 안정성을 제공합니다. 하드웨어 프로비저닝, 데이터베이스 설정, 패치 및 백업과 같은 시간 소모적인 관리 작업을 자동화하는 Amazon Relational Database Service(RDS)에서 Amazon Aurora의 모든 것을 관리합니다.
- Amazon Aurora는 내결함성(fault tolerance)을 갖춘 자가 복구 분산 스토리지 시스템으로, 데이터베이스 인스턴스당 최대 64TB까지 자동으로 확장(Auto Scaling)됩니다. 지연 시간이 짧은 읽기 전용 복제본 최대 15개, 특정 시점으로 복구, Amazon S3로 지속적 백업, 3개의 가용 영역(AZ)에 걸친 복제를 통해 뛰어난 성능과 가용성을 제공합니다.

### UseCase
- **엔터프라이즈 애플리케이션**
  - Amazon Aurora는 **관계형 데이터베이스**를 사용할 수 있는 엔터프라이즈 애플리케이션에 매우 적합한 옵션입니다. Amazon Aurora는 상용 데이터베이스와 비교하여 데이터베이스 비용을 90% 이상 낮추면서도 데이터베이스의 안정성과 가용성은 높일 수 있습니다. Amazon Aurora는 **프로비저닝, 패치 적용, 백업, 복원, 장애 탐지, 복구 등 시간이 많이 소요되는 작업을 자동화**함으로써 시간을 절약하는 데 도움이 되는 완전관리형 서비스입니다.
- **Software as a Service(SaaS) 애플리케이션**
  - SaaS 애플리케이션은 인스턴스와 스토리지 확장을 위해 상당한 유연성과 뛰어난 성능 및 안정성이 필요한 **멀티 테넌트 아키텍처**를 주로 사용합니다. Amazon Aurora는 관리형 데이터베이스 서비스에서 이러한 기능을 모두 제공하여, SaaS 업체가 애플리케이션을 지원하는 기본 데이터베이스에 대한 걱정 없이 고품질의 애플리케이션을 구축하는 데 집중할 수 있도록 해줍니다.
- **웹 및 모바일 게임**
  - 대규모로 운영하도록 구축된 웹 및 모바일 게임에는 높은 처리량, 고가용성 및 뛰어난 스토리지 확장성을 갖춘 데이터베이스가 필요합니다. Amazon Aurora는 이렇게 까다로운 애플리케이션 요구 사항을 모두 충족하고, 이후의 성장을 위한 충분한 공간을 제공합니다. Amazon Aurora에는 라이선스 제약이 없으므로, 이러한 애플리케이션의 다양한 사용 패턴에 아주 적합합니다.

### Features 
- A **relational database engine** that combines the speed and realiability of high-end commercial databases with the simplicity and cost-effective of open source databases 
- Fully managed, **MySQL/PostgreSQL compatible**, relational database engine
  - applications developed with MySQL can switch to Aurora with no changes
- Delivers up to **5x performance** of MySQL without requiring any changes to most MySQL applications 
- Aurora PostgreSQL delivers up to 3x performance of PostgreSQL
- RDS managed the Aurora databases, handling time-consuming tasks such as provisioning, patching, backup, recovery, failure detection and repair
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
  - **A) Create a custom endpoint in Aurora based on the specified criteria for the production traffic and another custom endpoint to handle the reporting queries.**  
  - Aurora 사용자 정의 엔드포인트 작성
  
- A tech startup is launching an on-demand food delivery platform using Amazon ECS cluster with an AWS Fargate serverless compute engine and Amazon Aurora. It is expected that the database **read queries will significantly increase** in the coming weeks ahead. A Solutions Architect recently launched two Read Replicas to the database cluster to improve the platform's scalability.    
Which of the following is the MOST suitable configuration that the Architect should implement to load balance all of the **incoming read requests equally to the two Read Replicas**?
  - **A) Use the built-in Reader endpoint of the Amazon Aurora database.**
  - **Aurora DB 클러스터의 리더 엔드 포인트**는 DB 클러스터에 대한 읽기 전용 연결을위한로드 밸런싱 지원을 제공합니다.     
  쿼리와 같은 **읽기 작업에 리더 엔드 포인트를 사용**하십시오.    
  이 엔드 포인트는 **읽기 전용 Aurora 복제본에서 해당 명령문을 처리**함으로써 기본 인스턴스의 오버 헤드를 줄입니다.     
  또한 클러스터의 **Aurora 복제본 수에 비례하여 동시 SELECT 쿼리를 처리** 할 수 있도록 용량을 확장 할 수 있습니다. 각 Aurora DB 클러스터에는 하나의 리더 엔드 포인트가 있습니다.
  - **A cluster endpoint** : is incorrect. 클러스터 엔드 포인트 (**writer 엔드 포인트**라고도 함)는 **해당 DB 클러스터의 현재 기본 DB 인스턴스에 연결하기만**합니다. 이 엔드 포인트는 **DDL** 문과 같은 데이터베이스에서 **쓰기 작업**을 수행 할 수 있습니다. 이 작업은 프로덕션 트래픽을 처리하는 데 적합하지만 전송 될 데이터베이스 쓰기 작업이 없으므로 보고를위한 쿼리 처리에는 적합하지 않습니다.
  - **Aurora Parallel Query** : is incorrect. 이는 단지 Amazon Aurora가 **Aurora의 스토리지 계층에있는 수천 개의 CPU에 단일 쿼리의 계산로드를 푸시 다운하고 분산**시킬 수 있습니다. 수신되는 **모든 읽기 요청을 두 개의 읽기 전용 복제본과 동일하게 로드 밸런싱하지는 않습니다.** 병렬 쿼리를 사용하면 쿼리 처리가 Aurora 스토리지 계층으로 푸시 다운됩니다. 이 쿼리는 많은 양의 컴퓨팅 성능을 제공하며 네트워크를 통해 훨씬 적은 양의 데이터를 전송해야합니다. 그 동안 Aurora 데이터베이스 인스턴스는 중단없이 트랜잭션을 계속 제공 할 수 있습니다. 이렇게하면 동일한 Aurora 데이터베이스에서 트랜잭션 및 분석 워크로드를 함께 실행하면서 고성능을 유지할 수 있습니다.

- A company has recently adopted a hybrid cloud architecture and is planning to migrate a database hosted on-premises to AWS. The database currently has over **12 TB of consumer data**, handles highly transactional (**OLTP**) workloads, and is expected to grow exponentially. The Solutions Architect should ensure that the database is **ACID-compliant and can handle complex queries** of the application.      
Which type of database service should the Architect use?
  - **A) Amazon Aurora**
  - Aurora에는 고성능 스토리지 서브 시스템이 포함되어 있습니다. MySQL 및 PostgreSQL 호환 데이터베이스 엔진은 빠른 분산 스토리지를 활용하도록 사용자 정의됩니다. 기본 스토리지는 필요에 따라 최대 64TB (TiB)까지 자동으로 증가합니다. Aurora는 또한 데이터베이스 클러스터링 및 복제를 자동화하고 표준화합니다. 데이터베이스 클러스터링 및 복제는 일반적으로 데이터베이스 구성 및 관리에서 가장 어려운 부분 중 하나입니다.
  - Amazon RDS MariaDB DB 인스턴스의 경우, 프로비저닝 된 최대 스토리지 제한은 InnoDB 테이블 당 테이블 스페이스 테이블 스페이스를 사용할 때 테이블 크기를 최대 16TB로 제한합니다. 이 한계는 또한 시스템 테이블 스페이스를 최대 16TB 크기로 제한합니다. InnoDB 테이블 당 테이블 스페이스 (각각 고유 한 테이블 스페이스에 테이블이 있음)는 Amazon RDS MariaDB DB 인스턴스에 대해 기본적으로 설정됩니다.
  - **ACID** : atomicity, consistency, isolation, durability로 RDB의 특징 
  
- You are an IT Consultant for a top investment bank which is in the process of building its new Forex trading platform. To ensure high availability and scalability, you designed the trading platform to use an Elastic Load Balancer in front of an Auto Scaling group of On-Demand EC2 instances across multiple Availability Zones. For its database tier, you chose to use a single Amazon Aurora instance to take advantage of its distributed, fault-tolerant and self-healing storage system.     
**In the event of system failure on the primary database instance, what happens to Amazon Aurora during the failover**?
  - **A) Aurora will first attempt to create a new DB Instance in the same AZ as the original instance. If unable to do so, Aurora will attempt to create a new DB Instance in a different AZ.**
  - 동일하거나 다른 가용 영역에 Amazon Aurora 복제본이있는 경우 장애 조치시 Amazon Aurora는 DB 인스턴스의 표준 이름 레코드 (CNAME)를 정상 복제본을 가리키도록하여 새로운 복제본으로 승격시킵니다. 일 순위. 완료 후 페일 오버는 일반적으로 30 초 내에 완료됩니다.       
Aurora 서버리스를 실행 중이고 DB 인스턴스 또는 AZ를 사용할 수없는 경우 Aurora는 다른 AZ에서 DB 인스턴스를 자동으로 다시 생성합니다.    
Amazon Aurora 복제본 (예 : 단일 인스턴스)이없고 Aurora 서버리스를 실행하지 않는 경우 Aurora는 원래 인스턴스와 동일한 가용 영역에 새 DB 인스턴스를 생성하려고 시도합니다. 원래 인스턴스의 이러한 교체는 최선의 노력으로 수행되며 가용 영역에 광범위하게 영향을 미치는 문제가 있는 경우와 같이 성공하지 못할 수 있습니다.
