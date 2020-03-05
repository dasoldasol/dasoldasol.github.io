## Load Balancer CheatSheet
- Managed load balanding service and scales automatically 
- **distributes** incoming application **traffic** across multiple EC2 instances 
- **is distributed system that is fault tolerant and actively monitored by AWS scales it as per the demand**
- are engineered to **not be a single point of failure**
- need to **Pre-Warm** ELB if the demand is expected to shoot especially during load testing 
- supports routing traffic to instances in **multiple AZs in the same region**
- **Health Checks** : to route traffic only to the healthy instances 
- supports Listners with HTTP, HTTPS, SSL, TCP protocols 
- has an associated IPv4 and dual stack DNS name 
- **Connect draining** : to help complete the in-flight requests in case an instance is deregistered
- **For High Availability** : it is recommended to attach 1 subnet per AZ for 2 AZs, even if the instances are in a single subnet
- **canNOT assign an Elastic IP** adresses to an ELB
- IPv4 & IPv6 support

### SSL
- **SSL termination** : can offload the work of encryption and decryption so that the EC2 instances can focus on their main work
- **HTTP listener does NOT support Client Side Certificate**
- **SSL termination at backend instances/support for Client Side Certificate** use TCP for connections from the client to the ELB, use the SSL protocol for connections from the ELB to the back-end application, and deploy certificates on the back-end instances handling requests. 
- supports a **single SSL certificate**, so for multiple SSL certificate multiple ELBs need to be created 

### Cross Zone Load Balancing 
- to help route traffic evenly across all EC2 instances regardless of the AZs they reside in
- to help **identify client IP**
  - **Proxy Protocol header** for TCP/SSL connections
  - **X-Forward headers** for HTTP/HTTPS connections 

### Stick Sessions (session affinity)
- to bind a user's session to a specific application instance
- it is NOT fault tolerant : if an instance is lost, the information is lost
- requires HTTP/HTTPS listener and does NOT work with TCP
- requires SSL termination on ELB as it uses the headers 

## Feautures
- 3 types of Load Balancer
  - **Application Load Balancers** for intelligent routing : distinguish traffic for different targets (mysite.co/accounts vs. mysite.co/sales vs. mysite.co/support) and distribute traffic based on rules for target group, condition, and priority.
  - **Network Load Balancers** for very high performance or static IP, only L4
  - **Classic Load Balancers** for low cost and don't need any intelligence built in 
- **504** Error : The gateway was timed out. The application not responding within the timeout period 
  - Trouble shoot the application. NOT ELB. Is it the Web Server or Database Server?
- For Classic Load Balancers, If you need the PUBLIC IPv4 address of your end user, look for the **X-Forwared-For** header 
- Instances monitored by ELB are reported as; InService or OutofService
- **Health Checks** check the instance health by talking to it
- Load Balancers have their own **DNS** name. NOT IP
- !!! Read ELB FAQ for Classic Load Balancers !!!

- **Advanced Load Balancer Theory**
  - **Sticky Sessions** enable your users to stick to the same EC2 instance. Can be useful if you are storing information locally to that instance
  - **Cross Zone Load Balancing** enables you to load balance across multiple availability zones 
  - **Path patterns** allow you to direct traffic to different EC2 instances based on the URL contained in the request ex) www.myurl.com -> EC2-01 / www.myurl.com/images -> EC2-02
- **Target Group**

## Scenario
- **There are many clients complaining that the online trading application of an investment bank is always down. Your manager instructed you to re-design the architecture of the application to prevent the unnecessary service interruptions. To ensure high availability, you set up the application to use an ELB to distribute the incoming requests across an auto-scaled group of EC2 instances in two single Availability Zones.    
In this scenario, what happens when an EC2 instance behind an ELB fails a health check?**
  - **A) The ELB stops sending traffic to the EC2 instance**
  - When the load balancer determines that an instance is unhealthy, it stops routing requests to that instance. The load balancer resumes routing requests to the instance when it has been restored to a healthy state.

- You have a new e-commerce web application written in Angular framework which is deployed to a fleet of EC2 instances behind an Application Load Balancer. You configured the load balancer to perform health checks on these EC2 instances.    
What will happen **if one of these EC2 instances failed the health checks**?
  - **A) The Application Load Balancer stops sending traffic to the instance that failed its health check**
  - Each load balancer node routes requests only to the healthy targets. Each load balancer node checks the health of each target, using the health check settings for the target group with which the target is registered. After your target is registered, it must pass one health check to be considered healthy. After each health check is completed, the load balancer node closes the connection that was established for the health check.


