## AutoScaling CheatSheet

### Scale out / Scale up
- **Scale Up** : t2.micro -> c3.2xlarge, increase EBS
- **Scale Out** :  you have more of the same resource separately working in parallel (ELB, Autoscaling)

### Features
- **ensures correct number of EC2 instances are always running** to handle the load by scaling up or down automatically as demand changes 
- **CANNOT** span **multiple regions**
- attemps to distribute instances evenly between AZs that are enabled for the Auto Scaling group
- **to determine the health of an instance** : using EC2 status checks or can use ELB health checks and terminates the instance if unhealthy, to launch a new instance 
- can be scaled using **manual scaling, scheduled scaling, demand based scaling**
- **cooldown period** helps ensure instances are not launched or terminated before the previous scaling activity takes affect to allow the newly launched instances to start handling traffic and reduce load 

### AutoScaling & ELB
- AutoScaling & ELB can used for **High Availability and Redundancy** by spanning Auto Scaling groups across multiple AZs within a region and then setting up ELB to distribute incoming traffic across those AZs
- **With AutoScaling use ELB health check with the instances to ensure that traffic is routed only to the healthy instances**

## Scenario
- A suite of web applications is hosted in an Auto Scaling group of EC2 instances across three Availability Zones and is configured with default settings. There is an Application Load Balancer that forwards the request to the respective target group on the URL path. The scale-in policy has been triggered due to the low number of incoming traffic to the application.    
**Which EC2 instance will be the first one to be terminated** by your Auto Scaling group?
  - **A) The EC2 instance launched from the oldest launch configuration**

- A tech company has a CRM application hosted on an Auto Scaling group of On-Demand EC2 instances. The application is **extensively used during office hours** from 9 in the morning till 5 in the afternoon. Their users are complaining that the performance of the application is **slow during the start of the day but then works normally after a couple of hours**. 
Which of the following can be done to ensure that the application works properly at the beginning of the day?
  - **A) Configure a Scheduled scaling policy for the Auto Scaling group to launch new instances before the start of the day**
  - **Scheduled scaling policy** will ensure that the instances are already scaled up and ready before the start of the day since this is when the application is used the most.
  - **Setting up an Application Load Balancer(ALB)** is incorrect Although the Application load balancer can also balance the traffic, it cannot increase the instances based on demand.

- You have a web application deployed in AWS which is currently running in the eu-central-1 region. You have an Auto Scaling group of On-Demand EC2 instances which are **using pre-built AMIs**. Your manager instructed you to implement disaster recovery for your system so in the event that **the application goes down in the eu-central-1 region, a new instance can be started in the us-west-2 region. **
As part of your disaster recovery plan, which of the following should you take into consideration?
  - **A) Copy the AMI from the eu-central-1 region to the us-west-2 region. Afterwards, create a new Auto Scaling group in the us-west-2 region to use this new AMI ID.**
  - In this scenario, the EC2 instances you are currently using depends on a pre-built AMI. This AMI is not accessible to another region hence, you have to copy it to the us-west-2 region to properly establish your disaster recovery instance.

- You are working for a commercial bank as an AWS Infrastructure Engineer handling the forex trading application of the bank. You have an Auto Scaling group of EC2 instances that allow your company to cope up with the current demand of traffic and achieve cost-efficiency. You want the Auto Scaling group to behave in such a way that it will follow a **predefined set of parameters before it scales down** the number of EC2 instances, which **protects your system from unintended slowdown or unavailability**.       
Which of the following statements are true regarding the **cooldown period**? (Choose 2)
  - **A1) Its default value is 300 seconds**
  - **A2) It ensures that Auto Scaling group does not launch or terminate additional EC2 instances before the previous scaling activity takes effect.** 
  - **Cooldown Period** : 휴지 기간은 scale up 또는 scale down 활동을 완료한 후 다른 scale up 활동을 시작하기 전까지의 시간입니다. 이 시간을 지정하는 목적은 새로운 scale up 작업을 개시하기 전에 새로 프로비저닝된 리소스가 수요를 처리할 시간을 제공하는 것입니다.
  - **Cooldown Period** is a configurable setting for your Auto Scaling group.
  
