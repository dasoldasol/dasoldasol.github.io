---
title: "AutoScaling"
excerpt: "AWS AutoScaling"
toc: true
toc_sticky: true
categories:
  - AWS
modified_date: 2020-02-24 09:36:28 +0900
---
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
  - **Scheduled scaling policy** : 스케줄링된 스케일링 정책은 애플리케이션이 가장 많이 사용되는 시간 전에 인스턴스가 이미 스케일 업되고 준비되도록합니다.
  - **Setting up an Application Load Balancer(ALB)** is incorrect. Application Load Balancer에서도 트래픽의 균형을 맞출 수 있지만 수요에 따라 인스턴스를 늘릴 수는 없습니다.

- You have a web application deployed in AWS which is currently running in the eu-central-1 region. You have an Auto Scaling group of On-Demand EC2 instances which are **using pre-built AMIs**. Your manager instructed you to implement disaster recovery for your system so in the event that **the application goes down in the eu-central-1 region, a new instance can be started in the us-west-2 region.**
As part of your disaster recovery plan, which of the following should you take into consideration?
  - **A) Copy the AMI from the eu-central-1 region to the us-west-2 region. Afterwards, create a new Auto Scaling group in the us-west-2 region to use this new AMI ID.**
  - 이 시나리오에서 현재 사용중인 EC2 인스턴스는 사전 구축 된 AMI에 따라 다릅니다. 이 AMI는 다른 리전에 액세스 할 수 없으므로 재해 복구 인스턴스를 올바르게 설정하려면 us-west-2 리전에 복사해야합니다.

- You are working for a commercial bank as an AWS Infrastructure Engineer handling the forex trading application of the bank. You have an Auto Scaling group of EC2 instances that allow your company to cope up with the current demand of traffic and achieve cost-efficiency. You want the Auto Scaling group to behave in such a way that it will follow a **predefined set of parameters before it scales down** the number of EC2 instances, which **protects your system from unintended slowdown or unavailability**.       
Which of the following statements are true regarding the **cooldown period**? (Choose 2)
  - **A1) Its default value is 300 seconds**
  - **A2) It ensures that Auto Scaling group does not launch or terminate additional EC2 instances before the previous scaling activity takes effect.** 
  - **Cooldown Period** : 휴지 기간은 scale up 또는 scale down 활동을 완료한 후 다른 scale up 활동을 시작하기 전까지의 시간입니다. 이 시간을 지정하는 목적은 새로운 scale up 작업을 개시하기 전에 새로 프로비저닝된 리소스가 수요를 처리할 시간을 제공하는 것입니다.
  - **Cooldown Period** is a configurable setting for your Auto Scaling group.
  
- You are working as a Solutions Architect for a global game development company. They have a web application currently running on twenty EC2 instances as part of an Auto Scaling group. All twenty instances have been running at a maximum of 100% CPU Utilization for the past 40 minutes however, the Auto Scaling group has not added any additional EC2 instances to the group.      
What could be the root cause of this issue? (Choose 2)
  - **A1) The maximum size of your Auto Scaling group is set to 20**
  - **A2) You already have 20 on-demand instances running in your entire VPC.**
  - Auto Scaling 그룹의 최대 크기에 이미 도달 한 경우 새 EC2 인스턴스가 생성되지 않습니다.

- A tech company is currently using Auto Scaling for their web application. A new AMI now needs to be used for launching a fleet of EC2 instances.    
Which of the following changes needs to be done?
  - **A) Create a new launch configuration.**
  
- You have an Auto Scaling group which is configured to launch new `t2.micro` EC2 instances when there is a significant load increase in the application. To cope with the demand, you now need to replace those instances with a larger `t2.2xlarge` instance type. How would you implement this change?
  - **A) Create a new launch configuration with the new instance type and update the Auto Scaling Group.**
  - 한 번에 Auto Scaling 그룹에 대해 하나의 시작 구성 만 지정할 수 있으며 시작 구성을 생성 한 후에는 수정할 수 없습니다.
  - 새로운 인스턴스 유형으로 새로운 시작 구성을 먼저 생성 한 다음 기존 Auto Scaling 그룹에 연결해야합니다.
  
- A loan processing application is hosted in a single On-Demand EC2 instance in your VPC. To improve the scalability of your application, you have to use Auto Scaling to automatically add new EC2 instances to handle a surge of incoming requests.
Which of the following items should be done **in order to add an existing EC2 instance to an Auto Scaling group**? (Select TWO.)
  - **A1) You have to ensure that the AMI used to launch the instance still exists.**
  - **A2) The instance is launched into one of the Availability Zones defined in your Auto Scaling group.**
  - Amazon EC2 Auto Scaling은 하나 이상의 EC2 인스턴스를 기존 Auto Scaling 그룹에 연결하여 자동 확장을 활성화하는 옵션을 제공합니다. 인스턴스가 연결되면 Auto Scaling 그룹의 일부가 됩니다.
  - 연결하려는 인스턴스는 다음 기준을 충족해야합니다.
    - 인스턴스가 `running` 상태입니다.
    - 인스턴스를 시작하는 데 사용된 AMI가 여전히 존재해야합니다.(the AMI used to launch the instance still exists)
    - 인스턴스가 다른 Auto Scaling 그룹의 구성원이 아닙니다.
    - 인스턴스가 Auto Scaling 그룹에 정의된 가용 영역 중 하나에서 시작됩니다.
    - Auto Scaling 그룹에 연결된 로드 밸런서가 있는 경우 인스턴스와 로드 밸런서는 모두 EC2-Classic 또는 동일한 VPC에 있어야합니다. Auto Scaling 그룹에 연결된 대상 그룹(Target Group)이 있는 경우 인스턴스와 로드 밸런서는 모두 동일한 VPC에 있어야합니다.

- An online shopping platform is hosted on an Auto Scaling group of On-Demand EC2 instances with a default Auto Scaling termination policy and **no instance protection configured**. The system is deployed across three Availability Zones in the US West region (us-west-1) with an Application Load Balancer in front to provide high availability and fault tolerance for the shopping platform. The us-west-1a, us-west-1b, and us-west-1c Availability Zones have 10, 8 and 7 running instances respectively. Due to the low number of incoming traffic, the scale-in operation has been triggered.   
Which of the following will **the Auto Scaling group do to determine which instance to terminate first** in this scenario? (Select THREE.)
  - **A1) Select the instances with the oldest launch configuration.**
  - **A2) Select the instance that is closest to the next billing hour.**
  - **A3) Choose the Availability Zone with the most number of instances, which is the us-west-1a Availity Zone in this scenario.**
  - 기본 종료 정책(default termination policy) 동작 방식 
    - 1. 인스턴스가 가장 많으며 축소로부터 보호되지 않는 인스턴스가 최소 하나 이상 있는 가용 영역을 확인합니다.
    - 2. 종료할 인스턴스를 결정하고 종료 중인 온디맨드 또는 스팟 인스턴스의 할당 전략에 나머지 인스턴스를 맞춥니다. 이는 할당 전략을 지정하는 Auto Scaling 그룹에만 적용됩니다.    
    예를 들어 인스턴스가 시작된 후 기본 설정 인스턴스 유형의 우선 순위를 변경할 경우, 축소 이벤트가 발생했을 때 Amazon EC2 Auto Scaling이 온디맨드 인스턴스를 우선 순위가 낮은 인스턴스 유형에서 점진적으로 이동하려고 시도합니다.
    - 3. 이 중에서 가장 오래된 시작 템플릿 또는 구성을 사용하는 인스턴스가 있는지 확인합니다.
    - 4. 위의 기준에 따라 종료할 비보호 인스턴스가 여러 개 있는 경우, 다음 결제 시간에 가장 근접한 인스턴스가 무엇인지 확인합니다. 다음 번 결제 시간에 가장 근접한 비보호 인스턴스가 여러 개인 경우 이러한 인스턴스 중 하나를 임의로 종료합니다.

- An application is hosted in an Auto Scaling group of EC2 instances. To improve the monitoring process, you have to configure the current capacity to increase or decrease based on a set of scaling adjustments. This should be done by **specifying the scaling metrics and threshold values for the CloudWatch alarms** that **trigger the scaling process**.    
Which of the following is the most suitable type of scaling policy that you should use?
  - **A) Step scaling**
  - 단계 조정(Step scaling)을 사용하면 조정 프로세스를 트리거하는 CloudWatch 경보에 대한 스케일링 메트릭 및 임계 값을 선택하고, 임계 값이 지정된 수의 평가 기간 동안 위반 될 때, 확장 가능한 대상의 스케일링 방법을 정의할 수 있습니다. 단계 조정 정책은 확장 가능한 대상의 현재 용량을 늘리거나 줄입니다. 조정은 경보 위반의 크기에 따라 다릅니다. 스케일링 활동이 시작된 후에는 스케일링 활동이 진행되는 동안에도 정책이 추가 경보에 계속 응답합니다. 따라서 위반된 모든 경보는 경보 메시지를 수신 할 때 Application Auto Scaling에서 평가합니다.
  - Amazon EC2 Auto Scaling은 다음 유형의 조정 정책을 지원합니다.    
    - 대상 추적 조정(**Target tracking scaling**) : 특정 지표의 목표 값을 기준으로 그룹의 현재 용량을 늘리거나 줄입니다. 이 작업은 온도 조절기가 집안 온도를 유지하는 방식과 비슷합니다. 사용자가 온도만 선택하면 나머지는 온도 조절기가 알아서 합니다.
    - 단계 조정(**Step scaling**) : 그룹의 현재 용량을 일련의 조정 조절에 따라 늘리거나 줄이며 경보 위반의 크기에 따라 달라지는 단계 조절이라고 합니다.
    - 단순 조정(**Simple scaling**) : 그룹의 현재 용량을 단일 조정 조절에 따라 늘리거나 줄입니다.
  - Auto Scaling 그룹의 인스턴스 수에 비례하여 증가하거나 감소하는 사용률 수치를 기준으로 조정하는 경우 대상 추적 조정 정책을 사용하는 것이 좋습니다. 그렇지 않은 경우 단계 조정 정책을 사용하는 것이 좋습니다.
  - **예약조정(Scheduled Scaling)** : is incorrect. 예약된 조정 정책은 **예측 가능한(predictable)** 로드 변경을 위해 자체 조정 일정을 설정할 수있는 일정을 기반으로하기 때문입니다. 이것은 동적 스케일링 유형 중 하나로 간주되지 않습니다

- You just joined a large tech company with an existing Amazon VPC. When reviewing the Auto Scaling events, you noticed that their web application is **scaling up and down multiple times within the hour**.    
What design change could you make to **optimize cost while preserving elasticity**?
  - **A) Change the cooldown period of the Auto Scaling group and set the CloudWatch metric to a higher threshold.**
  - **휴지 기간(cooldown period)** 은 Auto Scaling 그룹에 대해 구성 가능한 설정으로, **이전 조정 활동이 적용되기 전에 추가 인스턴스를 시작하거나 종료하지 않도록**합니다. Auto Scaling 그룹은 간단한 조정 정책을 사용하여 **동적으로 조정 한 후 조정 작업을 다시 시작하기 전에 휴지 기간이 완료 될 때까지 기다립니다**.
  - Auto Scaling 그룹을 **수동으로 조정**하는 경우 기본값은 휴지 기간을 기다리는 것이 아니라 **기본값을 무시하고 휴지 기간을 준수** 할 수 있습니다.    
  인스턴스가 비정상 상태가되면 Auto Scaling 그룹은 비정상 인스턴스를 교체하기 전에 휴지 기간이 완료 될 때까지 기다리지 않습니다.
