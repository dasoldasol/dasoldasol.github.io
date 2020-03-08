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



