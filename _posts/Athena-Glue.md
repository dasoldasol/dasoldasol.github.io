## Athena
- An **interactive query service** that makes it easy to analyze data **directly in Amazon S3** using standard SQL.
- **Serverless** : there is no infrastructure to set up or manage, and you pay only for the queries you run. Athena scales automatically—executing queries in parallel—so results are fast, even with large datasets and complex queries.
- analyze unstructured, semi-structured, and structured data stored in Amazon S3
  - CSV, JSON, or columnar data formats such as Apache Parquet and Apache ORC
- you can run **ad-hoc queries** using ANSI SQL, **without the need to aggregate or load the data** into Athena.

## Glue
- **AWS Glue**는 분석을 위해 데이터를 준비하는 시간 소모적인 단계를 자동화하는 **완전관리형 ETL(추출, 변환 및 로드)** 서비스로서, 사용량에 따라 요금을 지불합니다. AWS Glue는 Glue **데이터 카탈로그**를 통해 데이터를 자동으로 검색 및 프로파일링하고, ETL 코드를 추천 및 생성하여 소스 데이터를 대상 스키마로 변환하고, 완전관리형 스케일 아웃 Apache Spark 환경에서 ETL 작업을 실행하여 데이터를 대상에 로드합니다. 또한, 이를 사용하여 복잡한 데이터 흐름을 설정, 오케스트레이션 및 모니터링할 수 있습니다.
  - **Use Case** : AWS Glue는 소유한 데이터의 속성을 검색하고, 데이터를 변환하여 분석용으로 준비하는 데 사용해야 합니다. Glue는 Amazon S3의 데이터 레이크, Amazon Redshift의 데이터 웨어하우스, AWS에서 실행되는 다양한 데이터베이스에 저장된 정형 및 반정형 데이터를 모두 자동으로 검색할 수 있습니다. 또한, ETL에서 사용할 수 있고 Amazon Athena, Amazon EMR 및 Amazon Redshift Spectrum과 같은 서비스에서 쿼리 및 보고하는 데 사용할 수 있는 Glue 데이터 카탈로그를 통해 데이터에 대한 통합된 뷰를 제공합니다. Glue는 ETL 작업을 위한 Scala 또는 Python 코드를 자동으로 생성하며, 이미 익숙한 도구를 사용하여 ETL 작업을 추가로 사용자 지정할 수 있습니다. AWS Glue는 서버리스이므로 구성하거나 관리할 컴퓨팅 리소스가 없습니다.

## Scenario
- To save cost, a company decided to change their third-party data analytics tool to a cheaper solution. They sent a full data export on a CSV file which contains all of their analytics information. You then save the CSV file to an .**S3 bucket.** for storage. Your manager asked you to do some validation on the provided data export.     
In this scenario, what is the most cost-effective and easiest way to **analyze export data using a standard SQL.**?
  - **A) To be able to run SQL queries, use AWS Athena to analyze the export data file in S3.**

- You are working for a data analytics startup that collects clickstream data and stores them in an S3 bucket. You need to launch an AWS Lambda function to trigger your ETL jobs to run as soon as new data becomes available in Amazon S3.       
Which of the following services can you use as an **extract, transform, and load (ETL) service** in this scenario?
  - **A) AWS Glue**
  
