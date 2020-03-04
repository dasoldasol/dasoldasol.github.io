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
- Additional EBS Volume also can be encrypted  
- Individual instances are **provisioned in Availablity Zones** 
- You **can add multiple EBS volumes** to an EC2 instance and then create your own **RAID 5/RAID 10/RAID 0** configurations using those volumes.
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
  - **Clustered Placement Group**
    - grouping of instances **within a single AZ**
    - Low **Network** Latency / High **Network** Throughput (put together real close)
    - canNOT span multiple AZ : Cluster Placement Groups can only exist in one Availabiity Zone since they are focused on keeping instances together, which you cannot do across Availability Zones
    - homogenous(same instance types) recommended 
  - **Spread Placement Group**
  - ![ec2-spread_placement_group](./image/ec2-spread_placement_group.png)
    - **Indivisual Critical** EC2 instances
    - you can only have max 7 running instances per AZ
    - Spread Placement Groups can be deployed **across availability zones** since they spread the instances further apart.
  - **Partitioned Placement Group**
  - ![ec2-partitioned_placement_group](./image/ec2-partitioned_placement_group.png)
    - **Multiple** EC2 instances HDFS, HBase, and Cassendra 
- placement group name must be unique
- can NOT merge placement groups 
- you can move after you stopped instances 

## Scenarios 
- **A web application allows customers to upload orders to an s3 bucket. The resulting Amazon S3 events trigger a Lambda function that insets a message to an SQS queues. A single EC2 instance reads messages from the queue, process them, and stores them in a DynamoDB table partitioned by unique order ID. Next month traffic is expected to increase by a factor of 10 and a Solutions Architect is reviewing the architecture for possible scaling problems.    
Which component is MOST likely to need re-architecting to be able to scale to accommodate the new traffic?**
  - **EC2 instance**
  - A single EC2 instance will not scale and is a single point of failure in the architecture.
  - A much better solution would be to have EC2 instances in an Auto Scaling group across 2 availability zones read messages from the queue. The other responses are all managed services that can be configured to scale or will scale automatically.
  
- You have developed a new web application in the US-West-2 Region that requires six Amazon Elastic Compute Cloud (EC2) instances to be running at all times. US-West-2 comprises three Availability Zones (us-west-2a, us-west-2b, and us-west-2c). You need **100 percent fault tolerance**: should any single Availability Zone in us-west-2 become unavailable, the application must continue to run. How would you **make sure 6 servers are ALWAYS available**? NOTE: each answer has 2 possible deployment configurations. Select the answer that gives TWO satisfactory solutions to this scenario.
  - **Solution 1 : 6 instances / 6 instances / 0 instance**
  - **Solution 2 : 3 instances / 3 instances / 3 intstances**
  - You need to work through each case to find which will provide you with the required number of running instances **even if one AZ is lost**. Hint: always assume that the AZ you lose is the one with the most instances. Remember that the client has stipulated that they MUST have 100% fault tolerance.

- Your company announced that there would be a surprise IT audit on all of the AWS resources being used in the production environment. During the audit activities, it was noted that you are using a combination of **Standard and Scheduled Reserved EC2 instances** in your applications. They argued that you should have used Spot EC2 instances instead as it is cheaper than the Reserved Instance.    
Which of the following are the characteristics and **benefits** of using these two types of **Reserved EC2 instances**, which you can use as justification? (Choose 2)
  - **Reserved Instances doesn't get interrupted unlike Spot instances in the event that there are not enough unused EC2 instances to meet the demand.**
  - **You can have capacity reservations that recur on a daily, weekly, or montly basis, with a specified time and duration, for a one-year term through Scheduled Reserved Instances**
  - Reserved Instances are not physical instances, but rather a billing discount applied to the use of On-Demand Instances in your account. When your computing needs change, you can modify your Standard or Convertible Reserved Instances and continue to take advantage of the billing benefit. You can modify the Availability Zone, scope, network platform, or instance size (within the same instance type) of your Reserved Instance. You can also sell your unused instance on the Reserved Instance Marketplace.
