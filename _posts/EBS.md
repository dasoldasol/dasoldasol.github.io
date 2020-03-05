## Elastic Block Store CheatSheet 
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
