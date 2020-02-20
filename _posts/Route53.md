## DNS
- convert ip address to human friendly domain names
- IPv4 vs. IPv6
- Top Level Domains
  - .com .gov .gov.au
  - IANA(Internet Assigned Numbers Authority) : top level domains are controlled by this in a root zone database
- **Domain Registrars** : InterNIC, ICANN, WhoIS database
- **Common DNS Types** : SOA Records, NS Records, A Records, CNAMES, MX Records, PTR Records
- **SOR(Start Of Authority Record)** : where DNS starts 
- **NS(Name Server) Records** : direct traffic (domain address -> top level domain -> NS Record -> SOA 
- **A Records** : a key to Translate the domain into IP address 
- **TTL(Time To Live)** : the length that a DNS record is cached
  - TTL take 48 hours the change takes effect. if you change TTL(1min) cache can be cleared and navigate to another IP)
- **CName(Canonical Name)** : m.naver.com (give a reference)
- Alias Records 

## Features
- Route 53 is named because : The DNS Port is on Port 53 and Route53 is a DNS Service
- you will NEVER get an IPv4 addresses for ELB
- Alias Record vs. CNAME : always choose A Record
  - A Record : batman -> phonenumber 
  - CNAME : bruce wayne -> batman (subdomain)
- You can buy domain names directly with AWS
- It can take 3 days to register depending on the circumstances. 
- **limit of # of domain names** : With Route53, 50. However, you can increase by contacting AWS Support

## Routing Policies 
- **Health Checks** : you can set health checks on record. if a record fails a health check it will be removed from Route53 until it passes the health check. (you can set SNS notification when fail)
- **Simple Routing** : pick 1 ip address randomly. you only have 1 record with multiple IP addresses
- **Weighted Routing** : weight each indivisual record (20% 80%)
- **Latency-Based Routing** : go to a region which has low latency(the fastest response)
- **Failover Routing** : active/passive(Primary/Secondary) set up-> Primary health check -> if Primary record set fails(EC2 instance Stop) -> automatic failover
- **Geolocation Routing** : European Customer -> EU-WEST-1 / US Customer -> US-EAST-1
- **Geoproximity Routing**(Traffic Flow Only)
- **Multivalue Answer Routing** : similar to Simple Routing + put health checks on each record set. ex) service effectively creating a form or randomization
