## Features 
- **CloudWatch** : performance 
- standard monitoring : every 5 min by default 
- detailed monitoring : interval 1min available 
- alarms trigger notifications 
- **CloudTrail** : auditing. **API** calls in the AWS platform. (define who)
- Features : Dashboard, Alarm, Event, Logs 

## Scenarios
- You are an AWS Solutions Architect designing an online analytics application that uses Redshift Cluster for its data warehouse. Which service will allow you to **monitor all API calls** to your Redshift instance and can also provide secured data for **auditing and compliance** purposes?
  - **A) CloudTrail for security logs**
  - CloudTrail enables povernance, compliance, operational auditing, and risk auditing of your AWS account. You can log, continuously monitor, and retain account activity including actions taken through the AWS Management Console, AWS SDKs, command line tools, API calls, and other AWS services.

- A Solutions Architect is working for a company which has multiple VPCs in **various AWS regions**. The Architect is assigned to set up a **logging system** which will track all of the changes made to their AWS resources in all regions, including the configurations made in IAM, CloudFront, AWS WAF, and Route 53. In order to pass the compliance requirements, the solution must ensure the security, integrity, and durability of the log data. **It should also provide an event history of all API calls** made in AWS Management Console and AWS CLI.    
Which of the following solutions is the best fit for this scenario?
  - **A) Set up a new CloudTrail trail in a new S3 bucket using the AWS CLI and also pass both the `--is-multi-region-trail` and `--include-global-service-events` parameters then encrypt log files using KMS encryption. Apply Multi Factor Authentication(MFA) Delete on the S3 bucket and ensure that only authorized users can access the logs by configuring the bucket policies**
  - CloudTrail can be used for this case with multi-region trail enabled, however, it will only cover the activities of the regional services (EC2, S3, RDS etc.) and not for global services such as IAM, CloudFront, AWS WAF, and Route 53. In order to satisfy the requirement, you have to add the `--include-global-service-events parameter` in your AWS CLI command.

- Your cloud architecture is composed of Linux and Windows EC2 instances which process high volumes of financial data 24 hours a day, 7 days a week. To ensure high availability of your systems, you are required to **monitor the memory and disk utilization** of all of your instances.       
Which of the following is the most suitable monitoring solution to implement?
  - **A) Install the CloudWatch agent to all of your EC2 instances which gathers the memory and disk utilization data. View the custom metrics in the Amazon CloudWatch console**
  - by default, CloudWatch does not automatically provide memory and disk utilization metrics of your instances. You have to set up custom CloudWatch metrics to monitor the memory, disk swap, disk space and page file utilization of your instances.
  - **Enhanced Monitoring** : is incorrect because Enhanced Monitoring is a feature of RDS and not of CloudWatch.
  - **Amazon Inspector** : is incorrect because Amazon Inspector is an automated security assessment service that helps you test the network accessibility of your Amazon EC2 instances and the security state of your applications running on the instances. It does not provide a custom metric to track the memory and disk utilization of each and every EC2 instance in your VPC.

- The company that you are working for has a highly available architecture consisting of an elastic load balancer and several EC2 instances configured with auto-scaling in three Availability Zones. You want to monitor your EC2 instances based on a particular metric, which is not readily available in CloudWatch.      
Which of the following is a **custom metric in CloudWatch which you have to manually set up**?
  - **A) Memory Utilization of an EC2 instance**
  - You need to prepare a custom metric using CloudWatch Monitoring Scripts which is written in Perl. You can also install CloudWatch Agent to collect more system-level metrics from Amazon EC2 instances. Here's the list of custom metrics that you can set up:
    - **Memory utilization**
    - **Disk swap utilization**
    - **Disk space utilization**
    - **Page file utilization**
    - **Log collection**
  - CloudWatch by default :    
    ![cloudwatch-default](./image/cloudwatch-default.png)
 
- The operations team of your company asked you for a way to monitor the health of your production EC2 instances in AWS. You told them to use the CloudWatch service.    
Which of the following metrics is **not available by default in CloudWatch**? 
  - **A) Memory Usage**
  - by default : **Network In and Out, CPU Usage, Disk Read Operations**

- One of your EC2 instances is reporting an unhealthy system status check. The operations team is looking for an easier way to monitor and repair these instances instead of fixing them manually.
How will you **automate the monitoring and repair of the system status check failure** in an AWS environment?
  - **A) Create CloudWatch alarms that stop and start the instance based on status check alarms**
  - **Using Amazon CloudWatch alarm actions**, you can create alarms that automatically stop, terminate, reboot, or recover your EC2 instances.
