## Scenario
- You have identified a series of **DDoS attacks** while monitoring your VPC. As the Solutions Architect, you are responsible in fortifying your current cloud infrastructure to protect the data of your clients.    
Which of the following is the most suitable solution to mitigate these kinds of attacks?
  - **A) AWS Shield
  - In addition to the network and transport layer protections that come with Standard, AWS Shield Advanced provides additional detection and mitigation against large and sophisticated DDoS attacks, near real-time visibility into attacks, and integration with AWS WAF, a web application firewall.
  - **Firewall Manager** : is incorrect because the AWS Firewall Manager is mainly used to simplify your AWS WAF administration and maintenance tasks across multiple accounts and resources. It does not protect your VPC against DDoS attacks.
  - **AWS WAF** : Set up a web application firewall using AWS WAF to filter, monitor, and block HTTP traffic is incorrect because even though AWS WAF can help you block common attack patterns to your VPC such as **SQL injection or cross-site scripting**, this is still not enough to withstand DDoS attacks. 
  - **Security Groups and NACL** :  is incorrect because although using a combination of Security Groups and NACLs are valid to provide security to your VPC, this is not enough to mitigate a DDoS attack.



