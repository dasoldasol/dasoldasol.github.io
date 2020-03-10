## Scenario
- You have identified a series of **DDoS attacks** while monitoring your VPC. As the Solutions Architect, you are responsible in fortifying your current cloud infrastructure to protect the data of your clients.    
Which of the following is the most suitable solution to mitigate these kinds of attacks?
  - **A) AWS Shield**
  - In addition to the network and transport layer protections that come with Standard, AWS Shield Advanced provides additional detection and mitigation against large and sophisticated DDoS attacks, near real-time visibility into attacks, and integration with AWS WAF, a web application firewall.
  - **Firewall Manager** : is incorrect because the AWS Firewall Manager is mainly used to simplify your AWS WAF administration and maintenance tasks across multiple accounts and resources. It does not protect your VPC against DDoS attacks.
  - **AWS WAF** : Set up a web application firewall using AWS WAF to filter, monitor, and block HTTP traffic is incorrect because even though AWS WAF can help you block common attack patterns to your VPC such as **SQL injection or cross-site scripting**, this is still not enough to withstand DDoS attacks. 
  - **Security Groups and NACL** :  is incorrect because although using a combination of Security Groups and NACLs are valid to provide security to your VPC, this is not enough to mitigate a DDoS attack.

- A Solutions Architect working for a startup is designing a High Performance Computing (HPC) application which is publicly accessible for their customers. The startup founders want to **mitigate distributed denial-of-service (DDoS) attacks** on their application.
Which of the following options are **not** suitable to be implemented in this scenario? (Choose 2)
  - **A1) Add multiple Elastic Fabric Adapters (EFA) to each EC2 instance to increase the network bandwidth.**
    - is not a viable mitigation technique because Dedicated EC2 instances are just an instance billing option.
  - **A2) Use Dedicated EC2 intances to ensure that each instance has the maximum performance possible**
    - is not a viable option as this is mainly done for performance improvement, and not for DDoS attack mitigation. Moreover, you can attach only one EFA per EC2 instance. An Elastic Fabric Adapter (EFA) is a network device that you can attach to your Amazon EC2 instance to accelerate High-Performance Computing (HPC) and machine learning applications.
  - **Use an Amazon CloudFront service for distributing both static and dynamic content.**
  - **Use an Application Load Balancer with Auto Scaling groups for your EC2 instances then restrict direct Internet traffic to your Amazon RDS database by deploying to a private subnet.**
  - **Set up alerts in Amazon CloudWatch to look for high `Network In` and CPU utilization metrics.**
  - **Use AWS Shield and AWS WAF**

