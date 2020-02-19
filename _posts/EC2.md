## EC2 Pricing Models 
  - On Demand 
  - Reserved : Standard, Convertible, Scheduled 
  - Spot : Like stock market. (if you terminate, you will be charged, if its terminated, you will NOT be charged.) 
  - Dedicated Hosts : F I G H T D R M A R K F X Z A U  
## Feature
- Termination Protection is turned off by default 
- you CAN encrypt EBS Root Volumes
## Security Groups
   - All Inbound traffic blocked by default
   - All Outbound traffic is allowed
   - security group change takes immediately
   - you can have multiple security groups 
   - STATEFUL
   - you can NOT specify deny rules  
## Using Role with EC2
- instead of using credentials, Attach the role to the instance
- hackers cannot take access key & secret access key from .aws  
## Using Bootstrap Scripts
- automating  infrastructures  
## MetaData(User Data)
- curl 169254169254/latest/meta-data/
- curl 169254169254/latest/user-data/  
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
