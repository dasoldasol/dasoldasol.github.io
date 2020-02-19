## EC2 Pricing Models 
  - On Demand 
  - Reserved : Standard, Convertible, Scheduled 
  - Spot : Like stock market. (if you terminate, you will be charged, if its terminated by EC2, you will NOT be charged.) 
  - Dedicated Hosts : Instance Types F I G H T D R M A R K F X Z A U  
## Feature
- Termination Protection is turned off by default 
- on EBS-backed instance, root EBS volume to be deleted when the instance terminated 
- you CAN encrypt EBS Root Volumes
- Additional Volume also can be encrypted  
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
- get information about an instance
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
  - Partitioned
    - Multiple EC2 instances HDFS, HBase, and Cassendra 
- placement group name must be unique
- can NOT merge placement groups 
- you can move after you stopped instances 
