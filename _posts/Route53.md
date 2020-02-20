## DNS
- convert ip address to human friendly domain names
- IPv4 vs. IPv6
- Top Level Domains
  - .com .gov .gov.au
  - IANA(Internet Assigned Numbers Authority) : top level domains are controlled by this in a root zone database
- Domain Registrars : InterNIC, ICANN, WhoIS database
- Common DNS Types : SOA Records, NS Records, A Records, CNAMES, MX Records, PTR Records
- SOR(Start Of Authority Record) : where DNS starts 
- NS(Name Server) Records : direct traffic (domain address -> top level domain -> NS Record -> SOA 
- A Records : a key to Translate the domain into IP address 
- **TTL(Time To Live)** : the length that a DNS record is cached
  - TTL take 48 hours the change takes effect. if you change TTL(1min) cache can be cleared and navigate to another IP)
- CName(Canonical Name) : m.naver.com (give a reference)
- Alias Records 

## Features
- you will NEVER get an IPv4 addresses for ELB
- Alias Record vs. CNAME : always choose A Record
- You can buy domain names directly with AWS
- It can take 3 days to register depending on the circumstances. 

## Routing Policies 
- Simple Routing : pick 1 ip address randomly. you only have 1 record with multiple IP addresses
- Weighted Routing : weight each indivisual record (20% 80%)
  - Health Checks : you can set health checks on record. if a record fails a health check it will be removed from Route53 until it passes the health check. (you can set SNS notification when fail)
- 
