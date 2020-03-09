## VPC CheatSheet
### Feature 
- helps define a logically isoloated dedicated virtual network within the AWS
- provides control of IP addressing using CIDR block from a minimum of /28 to maximum of /16 block size
- supports IPv4 and IPv6 addressing
- can be extended by associating secondary IPv4 CIDR blocks to VPC

### Components 
- **Internet Gateway** : access to the Internet
- **Virtual Gateway** : access to on-premises data center through **VPN** and **Direct Connect** connections
- VPC can have only 1 IGW and VGW
- **Route Tables** : determine where network traffic from subnet is directed 
- Ability to create **subnet** with VPC CIDR blocks 
- **NAT**(Network Address Translation) Server : provides outbound Internet access for EC2 instances in private subnets
- **EIP(Elastic IP)** : static, persistent public IP addresses
- Instances launched in the VPC will have a **Public IP** and can have a **Public or a Elastic UP** associated with it 
- **Security Groups / NACLs** : define security 
- **Flow logs** : capture information about the IP traffic going to and from network interfaces in VPC

### Tenancy option for instances 
- **shared** : by default. allows instances to be launched on shared tenancy
- **dedicated** : allows instances to be launched on a dedicated hardware 

### Route Tables 
- define rules, termed as routes, which determine **where network traffic** from subnet would be **routed**
- Each VPC has a Main ROute table, and can habe multiple custom route tables created 
- Every route table contains a local route that enables communication within a VPC which cannot be modified or deleted 
- Route priority is decided by matching the most specific route in the route table that matched the traffic 

### Subnets 
- **map to AZs** and do not span across AZs
- have CIDR range that is a portion of the whole VPC
- **CIDR ranged cannot overlap** between subnets within the VPC
- AWS **reserves 5 IP addresses in each subnet - first 4 and last one**
- Each subnet is **associated with a route table** which define its dehavior 
  - **Public Subnets** : inboud/outbound Internet connectivity via IGW
  - **Pricate Subnets** : outbound Internet connectivity via NAT or VGW
  - **Protected Subnets** : no outboud connectivity and used for regulated workloads

### Elastic Network Interface(ENI)
- a default ENI, eth0, is attached to an instance which cannot be detached with one or more secondary detachable ENIs(eth1-ethn)
- has primary private, one or more secondary private, public, Elastic IP address, security groups, MAC address and source/destination check flag attributes associated 
- AN ENI in one subnet can be attached to an instance in the same or another subnet, in the **same VPC** and the **same AZ**
- Security group membership of an ENI can be changed 
- with pre-allocated MAC address can be used for applications with special licensing requirements 

### Security Groups vs. Network Access Control Lists
|Security Group|NACL|
|:--------:|:--------:|
|Stateful|Stateless|
|at Instance level|at Subnet level|
|ONLY allows Allow rule|allows BOTH Allow and Deny rules|
|Evaluated as a Whole|Evaluated in defined Order|
- Security Groups at Instance level : Security groups act at the instance level, not the subnet level. each instance in a subnet in your VPC could be assigned to a different set of security groups

### Elasitc IP
- is a **static IP address** designed for dynamic cloud computing 
- is **associated with AWS account**, and not a particular instance 
- can be **remapped** from one instance to another instance 
- is **charged for non usage**, if not linked for any instance or instance associated is in stopped state 

### NAT
- allows **internet access** to instance in **private** subnet
- performs the function of both address translation and port address translation(PAT)
- needs **source/destination** check flag to be **disabled** as it is not actual destination of the traffic
- not supported for IPv6 traffic

### Egress-Only Internet Gateways 
- outbound communication over IPv6 from instances in the VPC to the Internet, and prevents the Internet from initiating an IPv6 connection with your instances 
- supports ONLY IPv6 traffic 

### Shared VPCs
- allows multiple AWS accounts to create their application resources, such as EC2 instances, RDS databases, Redshift clusters, and AWS Lambda functions, into shared, centrally-managed VPCs

### VPC Peering 
- allows routing of traffic between the peer VPCs **using private IP addresses** and no IGW or VGW required 
- No single point of failure and bandwidth bottlenecks 
- supports inter-region VPC peering 
- IP space or **CIDR blocks cannot overlap**
- **cannot be TRANSITIVE**, one-to-one relationship between 2 VPC
- Only 1 between any 2 VPCs and have to be explicitly peered 
- **Private DNS values cannot be resolved**
- Security groups from peered VPC can now be refered, however the VPC should be in the same region

### VPC Endpoints
- enables you to privately connect VPC to supported AWS services and VPC endpoint services powered by PrivateLink
- **does NOT require a public IP address, access over the Internet, NAT device, a VPN connection or Direct Connect**
- traffic between VPC & AWS service does not leave the Amazon network 
- are virtual devices 
- are horizontally scaled, redundant, and highly available VPC components that allow communication between instances in your VPC and services without imposing availability risks or bandwidth constraints on your network traffic 
- **Gateway Endpoints**
  - is a gateway that is a target for a specified route in the route table, used for traffic destined to a supported AWS service 
  - only **S3 and DynamoDB** are supported 
- **Interface Endpoints**
  - is an elastic network interface with a private IP address that serves as an entry point for traffic destined to a supported service 
  - services supported API Gateway, CloudFormation, CloudWatch, CloudWatch Events, CloudWatch Logs, CodeBuild, CodeCommit, Config, EC2 API, Elastic Load Balancing API, Elastic Container Registry, Elastic Container Service, Key Management Service, Kinesis Data Streams, SageMager, Secrets Manager, Security Token Service(STS), Service Catalog, SNS, SQS
  
### VPN
- provides secure IPSec connections from on-premise computers or services to AWS over the internet
- is quick to setup, is cheap however it depends on the Internet speed 

### Direct Connect 
- is a network service that provides an alternative to using Internet to utilize AWS services by using **private dedicated network connection**
- provides Virtual Interfaces 
  - **Private VIF** : access instances within an VPC via VGW
  - **Public VIF** : access non VPC services 
- **requires time to setup** probably months, and should not be considered as an option if turnaround time is less 
- **does NOT provide redundancy**, use either second direct connection or IPSec VPN connection
- Virtual Private Gateway is on the AWS side and Customer Gateway is on the Customer side
- **route propagation is enabled on VGW** and not on CGW

### Direct Connect vs. VPN IPSec
|Direct Connect|VPN IPSec|
|:--------:|:--------:|
|Expensive to setup & Takes time|Immediate|
|Dedicated private connections|Internet|
|Reduced data transfer rate|Internet data transfer cost|
|Consistent performance|Internet inherent variability|
|Do NOT provide Redundancy|Provide Redundancy|

## VPC(Virtual Private Network) Overview
- *** build your own VPC from memory!!!! ***
- What VPC can do 
  - Launch instances into a subnet of your choosing 
  - Assign custom IP in each subnet 
  - Configure route tables between subnets
  - Create internet gateway and attach it to VPC
  - Instance security groups
  - Subnet network access control lists(NACLs)
- Default VPC vs. Custom VPC
- VPC Peering
  - transitive peering X


## Features 
- Think of a VPC as a logical datacenter in AWS
- Consists of Internet Gateways, Route Tables, Network Access Control Lists(NACL), Subnets, Security Groups
- 1 Subnet = 1 Availability Zone 
- Security Groups are Stateful; Network Access Control Lists are Stateless
- NO TRANSITIVE PEERING


### VPC with Public & Private Subnets
![complete-vpc](./image/vpc-1.png)


## Build a VPC
### VPC default
![first-vpc-default](./image/vpc-2.png)
- Process : **Create VPC** (10.0.0.0/16)
- When you create VPC by default.. : Route Table, Network Access Control List(NACL), Security Group
- NOT by default.. : subnets, internet gateway


### Add Subnets
![vpc-with-subnets](./image/vpc-3.png)
- Process
  - **Create Subnet1**(10.0.1.0/24 - us-east-1a) -> **Create Subnet2**(10.0.2.0/24 - us-east-1b) -> **Make Subnet1 public**(enable auto-assign public IP)  
- US-EAST-1A in your account can be a completely different availability zone to US-EAST-1A in another account. The AZ's are randomized between AWS accounts.
- Amazon always reserves 5 IP addresses within you subnets.(the reason why you have 251 not 256) 


### Attach Internet Gateway & Make Instances in Subnets & Security Groups
![vpc-with-subnets](./image/vpc-4.png)
- Process 
  - **Attach Internet Gateway**
    - **Create Internet gateway & Attach to VPC** -> Check there's no subnet assocation to default-made Router Table -> **Create Public Route Table** -> **Edit Routes**(Internet gateway as target) -> **Edit Subnet Associations**(add Public Subnet) 
  - **Make Instances in Subnets** 
    - **Create WebServer Instance**(using Public Subnet, create security group SSH,HTTP) ->**Create DBServer Instance**(using Private Subnet, select default security group) 
  - **Connect Public & Private Subnets**
    - **Create DB Security Group**(to enable the connection **from public to private** ICMP 0-65535 MySQL SSH HTTP) -> **Change Security Group on DBServer Instance**  
- 1 Internet Gateway = 1 VPC
- Security Groups can't span VPCs. Security groups act at the instance level, not the subnet level.


## NAT Instances & NAT Gateways
- NAT : Network Address Translation
- idea : on private sn, i want to update & install software. public connection to internet.


### NAT Instances
![vpc-nat-instance](./image/vpc-5.png)
- Process
  - **Create NAT instance**(using Public subnet, Public security group) -> Change Source/Dest. Check disabled -> **Edit Private Route Table**(select NAT instance as target)
- when creating, Disable Source/Dest. Check on the Instance 
  - Each EC2 instance performs source/destination checks by default. This means that the instance must be the source or destination of any traffic it sends or receives. However, a NAT instance must be able to send and receive traffic when the source or destination is not itself. Therefore, you must disable source/destination checks on the NAT instance.
- must be in a PUBLIC subnet
- must be a route out of the private subnet to the NAT instance
- bottleneck? increase instance size.
- high availability using Autoscaling Groups, multiple subnets in different AZs, script to automate failover
- Behind a Security Group


### NAT Gateways
![vpc-nat-gateway](./image/vpc-6.png)
- Process
  - **Create NAT Gateway**(using Public subnet, ElasticIP) -> **Edit Private Route Table**(select NAT gateway as target)
- Redundant inside the AZ -> 1 NAT Gateway = 1 AZ
- scale automatically
- no need to patch
- not associated with security groups
- Automatically assigned a public ip
- Remember to update route tables
- No need to disable Source/Dest. Check 


## NACL(Network Access Control Lists) vs. Security Groups 
- VPC automatically comes with a default NACL, by default, it allows all outbound & inbound
- Custom NACL : by default, it denies all outbound & inbound until you add rules.
- Each Subnet must be associated with NACL. Subnet is automatically associated with the default NACL.
- Block IP : using NACL not Security Groups 
- you CAN associate a NACL with multiple subnets;
  - However, 1 subnet = 1 NACL
- numbered list of rules : starts with the lowest numbered rule 
- separate inbound & outbound rules can ALLOW or DENY traffic 
- NACLs are STATELESS; responses to allowed inbound traffic are following the rules for outbound traffic.

## Bastion vs. NAT
![vpc-bastion](./image/vpc-7.png)
- NAT is used to provide internet traffic to EC2 instances in a private subnets.(not used to SSH)
- Bastion is used to securely administer EC2 instances using SSH. 
- you canNOT use a NAT Gateway as a Bastion host

## Direct Connect
- direct connects your data center to AWS
- Use Case
  - high throughput workloads(ie lots of network traffic)
  - if you need a stable and reliable secure connection

## VPC EndPoint
- privately connect VPC to supported AWS services(the private subnet can connect to outside world)
- PrivateLink without requiring Internet Gateway, NAT, VPC connection, Direct Connect connection.
- Instances in your VPC do NOT require public IP to communicate with resources in the service.
- 2 types of EndPoint
  - Interface Endpoints
  - Gateway Endpoints : s3, dynamoDB
- traffic between your VPC and the other service does not leave the Amazon network when using VPC endpoints

## Scenarios 
- **An application running on EC2 instances processes sensitive information stored on Amazon S3. The information is accessed over the Internet. The security team is concerned that the Internet connectivity to Amazon S3 is a security risk.    
Which solution will resolve the security concern?**
  - **A) Access the data through a VPC endpoint for Amazon S3.**
  - VPC endpoints for Amazon S3 : provide secure connection to S3 bucket that do not require a gateway or NAT instances.
  - NAT Gateways & Internet Gateways : still route traffic over the Internet to the public endpoint for Amazon S3
  - VPN : There is NO WAY to connect to Amazon S3 via VPN

- **An organization is building an Amazon Redshift cluster in their shared services VPC. The cluster will host sensitive data.    
How can the organization control which networks can access the cluster?**
  - **A) Define a cluster security group for the cluster that allows access from the allowed networks**
  - A security group can grant access to traffic from the allowed networks via the **CIDR range** for each network.
  - VPC peering & VPN : are connectivity services and cannot control traffic for security.
  - Amazon Redshift user accounts address authentication and authorization at the user level : have NO control over network traffic.
  
- **A Solutions Architect is designing an online shopping application running in a VPC on EC2 instances behind an ELB Application Load Balancer. The instances run in an Auto Scaling group across multiple Availability Zones. The application tier must read and write data to a customer managed database cluster. There should be no access to the database from the Internet, but the cluster must be able to obtain software patches from the Internet.     
Which VPC design meets these requirements?**
  - **A) Public subnets for the application tier and NAT Gateway, and private subnets for the database cluster**
  - NAT Gateways must be deployed in public subnets.

- **You are tasked to host a web application in a new VPC with private and public subnets. In order to do this, you will need to deploy a new MySQL database server and a fleet of EC2 instances to host the application. In which subnet should you launch the new database server into?**
  - **A) The private subnet**

- **You have 1 security group associated with 10 On-Demand EC2 instances.  You then modified the security group to allow all inbound SSH traffic and then right after that, you created two new EC2 instances in the same security group.    
When will the changes be applied to the EC2 instances?**
  - **A) Immediately to all 12 instances in the security group.**
  - When you add or remove rules, those changes are automatically applied to all instances to which you've assigned the security group. Since the first 10 instances are already assigned to the security group, you can SSH into them immediately after the change. After adding the two new instances to the security group, you should be able to SSH into them as well.
  
- You are working as a Solutions Architect in a top software development company in Silicon Valley. The company has multiple applications hosted in their VPC. While you are monitoring the system, you noticed that multiple **port scans are coming in from a specific IP** address block which are **trying to connect to several AWS resources** inside your VPC. The internal security team has requested that all offending IP addresses be denied for the next 24 hours for security purposes.    
Which of the following is the best method to **quickly and temporarily deny access** from the specified IP addresses?
  - **A) Modify the Network Access Control List associated with all public subnets in the VPC to deny access from the IP Address block.**
  - network access control list (ACL) : To control the traffic coming in and out of your VPC network. It is an optional layer of security for your VPC that acts as a firewall for **controlling traffic in and out of one or more subnets.**
  - Security Group : although a Security Group acts as a firewall, it will only control both inbound and outbound traffic **at the instance level** and not on the whole VPC.

- In your AWS VPC, you need to add a new subnet that will allow you to host a total of 20 EC2 instances.    
Which of the following IPv4 CIDR block can you use for this scenario?
  - **A) 172.0.0.0/27**
  - **CIDR Block으로 총 IP 주소 갯수 구하는 법**
    - 1. **32 - CIDR Block mask number** : ex) 32 - 27 = **5**
    - 2. **2^(1번답)** : ex) 2^**5** = **32**
    
- You are instructed by your manager to set up a **bastion host** in your Amazon VPC and it should only be accessed from the corporate data center via SSH. What is the best way for you to achieve this?
  - **A) Create a small EC2 instance with a security group which only allows access on port 22 via the IP address of the corporate data center. Use a private key(.pem) file to connect to the bastion host.**
  - The best way to implement a bastion host is to create a small EC2 instance which should only have a security group from a particular IP address for maximum security. This will block any SSH Brute Force attacks on your bastion host. 
  -  It is also recommended to use a small instance rather than a large one because this host will only act as a jump server to connect to other instances in your VPC and nothing else.

- One member of your DevOps team consulted you about a connectivity problem in one of your Amazon EC2 instances. The application architecture is initially set up with **four EC2 instances, each with an EIP address that all belong to a public non-default subnet**. You launched another instance to handle the increasing workload of your application. The EC2 instances also belong to the same security group. Everything works well as expected except for one of the EC2 instances which is not able to send nor receive traffic over the Internet.    
Which of the following is the MOST likely reason for this issue?
  - **A) The EC2 instance does not have a public IP address associated with it.**
  - By default, nondefault subnets have the IPv4 public addressing attribute set to `false`, and default subnets have this attribute set to `true`.
  - Take note as well that the four EC2 instances all belong to a public **non-default subnet**. Which means that a new EC2 instance will not have a public IP address by default since the since IPv4 public addressing attribute is initially set to `false`.
  - **The route table is not properly configured to allow traffic to and from the Internet through the Internet gateway** : is incorrect because the other three instances, which are associated with the same route table and security group, do not have any issues.

- You have set up a VPC with public subnet and an Internet gateway. You set up an EC2 instance with a public IP as well. However, you are still **not able to connect to the instance via the Internet**. You checked its associated security group and it seems okay.    
What should you do to ensure you can connect to the EC2 instance from the Internet?
  - **A) Check the main route table and ensure that the right route entry to the Internet Gateway(IGW) is configured.**

- You have two On-Demand EC2 instances inside your Virtual Private Cloud in the same Availability Zone but are deployed to different subnets. One EC2 instance is running a database and the other EC2 instance a web application that connects with the database. You want to ensure that these two instances can communicate with each other for your system to work properly.    
What are the things you have to check **so that these EC2 instances can communicate inside the VPC**? (Choose 2)
  - **A1) Check the Network ACL if it allows communication between the two subnets.**
  - **A2) Check if all security groups are set to allow the application host to communicate to the database on the right port and protocol.**
  - **Check if the default route is set to a NAT instance or Internet Gateway (IGW) for them to communicate** : is incorrect because an Internet gateway is primarily used to communicate to the Internet.

- You are a Solutions Architect working for a large insurance company that deployed their production environment on a custom Virtual Private Cloud in AWS with a default configuration. The VPC consists of two private subnets and one public subnet. Inside the public subnet is a group of EC2 instances which are created by an Auto Scaling group and all of the instances are in the same Security Group. Your development team has created a new application which will be accessed by mobile devices via a custom port. This application has been deployed to the production environment and you need to open this port globally to the Internet.    
Which of the following is the correct procedure to meet this requirement?
  - **A) Open the custom port on the Security Group. Your EC2 instances will be able to use this port immediately.**
  - To allow the custom port, you have to change the Inbound Rules in your Security Group to allow traffic coming from the mobile devices. **Security Groups** usually **control the list of ports** that are allowed to be used by your **EC2 instances** and the **NACLs** **control** which network or **list of IP addresses** can connect to your **whole VPC**.
  - By default, **Network ACL allows all** inbound and outbound IPv4 traffic, then there is no point of explicitly allowing the port in the Network ACL. **Security Groups does not allow incoming traffic by default**, unlike Network ACL.

- A media company has two VPCs: VPC-1 and VPC-2 with **peering** connection between each other. **VPC-1 only contains private subnets** while VPC-2 only contains public subnets. The company uses a single AWS **Direct Connect** connection and a virtual interface to connect their on-premises network with VPC-1.    
Which of the following options **increase the fault tolerance of the connection to VPC-1**? (Choose 2)
  - **A1) Establish a hardware VPN over the Internet between VPC-1(private) and the on-premises network.**
  - **A2) Establish another AWS Direct Connect connection and private virtual interface in the same AWS region as VPC-1(private).**
  - Note that a **VPC peering** connection does not support edge to edge routing (**NOT TRANSITIVE**) for : 
    - A VPN connection or an AWS Direct Connect connection to a corporate network
    - An Internet connection through an Internet gateway
    - An Internet connection in a private subnet through a NAT device
    - A VPC endpoint to an AWS service; for example, an endpoint to Amazon S3.
    - (IPv6) A ClassicLink connection. You can enable IPv4 communication between a linked EC2-Classic instance and instances in a VPC on the other side of a VPC peering connection. However, IPv6 is not supported in EC2-Classic, so you cannot extend this connection for IPv6 communication.
    
- Your client is an insurance company that utilizes SAP HANA for their day-to-day ERP operations. Since you can’t migrate this database due to customer preferences, you need to integrate it with your current AWS workload in your VPC in which you are required to establish a **site-to-site VPN connection**.       
What needs to be configured outside of the VPC for you to have a successful site-to-site VPN connection?
  - **A) An Internet-routable IP address (static) of the customer gateway's external interface for the on-premises network**
  - 하드웨어 VPN 연결 또는 Direct Connect 연결이 지원되는 VPC의 경우, 인스턴스는 가상 프라이빗 게이트웨이의 인터넷 트래픽을 사용자의 기존 데이터 센터로 라우팅할 수 있습니다. 여기서 기존 송신 지점 및 네트워크 보안/모니터링 디바이스를 통해 인터넷에 액세스할 수 있습니다.
  - AWS Site-to-Site VPN 연결은 사용자의 VPC를 데이터센터에 연결합니다. Amazon은 인터넷 프로토콜 보안(IPsec) VPN 연결을 지원합니다. VPC와 데이터센터 간에 전송되는 데이터는 암호화된 VPN 연결을 통해 라우팅되어 전송 데이터의 기밀성과 무결성이 유지됩니다. Site-to-Site VPN 연결을 형성하는데 인터넷 게이트웨이는 필요하지 않습니다.
  - A customer gateway is a physical device or software application on your side of the VPN connection.    
To create a VPN connection, you must create a **customer gateway resource** in AWS, which provides information to AWS about your customer gateway device. Next, you have to set up an **Internet-routable IP address (static) of the customer gateway's external interface**.    
    
  ![vpn-connection](./image/vpn-connection.png)

- Your company is running a multi-tier web application farm in a virtual private cloud (VPC) that is not connected to their corporate network. They are connecting to the VPC over the Internet to manage the fleet of Amazon EC2 instances running in both the public and private subnets. You have added **a bastion host with Microsoft Remote Desktop Protocol (RDP) access** to the application instance security groups, but the company wants to further limit **administrative access** to all of the instances in the VPC.    
Which of the following bastion host deployment options will meet this requirement?
  - **A) Deploy a Windows Bastion host with an Elastic IP address in the "public" subnet and allow RDP access to bastion only from the corporate IP addresses.**
  - ![vpc-bastion](./image/vpc-bastion.png)
