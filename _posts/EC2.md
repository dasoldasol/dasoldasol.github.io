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

- You have launched a new enterprise application with a web server and a database. You are using a large EC2 Instance with one 500 GB EBS volume to host a relational database. Upon checking the performance, it shows that **write throughput to the database needs to be improved**.    
Which of the following is the most suitable configuration to help you achieve this requirement? (Choose 2)
  - **Solution 1 : Increase the size of the EC2 Instance**
  - **Solution 2 : Set up a standard RAID 0 configuration with 2 EBS Volumes**
  - RAID
    - Raid 0 : Striping (하나의 데이터를 여러 드라이브에 분산 저장함으로써 **빠른 입출력**이 가능)
    - Raid 1 : Mirroring (똑같은 데이터를 동일한 용량과 스팩의 다른 디스크에도 저장함으로써 높은 안정성 확보)
  - Setting up the EC2 instance in a placement group : is incorrect because the placement groups feature is primarily used for **inter-instance communication.**

- You are designing a multi-tier web application architecture that consists of a fleet of EC2 instances and an Oracle relational database server. It is required that the database is **highly available** and that you have **full control over its underlying operating system**.    
Which AWS service will you use for your database tier?
  - **A) Amazon EC2 instances with data replication between two different Availability Zones.**
  - The Quick Start deploys the Oracle primary database (using the preconfigured, general-purpose starter database from Oracle) on an Amazon EC2 instance in the first Availability Zone. It then sets up a second EC2 instance in a second Availability Zone, copies the primary database to the second instance by using the `DUPLICATE` command, and configures Oracle Data Guard.
  - **Amazon RDS and Amazon RDS with Multi-AZ deployments** : are both incorrect because the scenario requires you to have access to the underlying operating system of the database server. Remember that Amazon RDS is a managed database service, which means that **Amazon** is the one that **manages the underlying operating system** of the database instance and not you.

- You are managing a suite of applications in your on-premises network which are using trusted IP addresses that your partners and customers have whitelisted in their firewalls. There is a requirement to **migrate these applications** to AWS **without** requiring your partners and customers to **change their IP address whitelists.**      
Which of the following is the most suitable solution to properly migrate your applications?
  - **A) Create a Route Origin Authorization(ROA) then one done, provision and advertise your whitelisted IP address range to your AWS account.**
  - Setting up a list of Elastic IP addresses to map the whitelisted IP address range in your on-premises network :  is incorrect because you cannot map the IP address of your on-premises network, which you are migrating to AWS, to an EIP address of your VPC. To satisfy the requirement, you must authorize Amazon to advertise the address range that you own.

- You have a requirement to make sure that an On-Demand EC2 instance can only be accessed from this IP address (110.238.98.71) via an **SSH** connection. Which configuration below will satisfy this requirement?
  - **A) Security Group Inbound Rule : Protocol - TCP. Port Range-22, Source 110.238.98.71/32**
  - SSH protocol uses TCP and port 22. The requirement is to only allow the individual IP of the client and not the entire network. Therefore, the proper CIDR notation should be used. The /32 denotes one IP address and the /0 refers to the entire network.

- You are a Solutions Architect for a leading Enterprise Resource Planning (ERP) solutions provider and you are instructed to design and set up the architecture of your ERP application in AWS. Your manager instructed you to **avoid using fully-managed AWS services** and instead, only use specific services which allows you to access the underlying operating system for the resource. This is to allow the company to have a much better control of the underlying resources that their systems are using in the AWS cloud.       
Which of the following services should you choose to satisfy this requirement? (Choose 2)
  - **A) EMR, EC2**
  - **Amazon EC2** : provides you access to the operating system of the instance that you created.
  - **Amazon EMR** : provides you a managed Hadoop framework that makes it easy, fast, and cost-effective to process vast amounts of data across dynamically scalable Amazon EC2 instances. You can access the operating system of these EC2 instances that were created by Amazon EMR.
  - **Amazon Athena, DynamoDB, Amazon Neptune** : are incorrect as these are managed services, which means that **AWS manages the underlying operating system** and other server configurations that these databases use.

- You are working for a software company that has moved a legacy application from an on-premises data center to the cloud. The legacy application **requires a static IP address hard-coded into the backend**, which blocks you from using an Application Load Balancer.    
Which steps would you take to apply **high availability and fault tolerance** to this application **without ELB**? (Choose 2)
  - **Solution 1: Assign an Elastic IP address to the instance**
  - **Solution 2: Write a script that checks the health of the EC2 instance. If the instance stops responding, the script will switch the elastic IP address to a standby EC2 instance.**
  - ![EIP_as_VIP](./image/EIP_as_VIP.png)    
  - **Launching the instance using Auto Scaling which will deploy the instance again if it becomes unhealthy** : is incorrect as even though the Auto Scaling group provides high availability and scalability, it still depends on ELB which is not available in this scenario. Take note that you need to have a static IP address which can be in the form of an Elastic IP. Although an Auto Scaling group can scale out if one of the EC2 instances became unhealthy, you still cannot directly assign an EIP to an Auto Scaling group. In addition, you are only limited to use EC2 instance status checks for your Auto Scaling group if you do not have an ELB which can provide you the actual health check of your application (using its port), and not just the health of the EC2 instance.

- You work for a leading university as an AWS Infrastructure Engineer and also as a professor to aspiring AWS architects. As a way to familiarize your students with AWS, you gave them a project to host their applications to an EC2 instance. One of your students created an instance to host their online enrollment system project but is having a hard time **connecting to their newly created EC2 instance**. Your students have explored all of the troubleshooting guides by AWS and narrowed it down to login issues.       
Which of the following can you use to **log into an EC2 instance**?
  - **A) Key Pairs**

- Using the EC2 API, you requested 40 m5.large On-Demand EC2 instances in a single Availability Zone. Twenty instances were successfully created but the other 20 requests failed.       
What is the solution for this issue and what is the root cause?
  - **A) For new accounts, there is a soft limit of 20 EC2 instances per region. Submit an Amazon EC2 instance Request Form in order to lift this limit.**
  - ![ec2-instance-request-form](./image/ec2-instance-request-form.PNG)

- As a Network Architect developing a food ordering application, you need to retrieve the instance ID, public keys, and public IP address of the EC2 server you made for tagging and grouping the attributes into your internal application running on-premises.    
Which EC2 feature will help you achieve your requirements?
  - **A) Instance metadata**
  - **metadata vs. userdata**
    - **metadata** : the data about your instance that you can use to **configure or manage the running instance**. You can get the **instance ID, public keys, public IP address**
    - **userdata** : perform common automated configuration tasks and **run scripts after the instance starts**.

- You are an AWS Network Engineer working for a utilities provider where you are managing a monolithic application with EC2 instance using a Windows AMI. You want to implement a cost-effective and highly available architecture for your application where you have an exact replica of the Windows server that is in a running state. If the primary instance terminates, you can attach the ENI to the standby secondary instance which allows the traffic flow to resume within a few seconds.    
When it comes to the **ENI attachment to an EC2 instance**, what does **'warm attach'** refer to?
  - **A) attaching an ENI to an instance when it is stopped**
  - **An elastic network interface (ENI)** : is a logical networking component in a VPC that represents a **virtual network card**. You can attach a network interface to an EC2 instance in the following ways:
    - When it's **running (hot attach)**
    - When it's **stopped (warm attach)**
    - When the instance is **being launched (cold attach)**.

- You are **unable to connect to your new EC2 instance via SSH from your home computer**, which you have recently deployed. However, you were **able to successfully access other existing instances in your VPC** without any issues.       
Which of the following should you check and possibly correct to restore **connectivity**?
  - **A) Configure the Security Group of the EC2 instance to permit ingress traffic over port 22 from your IP**
  - When connecting to your EC2 instance via SSH, you need to ensure that port 22 is allowed on the security group of your EC2 instance.
  - **NACL** : is incorrect because Network ACL is much suitable to control the traffic that goes in and out of your **entire VPC** and **not just on one EC2 instance**.
  
- You are working as a Solutions Architect for an aerospace manufacturer which heavily uses AWS. They are running a cluster of multi-tier applications that spans multiple servers for your wind simulation model and how it affects your state-of-the-art wing design. Currently, you are experiencing a slowdown in your applications and upon further investigation, it was discovered that it is due to latency issues.     
Which of the following EC2 features should you use to optimize performance for a **compute cluster that requires low network latency**?
  - **A) Placement Groups**
  - **Multiple Availability Zones** : is incorrect because they are mainly used for achieving **high availability** when one of the AWS AZ’s goes down, and are not used for low network latency. Use Spread Placement Groups instead for multiple availability zones.

- You are working for a large financial firm and you are instructed to set up a Linux bastion host. It will allow access to the Amazon EC2 instances running in their VPC. For security purposes, **only the clients connecting from the corporate external public IP address 175.45.116.100 should have SSH access to the host**.    
Which is the best option that can meet the customer's requirement?
  - **A) Security Group Inbound Rule : Protocol - TCP. Port Rage - 22, Source 175.45.116.100/32**

- You are working for a large financial firm in the country. They have an AWS environment which contains several Reserved EC2 instances hosted in a web application that has been decommissioned last week. To save cost, you need to **stop incurring charges for the Reserved instances** as soon as possible.    
What cost-effective steps will you take in this circumstance? (Choose 2)
  - **A1) Terminate the Reserved instances as soon as possible to avoid getting billed at the on-demand price when it expires.**
  - **A2) Go to the AWS Reserved Instance Marketplace and sell the Reserved instances.**
  - **Stopping the Reserved instances as soon as possible** : is incorrect because a stopped instance can still be restarted. 

- You are working for a FinTech startup as their AWS Solutions Architect. You deployed an application on different EC2 instances with Elastic IP addresses attached for easy DNS resolution and configuration. These servers are only accessed from 8 AM to 6 PM and can be stopped from 6 PM to 8 AM for cost efficiency using Lambda with the script that automates this based on tags.       
Which of the following will occur **when an EC2-VPC instance with an associated Elastic IP is stopped and started**? (Choose 2) 
  - **A1) All data on the attached instance-store devices will be lost.**
  - **A2) The underlying host for the instance is possibly changed.**
  - Since **only EBS-backed instances can be stopped and restarted**, it is implied that the instance is EBS-backed. If you stopped an EBS-backed EC2 instance, the volume is preserved but the data in any attached Instance store volumes will be erased. 
  - its Elastic IP address is disassociated from the instance if it is an EC2-Classic instance. Otherwise, if it is an EC2-VPC instance, the Elastic IP address remains associated.
  - Take note that an EBS-backed EC2 instance can have attached Instance Store volumes.

- Your IT Manager instructed you to set up a **bastion host** in the cheapest, most secure way, and that **you should be the only person that can access it via SSH**.      
Which of the following steps would satisfy your IT Manager's request?
  - **A) Set up a small EC2 instance and a security group which only allows access on port 22 via your IP address**
  - **bastion host** is a server whose purpose is to provide access to a private network from an external network, such as the Internet. Because of its exposure to potential attack, a bastion host must minimize the chances of penetration.

- The media company that you are working for has a video transcoding application running on Amazon EC2. Each EC2 instance polls a queue to find out which video should be transcoded, and then runs a transcoding process. **If this process is interrupted, the video will be transcoded by another instance based on the queuing system**. This application has a large backlog of videos which need to be transcoded. Your manager would like to reduce this backlog by adding more EC2 instances, however, **these instances are only needed until the backlog is reduced.**    
In this scenario, which type of Amazon EC2 instance is the most cost-effective type to use?
  - **A) Spot instances**
  - You require an instance that will be used not as a primary server but as a spare compute resource. These instances should also be terminated once the backlog has been significantly reduced. if the current process is interrupted, the video can be transcoded by another instance based on the queuing system. This means that the application can gracefully handle an unexpected termination of an EC2 instance
  - Amazon EC2 Spot instances are spare compute capacity in the AWS cloud available to you at steep discounts compared to On-Demand prices. Take note that there is no "bid price" anymore for Spot EC2 instances since March 2018. You simply have to set your "maximum price" instead.

- In Amazon EC2, you can manage your instances from the moment you launch them up to their termination. You can flexibly control your computing costs by changing the EC2 instance state. Which of the following statements is true regarding EC2 billing? (Choose 2)
  - **A1) You will be billed when your Reserved instance is in `terminated` state.**
    - Take note that Reserved Instances that applied to terminated instances are still billed until the end of their term according to their payment option.
  - **A2) You will be billed when your On-Demand instance is preparing to hibernate with a `stopping` state**
    - when the instance state is `stopping`, you will not billed if it is preparing to stop however, you will still be billed if it is just preparing to hibernate.
  - **You will not be billed when your On-Demand instance is in `pending` state**
  - **You will not be billed when your Spot instance is preparing to stop with a `stopping` state**
  - **You will not be billed for any instance usage while an instance is not in the running state** : is incorrect because You can still be billed if your instance is preparing to hibernate with a `stopping` state.

- You are automating the creation of EC2 instances in your VPC. Hence, you wrote a python script to trigger the Amazon EC2 API to request 50 EC2 instances in a single Availability Zone. However, you noticed that after 20 successful requests, subsequent requests failed.    
What could be a reason for this issue and how would you resolve it?
  - **A) There is a soft limit of 20 instances per region which is why subsequent requests failed. Just submit the limit increase form to AWS and retry the failed requests once approved.**

- A company is using a custom shell script to automate the deployment and management of their EC2 instances. The script is using various AWS CLI commands such as `revoke-security-group-ingress`, `revoke-security-group-egress`, `run-scheduled-instances` and many others.   
In the shell script, what does the **`revoke-security-group-ingress` command do**?
  - **A) Removes one or more ingress rules from a security group**

- You are a Solutions Architect in your company where you are tasked to set up a cloud infrastructure. In the planning, it was discussed that you will need two EC2 instances which should **continuously run for three years**. The CPU utilization of the EC2 instances is also expected to be stable and predictable.    
Which is the most cost-efficient Amazon EC2 Pricing type that is most appropriate for this scenario?
  - **A) Reserved Instances**
  - Reserved Instances are recommended for:
    - Applications with steady state usage
    - Applications that may require reserved capacity
    - Customers that can commit to using EC2 over a 1 or 3 year term to reduce their total computing costs

- A company is hosting EC2 instances that are on non-production environment and processing non-priority batch loads, which **can be interrupted at any time.**       
What is the best instance purchasing option which can be applied to your EC2 instances in this case?
  - **A) Spot Instances**

- You are using an On-Demand EC2 instance to host a legacy web application that uses an Amazon **Instance Store-Backed AMI**. The web application should be decommissioned as soon as possible and hence, you need to terminate the EC2 instance.    
When the instance is terminated, what happens to the data on the root volume?
  - **A) Data is automatically deleted**
  - AMIs are categorized as either **backed by Amazon EBS** or **backed by instance store**.
    - **backed by Amazon EBS** : the root device for an instance launched from the AMI is an Amazon EBS volume created from an Amazon EBS snapshot
    - **backed by instance store** : the root device for an instance launched from the AMI is an instance store volume created from a template stored in Amazon S3.
  - the data on instance store volumes persist only during the life of the instance which means that if the instance is terminated, the data will be automatically deleted.

- You have a web application hosted in an On-Demand EC2 instance in your VPC. You are creating a shell script that needs the instance's public and private IP addresses.    
What is the best way **to get the instance's associated IP addresses** which your shell script can use?
  - **A) By using a Curl or Get Command to get the latest metadata information from http://169.254.169.254/latest/meta-data/**

- To save costs, your manager instructed you to analyze and review the setup of your AWS cloud infrastructure. You should also provide an estimate of how much your company will pay for all of the AWS resources that they are using. In this scenario, **which of the following will incur costs**? (Select TWO.)
  - **A1) EBS Volumes attached to stopped EC2 Instances.**
  - **A2) A running EC2 Instance**
  - Amazon EC2가 AMI 인스턴스의 부팅 시퀀스를 시작(initiate)할 때 청구가 시작됩니다. 웹 서비스 명령, "shutdown -h"를 실행하거나 인스턴스 실패(failure)를 통해 인스턴스가 종료(terminate)되면 청구가 종료됩니다. 인스턴스를 중지(stop)하면 AWS가 인스턴스를 종료(shut down)하지만 중지된(stopped) 인스턴스 또는 데이터 전송 요금에 대한 시간당 요금은 청구하지 않지만, AWS는 Amazon EBS 볼륨의 스토리지 요금을 청구합니다.
  - **VPC** : VPC 자체 생성 및 사용에 대한 추가 비용은 없습니다.
  - **Public Data Set** : Amazon은 데이터 세트를 무료로 커뮤니티에 저장하고, 컴퓨팅 및 스토리지에 대해서만 비용을 지불합니다.

- A web application requires a **minimum of six** Amazon Elastic Compute Cloud (EC2) instances **running at all times**. You are tasked to deploy the application to **three availability zones** in the EU Ireland region (eu-west-1a, eu-west-1b, and eu-west-1c). It is required that the system is **fault-tolerant up to the loss of one Availability Zone**.    
Which of the following setup is the most cost-effective solution which also maintains the fault-tolerance of your system?
  - **A) 3 instances in eu-west-1a, 3 instances in eu-west-1b, and 3 instances in eu-west-1c**

- You have a distributed application in AWS that **periodically processes** large volumes of data across multiple instances. **You designed the application to recover gracefully from any instance failures**. You are required to launch the application in the most cost-effective way.    
Which type of EC2 instance will meet your requirements?
  - **A) Spot Instances**

- ou are the technical lead of the Cloud Infrastructure team in your company and you were consulted by a software developer regarding the required AWS resources of the web application that he is building. He knows that an Instance Store only provides ephemeral storage where the data is automatically deleted when the instance is terminated. To ensure that the data of his web application persists, the app should be launched in an EC2 instance that has a durable, block-level storage volume attached. He knows that they need to use an EBS volume, but they are not sure what type they need to use.     
In this scenario, which of the following is **true about Amazon EBS volume types** and their respective usage? (Select TWO.)
  - **A1) Provisioned IOPS volumes offer storage with consistent and low-latency performance, and are designed for I/O instensive applications such as large relational or NoSQL databases.**
  - **A2) Magnetic volumes provice the lowest cost per gigabyte of all EBS volume types and are ideal for workloads where data is accessed infrequently, and applications where the lowest storage cost is important**
  - **General Purpose (SSD) is the new, SSD-backed, general purpose EBS volume type that we recommend as the default choice for customers. General Purpose (SSD) volumes are suitable for a broad range of workloads, including small to medium sized databases, development, and test environments, and boot volumes.**

- You have a prototype web application that uses one **Spot EC2 instance**. What will happen to the instance by default if it gets interrupted by Amazon EC2 for capacity requirements?
  - **A) The instance will be terminated**
  - **Spot Instance**
    -스팟 인스턴스는 일반적으로 온 디맨드 가격을 크게 할인합니다.
    -2 분의 알림으로 용량 요구 사항에 따라 Amazon EC2에서 인스턴스를 중단 할 수 있습니다.
    -Spot 가격은 여분의 EC2 용량에 대한 장기 공급 및 수요에 따라 점진적으로 조정됩니다.
  - 중단(interruption)시 스팟 인스턴스를 terminated, stopped 또는 최대 절전 모드(hibernated)로 설정할 수 있습니다. 유지 옵션(**maintain** option)이 활성화(enabled) 된 영구 스팟 요청(persistent Spot requests) 및 스팟 집합(Spot Fleets)에 대해 Stop 및 hibernated 옵션을 사용할 수 있습니다. **By default, your instances are terminated**

- You had recently set up a CloudWatch Alarm that performs status checks on your EBS volume. However, you noticed that the volume check has a status of `insufficient-data`. What does this status mean?
  - **A) The check on the EBS volume is still in progress**
  - **Volume Status Monitoring**
    - 볼륨 상태 확인을 사용하여 Amazon EBS 볼륨에 있는 데이터의 잠재적 불일치를 더 잘 파악, 추적 및 관리할 수 있습니다. 볼륨 상태 확인은 Amazon EBS 볼륨이 손상되었는지 여부를 확인하는 데 필요한 정보를 제공하며, 잠재적으로 일치하지 않는 볼륨을 처리하는 방법을 제어하는 데 도움이 됩니다.
    - **`impaired`** : 볼륨 상태 확인은 5분마다 테스트를 자동으로 실행하여 통과 또는 실패 상태를 반환합니다. 모든 확인을 통과한 경우 볼륨의 상태는 `ok`이고, 확인에 실패한 경우 볼륨의 상태는 `impaired`입니다. Amazon EBS에서 볼륨의 데이터가 잠재적으로 일치하지 않는 것으로 확인하면 데이터 손상을 방지하기 위해 기본적으로 연결된 EC2 인스턴스에서 볼륨으로의 I/O가 비활성화됩니다. I/O가 비활성화되면 다음 볼륨 상태 확인에 실패하고 볼륨 상태는 `impaired`가 됩니다. 
    - **`insufficient-data`** : 볼륨에 대한 확인이 아직 진행 중일 수 있습니다. 볼륨 상태 확인의 결과를 보고 손상된 볼륨을 식별하고 필요한 조치를 취할 수 있습니다.
    - 볼륨 상태는 볼륨 상태 검사 결과를 기준으로 한 것으로, 볼륨 상태를 직접 반영하는 것은 아닙니다. 따라서 볼륨 상태가 `error` 상태의 볼륨을 나타내는 것은 아닙니다(예: 볼륨이 I/O를 허용할 수 없을 때).


- You are required to deploy a Docker-based batch application to your VPC in AWS. The application will be used to process both mission-critical data as well as non-essential batch jobs. Which of the following is the most cost-effective option to use in implementing this architecture? 
  - **A) Use ECS as the container management service then set up a combination of Reserved and Spot EC2 Instances for processing mission-critical and non-essential batch jobs respectively.**
  - Amazon ECS를 사용하면 Amazon EC2 온 디맨드 인스턴스, 예약 인스턴스 또는 스팟 인스턴스에서 관리 형 또는 사용자 지정 스케줄러를 사용하여 배치 워크로드를 실행할 수 있습니다. EC2 인스턴스 조합을 시작하여 워크로드에 따라 비용 효율적인 아키텍처를 설정할 수 있습니다.

- You are building a prototype for a cryptocurrency news website of a small startup. The website will be deployed to a Spot EC2 Linux instance and will use Amazon Aurora as its database. You requested a spot instance at a maximum price of $0.04/hr which has been fulfilled immediately and after 90 minutes, the spot price increases to $0.06/hr and then your instance was terminated by AWS.    
In this scenario, what would be the total cost of running your spot instance?
  - **A) $0.06**
  - $0.04 (60 minutes) + $0.02 (30 minutes) = $0.06
  - Q: 내 스팟 인스턴스가 중지되거나 중단된 경우 요금은 어떻게 청구됩니까?
    - 스팟 인스턴스가 첫 번째 인스턴스 시간에 Amazon EC2에 의해 종료되거나 중단되면 해당 사용에 대해서는 요금이 청구되지 않습니다. 하지만 사용자가 인스턴스를 직접 중지하거나 종료하는 경우 초 단위로 요금이 청구됩니다. 스팟 인스턴스가 이후 사용 시간 중에 Amazon EC2에 의해 종료되거나 중단되면 가장 가까운 초 단위로 올림하여 요금이 청구됩니다. Windows 또는 RHEL(Red Hat Enterprise Linux)에서 실행 중이고, 사용자가 스팟 인스턴스를 직접 중지하거나 종료하는 경우 1시간 전체 요금이 청구됩니다.
  - 스팟 인스턴스는 실행 중 다른 EC2 인스턴스와 똑같이 작동하며 더 이상 필요하지 않으면 종료 될 수 있습니다. 인스턴스를 종료하면 온 디맨드 또는 예약 인스턴스와 마찬가지로 사용 된 부분 시간에 대해 요금을 지불합니다. 그러나 스팟 가격이 최대 가격을 초과하고 Amazon EC2가 스팟 인스턴스를 중단 한 경우 부분 시간 사용에 대해서는 요금이 청구되지 않습니다.
  - 위의 단락은 스팟 인스턴스가 이후 1 시간 안에 Amazon EC2에 의해 종료되거나 중지 된 경우 가장 가까운 초 단위 요금이 청구된다고 공식 EC2 FAQ에서 말한 내용과 모순되는 것처럼 보일 수 있습니다. 따라서 위 단락은 스팟 인스턴스가 첫 번째 인스턴스 시간에만 Amazon EC2에 의해 종료되고 시나리오가 묘사하는 후속 시간 (60 분 이상) 동안이 아닌 경우에만 적용 할 수 있습니다.
