## Redshift CheatSheet
- fully managed, fast and powerful, petabyte scale **data warehouse** service
- uses **replication and continuous backups** to enhance availability and improve data durability and can automatically recover from node and component failures.
- Massive Parallel Processing(MPP) : distributing & parallelizing queries across multiple physical resources
- comlumnar data storage : improving query performance and allowing advance compression techniques
- **only supports Single-AZ deployments** and the nodes are available within the same AZ, if the AZ supports Redshift clusters.
- spot instances are **NOT** and option

## Features
- used for business intelligence(OLAP)
- Available in ONLY 1 AZ

## Backups
- Enabled by default with a 1 day retention period (Max 35days)
- maintain at least 3 copies of your data(original/replica on compute nodes/backup in s3)
- Disaster Recovery : replicate Snapshots to s3 in another region

## Scenarios
- A company is using Redshift for its online analytical processing (OLAP) application which processes complex queries against large datasets. There is a requirement in which you have to **define the number of query queues** that are available and **how queries are routed** to those queues for processing.    
Which of the following will you use to meet this requirement?
  - **A) Use the workload management(WLM) in the parameter group configuration 
  - Amazon Redshift WLM (Workload Management)은 사용자가 작업 부하 내에서 우선 순위를 유연하게 관리 할 수 있도록하여 실행 시간이 짧고 질의가 오래 걸리는 쿼리의 큐에서 멈추지 않도록합니다.
