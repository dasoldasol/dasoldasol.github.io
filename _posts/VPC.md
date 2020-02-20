## VPC(Virtual Private Network) Overview
- *** build your own VPC !!!! ***
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
- ** NAT Gateways **
  - Redundant inside the AZ -> 1 NAT Gateway = 1 AZ
  - scale automatically
  - no need to patch
  - not associated with security groups
  - Automatically assigned a public ip
  - Remember to update route tables
  - No need to disable Source/Dest. Check 
  
