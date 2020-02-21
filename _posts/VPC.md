## VPC(Virtual Private Network) Overview
- *** build your own VPC from memory!!!! ***
- What VPC can do 
- Default VPC vs. Custom VPC
- VPC Peering
  - transitive peering X

## Features 
- Think of a VPC as a logical datacenter in AWS
- Consists of Internet Gate Ways(Or Virtual Private Gateways), Route Tables, Network Access Control Lists(NACL), Subnets, Security Groups
- 1 Subnet = 1 Availability Zone 
- Security Groups are Stateful; Network Access Control Lists are Stateless
- NO TRANSITIVE PEERING
<div>
  <img width="1134" alt="vpc-1" src="https://user-images.githubusercontent.com/29423260/74993146-7d728300-548d-11ea-94a3-6bd0a7e9a9c1.png">
</div>

## Build a VPC
- When you create VPC by default.. : Route Table, Network Access Control List(NACL), Security Group
- NOT by default.. : subnets, internet gateway
- US-EAST-1A in your account can be a completely different availability zone to US-EAST-1A in another account. The AZ's are randomized.
- Amazon always reserves 5 IP addresses within you subnets.(the reason why you have 251 not 256)
- 1 Internet Gateway = 1 VPC
- Security Groups can't span VPCs. 

## NAT Instances & NAT Gateways
- NAT : Network Address Translation
- idea : on private sn, i want to update & install software 
- **NAT Instances**
  - when creating, Disable Source/Dest. Check on the Instance 
  - must be in a PUBLIC subnet
  - must be a route out of the private subnet to the NAT instance
  - bottleneck? increase instance size.
  - high availability using Autoscaling Groups, multiple subnets in different AZs, script to automate failover
  - Behind a Security Group
- **NAT Gateways**
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
- NAT is used to provice internet traffic to EC2 instances in a private subnets.(not used to SSH)
- Bastion is used to securely administer EC2 instances using SSH. 
- you canNOT use a NAT Gateway as a Bastion host

## Direct Connect
- direct connects your data center to AWS
- Use Case
  - high throughput workloads(ie lots of network traffic)
  - if you need a stable and reliable secure connection

## VPC EndPoint
- privately connect VPC to supported AWS services
- PrivateLink without requiring Internet Gateway, NAT, VPC connection, Direct Connect connection.
- Instances in your VPC do NOT require public IP to communicate with resources in the service.
- Interface Endpoints
- Gateway Endpoints : s3, dynamoDB
