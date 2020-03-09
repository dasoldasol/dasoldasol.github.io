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

## Scenarios 
- Your company hosts 10 web servers all serving the same web content in AWS. They want Route 53 to serve traffic to random web servers. Which routing policy will meet this requirement, and provide the best resiliency?
  - **Multivalue Routing**
  - Multivalue answer routing lets you configure Amazon Route 53 to return multiple values, such as IP addresses for your web servers, in response to DNS queries. Route 53 responds to DNS queries with up to eight healthy records and gives different answers to different DNS resolvers. The choice of which to use is left to the requesting service effectively creating a form or randomization.

- You have a static corporate website hosted in a standard S3 bucket and a new web domain name which was registered using Route 53. You are instructed by your manager to integrate these two services in order to successfully launch their corporate website.    
What are the **prerequisites when routing traffic using Amazon Route 53 to a website that is hosted in an Amazon S3 Bucket**? (Choose 2)
  - **A1) The S3 bucket name must be the same as the domain name**
  - **A2) A registered domain name**
  - A1) An S3 bucket that is configured to host a static website. The bucket must have the same name as your domain or subdomain. For example, if you want to use the subdomain portal.tutorialsdojo.com, the name of the bucket must be portal.tutorialsdojo.com.
  - A2) A registered domain name. You can use Route 53 as your domain registrar, or you can use a different registrar.

- You are an IT Consultant for an advertising company that is currently working on a proof of concept project that automatically provides SEO analytics for their clients. Your company has a VPC in AWS that operates in dual-stack mode in which IPv4 and IPv6 communication is allowed. You deployed the application to an Auto Scaling group of EC2 instances with an Application Load Balancer in front that evenly distributes the incoming traffic. You are ready to go live but you need to **point your domain name (tutorialsdojo.com) to the Application Load Balancer. **      
In Route 53, which record types will you use to **point the DNS name of the Application Load Balancer**? (Choose 2)
  - **A1) Alias with a type "AAAA" record set**
  - **A2) Alias with a type "A" record set**

- You have a cryptocurrency exchange portal which is hosted in an Auto Scaling group of EC2 instances behind an Application Load Balancer, and are deployed across multiple AWS regions. Your users can be found all around the globe, but the majority are from Japan and Sweden. Because of the compliance requirements in these two locations, you want your Japanese users to connect to the servers in the ap-northeast-1 Asia Pacific (Tokyo) region, while your Swedish users should be connected to the servers in the eu-west-1 EU (Ireland) region.    
Which of the following services would allow you to easily fulfill this requirement?
  - **A) Use Route53 Geolocation Routing Policy**
  - Setting up a new CloudFront web distribution with the geo-restriction feature enabled : is incorrect because the CloudFront geo-restriction feature is primarily used to prevent users in specific geographic locations from accessing content that you're distributing through a CloudFront web distribution. It does not let you choose the resources that serve your traffic based on the geographic location of your users.

- You have a new, dynamic web app written in MEAN stack that is going to be launched in the next month. There is a probability that the traffic will be quite high in the first couple of weeks. In the event of a load failure, **how can you set up DNS failover to a static website**?
  - **A) Use Route53 with the failover option to a static S3 website bucket or CloudFront distribution**
