## EC2 CheatSheet
### Features
- provides **scalable computing capacity**
- **EC2 instances** : Virtual computing environments
- **Amazon Machine Images(AMI)** : Preconfigured templates for EC2 instances
  - package the bits needed for the server (including the os and additional sw)
- **Instance types** : Various configurations of CPU, memory, storage, and networking capacity for your instances 
- **Key pairs** : Secure login information for your instances (public-private keys where private is kept by user)
- **Instance store volumes** : Storage volumes for temporary data. Deleted when you stop/terminate your instance
- **Elastic Block Store(EBS)** : Persistent storage volumes for data using
- **Regions and Availability Zones** : Multiple physical locations for your resources such as instances and EBS volumes
- **Security Groups** : A Firewall to specify the protocols, ports, and source IP ranges that can reach your instances 
- **Elastic IP(EIP)** : Static IP addresses
- **Tags** : Metadata. Created and assigned to EC2 resources.
- **VPCs** : Virtual networks that are logically isolated from the rest of the AWS cloud, and can optionally connect to on premises network


### Amazon Machine Image(AMI)
- **Template** from which EC2 instances can be launched quickly 
- **does NOT span across regions**, and needs to be copied 
- **can be shared with other specific AWS accounts or made public**


### Purchasing Option 
- **On-Demand Instances**
  - pay for instances and compute capacity that you use by the hour
  - with no long-term commitments or up-front payments 
- **Reserved Instances**
  - provides **lower hourly running costs** by providing a billing discount 
  - **capacity reservation**
  - suited if **consistent, heavy, predictable** usage 
  - you can **modify AZs** or the **instance size within the same instance type**
  - **pay for entire term** regardless of the usage
- **Spot Instance**
  - cost-effective choice but doest **NOT guarantee availability**
- **Dedicated Instances**
  - tenancy option which enables instances to run in VPC on hardware that's isolated, dedicated to a single customer

## EC2 Pricing Models 
  - On Demand 
  - Reserved : Standard, Convertible, Scheduled 
    - You can modify the AZ, scope, network platform, or instance size (within the same instance type), but not Region.
  - Spot : Like stock market. (if you terminate, you will be charged, if its terminated by EC2, you will NOT be charged.) 
  - Dedicated Hosts : Instance Types F I G H T D R M A R K F X Z A U  
## Feature
- Termination Protection is turned off by default 
- on EBS-backed instance, root EBS volume to be deleted when the instance terminated 
- you CAN encrypt EBS Root Volumes
- Additional Volume also can be encrypted  
- Individual instances are provisioned in Availablity Zones 
## Security Groups
   - All Inbound traffic blocked by default
   - All Outbound traffic is allowed
   - security group change takes immediately
   - you can have multiple security groups 
   - STATEFUL : if you open up port, it's going to be open for both inbound and outbound traffic(cf. NACL is STATELESS)
    - if you create an inbound rule allowing traffic in, that traffic automatically allowed back out again
   - you can NOT specify deny rules / can NOT block specific IP using Security Groups (cf. NACL can) 
## Using Role with EC2
- Roles are more secure.
- instead of using credentials, Attach the role to the instance
- hackers cannot take access key & secret access key from .aws  
## Using Bootstrap Scripts
- Bootstrap scripts run when an EC2 instance first boots
- automating  infrastructures(software installs and updates)
## MetaData & User Data
- get information about an instance : When You need to know both the private IP address and public IP address of your EC2 instance.
- curl http://169.254.169.254/latest/meta-data/
- curl http://169.254.169.254/latest/user-data/  
## EC2 Placement Groups 
- 3 Placement Groups 
  - Clustered
    - Low Network Latency / High Network Throughput (put together real close)
    - canNOT span multiple AZ
    - homogenous(same instance types) recommended 
  - Spread
    - Indivisual Critical EC2 instances
    - you can only have max 7 running instances per AZ
  - Partitioned
    - Multiple EC2 instances HDFS, HBase, and Cassendra 
- placement group name must be unique
- can NOT merge placement groups 
- you can move after you stopped instances 
