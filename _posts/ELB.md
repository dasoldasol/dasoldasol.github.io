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

- In Elastic Load Balancing, there are various security features that you can use such as Server Order Preference, Predefined Security Policy, Perfect Forward Secrecy and many others. **Perfect Forward Secrecy** is a feature that provides additional **safeguards against the eavesdropping of encrypted data** through the use of a unique random session key. This **prevents the decoding of captured data**, even if the secret long-term key is compromised.       
**Perfect Forward Secrecy is used to offer SSL/TLS cipher** suites **for** which two AWS services?
  - **A) CloudFront and Elastic Load Balancing**
  - CloudFront and Elastic Load Balancing are the two AWS services that support Perfect Forward Secrecy. SSL/TLS is commonly used when you have sensitive data travelling through the public network.

- You are helping out a new DevOps Engineer to design her first architecture in AWS. She is planning to develop a highly available and fault-tolerant architecture which is composed of an Elastic Load Balancer and an Auto Scaling group of EC2 instances deployed across multiple Availability Zones. This will be used by an online accounting application which **requires path-based routing, host-based routing, and bi-directional communication channels** using **WebSockets**.    
Which is the most suitable type of Elastic Load Balancer that you should recommend for her to use?
  - **A) Application Load Balancer**
  - **Application Load Balancer** : If you need flexible application management and **Path based routing, host-based routing**. HTTP(L7)
  - **Network Load Balancer** : If extreme **performance** and **static IP** is needed for your application. TLS Termination. TCP/UDP(L4)
  - **Classic Load Balancer** : If your application is **built within the EC2 Classic network**

- A travel company has a suite of web applications hosted in an Auto Scaling group of On-Demand EC2 instances behind an Application Load Balancer that handles traffic from various web domains such as `i-love-manila.com`, `i-love-boracay.com`, `i-love-cebu.com` and many others. To improve security and lessen the overall cost, you are instructed to secure the system by **allowing multiple domains to serve SSL traffic without the need to reauthenticate and reprovision your certificate everytime you add a new domain**. This migration from HTTP to HTTPS will help improve their SEO and Google search ranking.    
Which of the following is the most cost-effective solution to meet the above requirement?
  - **A) Upload all SSL certificates of the domains in the ALB using the console**     
  **and bind multiple certificates to the same secure listener on your load balancer.**    
  **ALB automatically choose the optimal TLS certificate for each client using Server Name Indication(SNI)**
  - **SSL(Server Secure Layer)** : SSL은 또한 웹 서버 인증, 서버 인증이라고 불리는데, 클라이언트와 서버 간의 통신을 제3자가 보증해주는 전자화된 문서다. 클라이언트가 서버에 접속한 직후에 서버는 클라이언트에게 이 인증서 정보를 전달한다.  HTTPS SSL 프로토콜 위에서 돌아가는 프로토콜이다. 즉 HTTPS로 데이터 전송을 시작할 때, SSL이 데이터 보안을 제공한다.
  - SNI Custom SSL relies on the SNI extension of the Transport Layer Security protocol, which allows multiple domains to serve SSL traffic over the same IP address by including the hostname which the viewers are trying to connect to.    
  You can host multiple TLS secured applications, each with its own TLS certificate, behind a single load balancer. In order to use SNI, all you need to do is bind multiple certificates to the same secure listener on your load balancer. ALB will automatically choose the optimal TLS certificate for each client. These features are provided at no additional charge.
  - **Using a wildcard certificate** : is incorrect because a wildcard certificate can only handle multiple sub-domains but not different domains.
  - **Adding a Subject Alternative Name (SAN) for each additional domain to your certificate** : is incorrect because although using SAN is correct, you will still have to reauthenticate and reprovision your certificate every time you add a new domain.
  - **Create a new CloudFront web distribution and configure it to serve HTTPS requests using dedicated IP addresses in order to associate your alternate domain names with a dedicated IP address in each CloudFront edge location** : is incorrect because although it is valid to use dedicated IP addresses to meet this requirement, this solution is not cost-effective. Remember that if you configure CloudFront to serve HTTPS requests using dedicated IP addresses, you incur an additional monthly charge. The charge begins when you associate your SSL/TLS certificate with your CloudFront distribution. You can just simply upload the certificates to the ALB and use SNI to handle multiple domains in a cost-effective manner.
