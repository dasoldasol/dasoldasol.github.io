## Feature
- NFS(Network File System) protocol 
- only pay for the storage you use(no pre-provisioning required like EBS Volume)
- support : scale up to petabytes, concurrent NFS connections
- Data is stored across **multiple AZ**
- Read after Write Consistency

## Scenario
- A content management system (CMS) is hosted on a fleet of auto-scaled, On-Demand EC2 instances which use Amazon Aurora as its database. Currently, the system stores the file documents that the users uploaded in one of the **attached EBS Volumes**. Your manager noticed that the system performance is quite slow and he has instructed you to improve the architecture of the system.    
In this scenario, what will you do to implement a **scalable, high throughput POSIX-compliant file system**?
  - **A) Use EFS**
  - **EFS** : provides simple, scalable, elastic file storage
  - **S3** : object storageone EC2 instance at a time**
  - **EBS** : EBS 볼륨은 한 번에 하나의 EC2 인스턴스에 연결될 수 있으므로 다른 EC2 인스턴스는 해당 EBS 프로비저닝 된 IOPS 볼륨에 연결할 수 없습니다

- A data analytics company has been building its new generation big data and analytics platform on their AWS cloud infrastructure. They need a storage service that provides the scale and performance that their big data applications require such as high throughput to compute nodes coupled with read-after-write consistency and **low-latency** **file operations**. In addition, their data needs to be stored redundantly across multiple AZs and **allows concurrent connections from multiple EC2 instances** hosted on multiple AZs.     
Which of the following AWS storage services will you use to meet this requirement?
  - **A) EFS**
  - **EBS** : **Block** storage and can only have one connection to **one EC2 instance at a time**
