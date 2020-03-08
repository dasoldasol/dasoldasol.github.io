## CloudFormation
- Is a way of completely scripting your cloud environment
- Quick Start is a bunch of CloudFormation **templates** already built by AWS Solutions Architects allowing you to create complex environments very quickly.
- **collection of related AWS resources**
- **"infrastructure as code"**


## Elastic Beanstalk
- quickly deploy and manage applications 
- automatically handles deployment details 
- PAAS(platform-as-a-service)

## AWS OpsWorks
- configuration management service that provides managed instances of Chef and Puppet.
- lets you use **Chef and Puppet** to automate how servers are configured, deployed, and managed across your EC2 instances or on-premise
- Layers depend on **Chef recipes** to handle tasks such as installing packages on instances, deploying apps, and running scripts. 

## AWS CodeDeploy
- You create a **deployment configuration file** to specify how deployments proceed.

## Scenario
You are a Solutions Architect working with a company that uses Chef Configuration management in their datacenter.      
Which service is designed to let the customer **leverage existing Chef recipes** in AWS?
  - **A) AWS OpsWorks**
  - **AWS OpsWorks** is a configuration management service that provides managed instances of Chef and Puppet. Chef and Puppet are automation platforms that allow you to use code to automate the configurations of your servers. OpsWorks lets you use Chef and Puppet to automate how servers are configured, deployed, and managed across your Amazon EC2 instances or on-premises compute environments.
  - **AWS Elastic Beanstalk** : is incorrect because this **handles an application's deployment details** of **capacity provisioning, load balancing, auto-scaling, and application health monitoring**. It does not let you leverage Chef recipes.
  - **AWS CloudFormation** : is incorrect because this is a service that lets you **create a collection of related AWS resources and provision them** in a predictable fashion **using infrastructure as code**. It does not let you leverage Chef recipes.
  
