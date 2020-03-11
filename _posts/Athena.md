## Feature
- An **interactive query service** that makes it easy to analyze data **directly in Amazon S3** using standard SQL.
- **Serverless** : there is no infrastructure to set up or manage, and you pay only for the queries you run. Athena scales automatically—executing queries in parallel—so results are fast, even with large datasets and complex queries.
- analyze unstructured, semi-structured, and structured data stored in Amazon S3
  - CSV, JSON, or columnar data formats such as Apache Parquet and Apache ORC
- you can run **ad-hoc queries** using ANSI SQL, **without the need to aggregate or load the data** into Athena.

## Scenario
- To save cost, a company decided to change their third-party data analytics tool to a cheaper solution. They sent a full data export on a CSV file which contains all of their analytics information. You then save the CSV file to an .**S3 bucket.** for storage. Your manager asked you to do some validation on the provided data export.     
In this scenario, what is the most cost-effective and easiest way to .**analyze export data using a standard SQL.**?
  - **A) To be able to run SQL queries, use AWS Athena to analyze the export data file in S3.**
  
