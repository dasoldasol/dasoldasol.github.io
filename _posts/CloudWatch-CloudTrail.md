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
  - 
