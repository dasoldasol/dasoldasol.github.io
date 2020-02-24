## Feautures
- 3 types of Load Balancer
  - **Application Load Balancers** for intelligent routing
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
