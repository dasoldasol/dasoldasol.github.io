## Features
- Lambda **scales out** (not up) automatically : each time your function is triggered, a new, separate instance of that function is started.
- Independent 1 event = 1 function
- Serverless
- **Traditional vs. Serverless**
- can trigger other functions
- AWS X-ray allows you to debug 
- can do things globally ex.s3
- Know what service is serverless : RDS is NOT serverless(except Aurora Serverless)
- Know your triggers

## Scenario
- to prepare complete solution to run a piece of code that required multi-threaded processing. The code has been running on an old custom-built server based around a 4 core Intel Xeon processor. 
-> **EC2, ECS, Lambda**
  - The exact ratio of cores to memory has varied over time for Lambda instances, however Lambda like EC2 and ECS supports hyper-threading on one or more virtual CPUs (if your code supports hyper-threading).

- A startup company has a serverless architecture that uses AWS Lambda, API Gateway, and DynamoDB. They received an urgent feature request from their client last month and now, it is ready to be pushed to production. The company is using AWS CodeDeploy as their deployment service.    
Which of the following **configuration types** will allow you to specify the percentage of traffic shifted to your updated Lambda function version before the remaining traffic is shifted in the second increment?
  - **A) Canary**
  - you must choose one of the following deployment configuration types to specify how traffic is shifted from the original AWS Lambda function version to the new AWS Lambda function version:
    - **Canary**: Traffic is shifted in two increments. You can choose from predefined canary options that specify the percentage of traffic shifted to your updated Lambda function version in the first increment and the interval, in minutes, before the remaining traffic is shifted in the second increment.
    - **Linear**: Traffic is shifted in equal increments with an equal number of minutes between each increment. You can choose from predefined linear options that specify the percentage of traffic shifted in each increment and the number of minutes between each increment.
    - **All-at-once**: All traffic is shifted from the original Lambda function to the updated Lambda function version at once.

- Your customer is building an internal application that serves as a repository for images uploaded by a couple of users. Whenever a user uploads an image, it would be sent to Kinesis for processing before it is stored in an S3 bucket. Afterwards, if the upload was successful, the application will return a prompt telling the user that the upload is successful. The entire processing typically takes about 5 minutes to finish.    
Which of the following options will allow you to **asynchronously process the request** to the application in the **most cost-effective** manner?
  - **A) Create a Lambda function that will asynchronously process the requests.**
  - **Using a combination of Lambda and Step Functions to orchestrate service components and asynchronously process the requests** : is incorrect because the **AWS Step Functions service** lets you coordinate multiple AWS services into serverless workflows so you can build and update apps quickly. Although this can be a valid solution, it is not cost-effective since the application does not have a lot of components to orchestrate.
