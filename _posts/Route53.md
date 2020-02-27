## Route53 CheatSheet
### Features
- Highly available and scalable **DNS & Domain Registration** Service 
- Reliable and cost-effective way to route end users to Internet applications
- **Multi-region and backup architectures for High Availability**
  - ELB is limited to region, does NOT support multi region HA architecture
- supports private Intranet facing DNS service 
- **Internal resource record sets ONLY work for requests originating from within VPC** and currently cannot extend to on-premise
- Global propagation of any changes made to the DN records within 1 min
- **Alias resource record set** : points to ELB, S3, CloudFront. it is a Route53 extension to DNS. It's similar to a CNAME resource record set, but supports both for root domain-zone apex ex) example.com for subdomains for 'www.example.com
- **CNAME resource record set** : ONLY for subdomains and cannot be mapped to the zone apex record 
- **Split-view(Split-horizon)** DNS : enables you to access in internal version of your website using the same domain name that is used PUBLIC

### Routing Policy 
- **Simple Routing** : simple round robin policy 
- **Weighted round robin** : assign weights to resource records sets to specify the proportion ex) 80% : 20%
- **Latency Routing** : helps improve global applications as request are sent to server from the location with minimal latency, is based on the latency and CANNOT guarantee users from the same geographic will be served from the same location for any compliance reasons
- **Geolocation Routing** : Specify geographic locations by continent, country, state limited to US, is based on IP accuracy
- **Failover Routing** : failover to a backup site if the primary site fails and becomes unreachable 
- On Failover..
  - Active-Active : Weighted, Latency, Geolocation 
  - Active-Passive : Failover 

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
