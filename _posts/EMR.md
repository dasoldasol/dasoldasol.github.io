## Feature
- Amazon EMR(Elastic Map Reduce) provides a managed **Hadoop framework** that makes it easy, fast, and cost-effective **to process vast amounts of data** across dynamically scalable Amazon EC2 instances.
- handles a broad set of **big data use cases**:
  - log analysis, web indexing, data transformations (ETL), machine learning, financial analysis, scientific simulation, and bioinformatics
- You can also run other popular distributed frameworks such as **Apache Spark, HBase, Presto, and Flink** in Amazon EMR    
and interact with data in other AWS data stores such as **Amazon S3 and Amazon DynamoDB**.

## Scenario
- You are working for a large telecommunications company where you need to run analytics against all combined log files from your Application Load Balancer as part of the regulatory requirements.
Which AWS services can be used together to collect logs and then easily perform log analysis?
  - **A) Amazon S3 for storing ELB log files and Amazon EMR for analyzing the log files.**
  - Access logging in the ELB is stored in Amazon S3 which means that the following are valid options:
    - Amazon S3 for storing the ELB log files and an EC2 instance for analyzing the log files using a custom-built application.
    - Amazon S3 for storing ELB log files and Amazon EMR for analyzing the log files.
  - However, log analysis can be automatically provided by Amazon EMR, which is more economical than building a custom-built log analysis application and hosting it in EC2.    
  
