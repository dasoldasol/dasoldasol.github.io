## Elastic Block Store CheatSheet 
### Point
- Amazon Elastic Compute Cloud(EC2)에서 사용하도록 설계된 사용하기 쉬운 고성능 블록 스토리지 서비스
- **어떤 워크로드에든 적합한 성능** : EBS 볼륨은 SAP, Oracle 및 Microsoft 제품과 같은 미션 크리티컬 애플리케이션을 포함하여, 가장 까다로운 워크로드에 적합합니다. SSD 지원 옵션으로는, 고성능 애플리케이션을 위해 설계된 볼륨(IOPS) 및 대부분의 워크로드에 적합한 뛰어난 요금/성능 옵션을 제공하는 범용 볼륨(General Purpose)이 포함됩니다. HDD 지원 옵션은 빅 데이터 분석 엔진, 로그 처리 및 데이터 웨어하우징과 같은 대용량 순차 워크로드를 위해 설계되었습니다(Throughput Optimized HDD). FSR(빠른 스냅샷 복원)을 사용하여 스냅샷에서 EBS 볼륨 생성 시 전체 성능을 즉시 수신합니다.
- **사용 편의성** : Amazon EBS 볼륨은 쉽게 생성하고 사용하고 암호화하고 보호할 수 있습니다. 탄력적인 볼륨(**Elastic Volumes**) 기능을 사용하면 **워크로드를 중단하지 않고도** 스토리지를 늘리고, 성능을 높이거나 낮추고, 볼륨 유형을 변경할 수 있습니다. **EBS 스냅샷**을 사용하면 데이터의 지리적 보호를 위해 볼륨의 백업을 쉽게 생성할 수 있습니다. **Data Lifecycle Manager(DLM)** 는 추가 오버헤드나 비용 없이 스냅샷 관리를 자동화하는 사용하기 쉬운 도구입니다.

- **HA & durability** : Amazon EBS 아키텍처는 미션 크리티컬 애플리케이션에 안정성을 제공합니다. 각 볼륨은 **AZ(가용 영역) 내에서 복제**를 통해 장애로부터 사용자 환경을 보호하도록 설계되었으며, 99.999%의 가용성과 0.1% - 0.2% 사이의 AFR(연간 장애 비율)을 제공합니다. 단순하고 강력한 백업을 위해 Amazon Data Lifecycle Manager(DLM) 정책과 함께 EBS 스냅샷을 사용하여 스냅샷 관리를 자동화합니다. 백업 공급자로서 스냅샷용 EBS direct API를 사용하여 EBS 볼륨의 빠른 백업과 보다 세분화된 RPO(복구 시점 목표)를 달성합니다.  이것은 새 EC2 인스턴스 또는 EBS 볼륨을 생성하지 않고도 EBS 스냅샷 데이터를 읽을 수 있는 기능을 통해 가능합니다.

- is virtual network attached block storage 
- Volumes **CANNOT be shared** with multiple EC2 instances (cf. EFS)
- **muiltiple Volumes can be attached** to a single EC2 instance
- **persist and independent of EC2 lifecycle**
- Snapshots **CANNOT** span **across region**
- for making Volume available to different AZ
  - create a Snapshot of the Volume and restore it to a new Volume in any AZ within the region
- for making Volume available to different Region
  - the Snapshot of the Volume can be copied to a different region and restored as a Volume
- provides **high durability** and are **redundant in an AZ**
  - as the data is automatically replicated within that AZ to prevent data loss
- PIOPS is designed to run transactions applications that require high and consistent IO such as RDB, NoSQL etc


## EBS Types 
![ebs-feat](./image/ebs-2.png)
![ebs-types](./image/ebs-types.png)
- General Purpose SSD(gp2) : MAX IOPS 16,000, Most Work Loads 
- Provisioned IOPS SSD(io1) : 64,000, Databases 
- Throughput Optimized HDD(st1) : 500, Big Data & Data Warehouse 
- Cold HDD(sc1) : 250
- EBS Magnetic(standard) : 40-200 (not used)


## Volume & Snapshot
### Volume
- exist on EBS. always on same AZ
- CAN NOT attach an EBS Volume to more than 1 EC2 instance at the same time.
- You can change EBS volume sizes on the fly
- **when EC2 instance terminated..** : **root device volume EBS deleted**, additional volumes NOT deleted by default 
  - However, the DeleteOnTermination attribute may be changed at launch using Console or using CLI while running.
### Snapshot 
- exist on S3. **incremental**(only the blocks changed since the last) stop the instance before taking snapshots.
- **CAN NOT delete a snapshot** of an EBS Volume that is used as the **root device** of a registered AMI
- migrate to another AZ : snapshot -> create AMI from snapshot -> use the AMI to launch instance in new AZ
- migrate to another region : snapshot -> create AMI from snapshot -> copy AMI to another region -> use the copied AMI to launch instance in new region


## EBS vs. Instance Store 
- Instance Store Volume
  - Ephemeral Storage : Instance store volumes canNOT be stopped. If the underlying host fails, you will lose data.
- EBS
  - EBS backed instances can be stopped. you will not lose data on this instance if it's stopped.
- you can reboot both, you will not lose data.
- Both ROOT volumes will be deleted on termination by default. EBS) you can tell AWS to keep ROOT


## Encryption
- Snapshots of encrypted volumes are encrypted automatically.
- Volumes retored from encrypted snapshots are encrypted automatically.
- you can share snapshots ONLY IF they are UNENCRYPTED
- These snapshots can be shared with other AWS accounts or made public.
- you can NOW encrypt ROOT device volumes when you create the EC2 instance. 
- **HOW TO CHANGE UNENCRYPTED ROOT TO ENCRYPTED?**
  - Create a Snapshot of the unencrypted root device volume.
  - Copy the Snapshot and select the encrypt option
  - Create an AMI from the encrypted Snapshot
  - Use the AMI to launch new encrypted instances. 

## Scenarios 
- **A Solutions Architect is designing a critical business application with a relational database that runs on an EC2 instance. It requires a single EBS volume that can support up to 16,000 IOPS.    Which Amazon EBS volume type can meet the performance requirements of this application?**    
  - **A) EBS Provisioned IOPS SSD**
  - EBS Provisioned IOPS SSD : sustained performance for mission-critical low-latency workloads
  - EBS General Purpose SSD : bursts of performance 3,000 - 10,000 IOPS
  - HDD : lower cost, high throughput volumes
    
- **You are building a new data analytics application in AWS which will be deployed in an AutoScaling group of On-Demand EC2 instances and MongoDB database. It is expected that the database will have high-throughput workloads performing small, random I/O operations. As the Solutions Architect, you are required to properly setup and launch the required resources in AWS.    
Which of the following is the most suitable EBS type to use for your database?**
  - **A) Provisioned IOPS SSD(io1)**
  - SSD-backed volumes : consistent performance whether an I/O operation is random or sequential.
    - General Purpose SSD(gp2) : it can handle small, random I/O operations
    - Provisioned IOPS SSD(io1) : suitable for I/O-intensive database workloads such as MongoDB, Oracle, MySQL.
  - HHD-backed voluems : optimal performance ONLY when I/O operations are large and sequential.

- You have triggered the creation of a snapshot of your EBS volume attached to an Instance Store-backed EC2 Instance and is currently on-going. At this point, what are the things that the EBS volume can or cannot do?
  - **A) The volume can be used as normal while the snapshot is in progress**
  - EBS snapshots occur **asynchronously**. This means that the point-in-time snapshot is created immediately, but the status of the snapshot is `pending` until the snapshot is complete. In-progress snapshot is **not affected** by ongoing reads and writes to **the volume** hence, you can still use the volume.

- As part of the Business Continuity Plan of your company, your IT Director instructed you to set up an automated backup of all of the EBS Volumes for your EC2 instances as soon as possible.     
What is the fastest and most cost-effective **solution to automatically back up all of your EBS Volumes**?
  - **A) Amazon Data Lifecycle Manager(Amazon DLM) to automate the creation of EBS snapshots.**
  - Automating snapshot management helps you to:
    - Protect valuable data by enforcing a **regular backup schedule**.
    - **Retain backups** as required by auditors or internal compliance.
    - **Reduce storage costs** by deleting outdated backups.
    - **without** having to write **custom shell scripts** or creating **scheduled jobs**.
  - Combined with the monitoring features of Amazon CloudWatch Events and AWS CloudTrail, Amazon DLM provides a complete backup solution for EBS volumes **at no additional cost.**
  - cf) **create a scheduled job that calls the "create-snapshot" command via the AWS CLI to take a snapshot of production EBS volumes periodically** : is incorrect because even though this is a valid solution, you would still need additional time to create a scheduled job that calls the "create-snapshot" command. 

- A company is planning to launch an application which requires a data warehouse that will be used for their **infrequently accessed data**. You need to use an EBS Volume that can **handle large, sequential I/O operations**.    
Which of the following is the most cost-effective storage type that you should use to meet the requirement?
  - **A) Cold HDD(sc1)**
  - **Cold HDD vs. Throughput Optimized HDD**    
        
    - |Throughput Optimized HDD(st1)|Cold HDD(sc1)|
      |:----------|:----------|
      |**frequently** accessed, throughput intensive workload|**infrequently** accessed workloads|
      |Streaming workload / Data warehouse|throughput-oriented & **lowest storage cost**|

- You need to back up your mySQL database hosted on a Reserved EC2 instance. It is using **EBS volumes that are configured in a RAID array**.    
What steps will you take to minimize the time during which the database cannot be written to and to ensure a consistent backup?
  - **1. Stop all applications from writing to the RAID array.**    
    **2. Flush all caches to the disk.**    
    **3. Confirm that the associated EC2 instance is no longer writing to the RAID array by taking actions such as freezing the file system, unmounting the RAID array, or even shutting down the EC2 instance.**    
    **4. After taking steps to halt all disk-related activity to the RAID array, take a snapshot of each EBS volume in the array.**    
  - When you take a snapshot of an attached Amazon EBS volume that is in use, the snapshot excludes data cached by applications or the operating system. For a single EBS volume, this is often not a problem. However, when cached data is excluded from snapshots of multiple EBS volumes in a RAID array, restoring the volumes from the snapshots can degrade the integrity of the array.    
When creating snapshots of EBS volumes that are configured in a RAID array, it is critical that there is no data I/O to or from the volumes when the snapshots are created.


- You have launched a new enterprise application with a web server and a database. You are using a large EC2 Instance with one 500 GB EBS volume to host a relational database. Upon checking the performance, it shows that **write throughput to the database needs to be improved**.    
Which of the following is the most suitable configuration to help you achieve this requirement? (Choose 2)
  - **Solution 1 : Increase the size of the EC2 Instance**
  - **Solution 2 : Set up a standard RAID 0 configuration with 2 EBS Volumes**
  - RAID
    - **Raid 0 : Striping** (하나의 데이터를 여러 드라이브에 **분산 저장**함으로써 **빠른 입출력**이 가능)
    - **Raid 1 : Mirroring** (똑같은 데이터를 **동일한 용량**과 스팩의 다른 디스크에도 저장함으로써 **높은 안정성** 확보)
  - Setting up the EC2 instance in a placement group : is incorrect because the placement groups feature is primarily used for **inter-instance communication.**

- A corporate and investment bank has recently decided to adopt a hybrid cloud architecture for their Trade Finance web application which uses an Oracle database with Oracle Real Application Clusters (RAC) configuration. Since Oracle RAC is not supported in RDS, they decided to launch their database in a large On-Demand EC2 instance instead, with multiple EBS Volumes attached. As a Solutions Architect, you are responsible to ensure the security, availability, scalability, and disaster recovery of the whole architecture.    
In this scenario, which of the following will enable you to take **backups of your EBS volumes that are being used by the Oracle** database?
  - **A) Creating snapshots of the EBS Volumes**
  - You can back up the data on your Amazon EBS volumes to Amazon S3 by taking point-in-time snapshots. **Snapshots are incremental** backups, which means that only the blocks on the device that have changed after your most recent snapshot are saved. This **minimizes the time** required to create the snapshot and **saves on storage costs by not duplicating data**. 
  - **Disk Mirroring, which is also known as RAID 1, that replicates data to two or more disks/EBS Volumes** : is incorrect. Disk mirroring is NOT an efficient and cost-optimized solution

- You are working as a Solutions Architect for an investment bank and your Chief Technical Officer intends to migrate all of your applications to AWS. You are looking for block storage to store all of your data and have decided to go with EBS volumes. Your boss is worried that EBS volumes are not appropriate for your workloads due to compliance requirements, downtime scenarios, and IOPS performance.    
Which of the following are valid points in proving that EBS is the best service to use for your migration? (Choose 2)
  - **A1) An EBS Volume is off-instance storage that can persist independently from the life of an instance.**
  - **A2) EBS volumes support live configuration changes while in production which means that you can modify the volume type, volume size, and IOPS capacity without service interruptions.**
  - When you create an **EBS volume** in an Availability Zone, it is **automatically replicated within that zone** to prevent data loss due to a failure of any single hardware component.
  - An **EBS volume** can **only be attached to one EC2 instance** at a time.
  - After you create a volume, you can **attach** it to any EC2 instance **in the same Availability Zone**
  - Amazon EBS encryption uses 256-bit Advanced Encryption Standard algorithms (AES-256)
  - EBS Volumes offer 99.999% SLA.

- You work for a brokerage firm as an AWS Infrastructure Engineer who handles the stocks trading application. You host your database in an EC2 server with two EBS volumes for OS and data storage in ap-southeast-1a. Due to the **fault tolerance** requirements, there is a need to **assess if the EBS volumes will be affected** in the event of ap-southeast-1a availability zone outage.    
Can **EBS tolerate an Availability Zone failure** each and every time?
  - **A) No, all EBS volumes are stored and replicated in a single AZ only**
  - when you create an EBS volume in an Availability Zone, it is automatically replicated within that zone only to prevent data loss due to a failure of any single hardware component. After you create a volume, you can attach it to any EC2 instance in the same Availability Zone.
  - it is the **EBS snapshots**, not the EBS volume, that has a copy of the data which is stored redundantly in **multiple Availability Zones.**
  - **EBS volumes** only exist in a **single availability zone** while **EBS snapshots** are available in **one AWS region**.

- You are working for an investment bank as their IT Consultant. You are working with their IT team to handle the launch of their digital wallet system. The applications will run on multiple EBS-backed EC2 instances which will store the logs, transactions, and billing statements of the user in an S3 bucket. Due to tight security and compliance requirements, you are exploring options on **how to safely store sensitive data on the EBS volumes and S3**.    
Which of the below options should be carried out when storing sensitive data on AWS? (Choose 2)
  - **A1) Enable Amazon S3 Server-Side or use Client-Side Encryption**
  - **A2) Enable EBS Encryption**
  - **Using AWS Shield and WAF** : is incorrect because these protect you from common security threats for your web applications. However, what you are trying to achieve is securing and encrypting your data inside EBS and S3.

- You are working for a tech company that uses a lot of EBS volumes in their EC2 instances. An incident occurred that requires you to delete the EBS volumes and then re-create them again.       
What step should you do **before you delete the EBS volumes**?
  - **A) Store a snapshot of the volume.**

- A global online sports betting company has its popular web application hosted in AWS. They are planning to develop a new online portal for their new business venture and they hired you to implement the cloud architecture for a new online portal that will accept bets globally for world sports. You started to design the system with a relational database that runs on a single EC2 instance, which requires a single EBS volume that can support up to **30,000 IOPS**.       
In this scenario, which Amazon EBS volume type can you use that will meet the performance requirements of this new online portal?
  - **A) EBS Provisioned IOPS SSD(io1)**
  - Remember that the dominant performance attribute of SSD is **IOPS** while HDD is **Throughput**.

- A company has a High Performance Computing (HPC) cluster that is composed of EC2 Instances with Provisioned IOPS volume to process transaction-intensive, low-latency workloads. The Solutions Architect must maintain high IOPS while keeping the latency down by setting the optimal queue length for the volume. The size of each volume is 10 GiB.    
Which of the following is the MOST suitable configuration that the Architect should set up?
  - **A) Set the IOPS to 500 then maintain a low queue length**
  - The maximum ratio **"provisioned IOPS : requested volume size (in GiB)" is "50:1"**
    - ex. 최대 5,000 IOPS로 100GiB 볼륨을 프로비저닝 할 수 있습니다. 지원되는 인스턴스 유형에서 1,280 GiB 이상의 볼륨은 최대 64,000 IOPS (50 × 1,280 GiB = 64,000)까지 프로비저닝 할 수 있습니다.
    - **xIOPS : 10GiB = 50:1 -> 500IOPS**
  - **The volume queue length** is **the # of pending I/O requests** for a device.
    - **SSD-backed volumes** : 낮은 큐 길이(**low queue length**)와 볼륨에 사용 가능한 많은 IOPS를 유지하여 대기 시간(latency)을 줄이면서 높은 IOPS를 유지할 수 있습니다. 사용 가능한 것보다 많은 양의 IOPS를 지속적으로 구동하면 I / O 대기 시간이 증가 할 수 있습니다.
    - **HDD-backed volumes** : Throughput-intensive applications are less sensitive to increased I/O latency. You can maintain high throughput to HDD-backed volumes by maintaining a **high queue length** when performing large, sequential I/O.

- You are working as a Solutions Architect for a financial firm which is building an internal application that processes loans, accruals, and interest rates for their clients. They require a storage service that is able to handle future increases in **storage capacity of up to 16 TB** and can provide the **lowest-latency** access to their data. Their web application will be hosted in a **single** m5ad.24xlarge Reserved **EC2 instance** which will process and store data to the storage service.    
Which of the following would be the most suitable storage service that you should use to meet this requirement?
  - **A) EBS**
  - **EBS** can deliver performance for workloads that require the **lowest-latency** access to data from a **single EC2 instance**. You can also increase EBS storage for **up to 16TB** or add new volumes for additional storage.
  - **S3** : is incorrect because although this is also highly available and highly scalable, it still **does not provide the lowest-latency** access to the data, unlike EBS. Remember that **S3 does not reside within your VPC by default**, which means **the data will go through the public Internet that may result to higher latency**. You can set up a VPC Endpoint for S3 yet still, its latency is greater than that of EBS.
  - **EFS** : is incorrect because the scenario does not require concurrently-accessible storage for **multiple instances**. Although EFS can provide low latency data access to the EC2 instance as compared with S3, the storage service that can provide **the lowest latency access is still EBS**.
