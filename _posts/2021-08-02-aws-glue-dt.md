---
title: "AWS Glue 데이터 카탈로그 생성시 iso8601 timestamp를 HIVE datetime으로 인식시키는 방법 "
excerpt: "Glue 데이터 카탈로그 생성시 iso8601 timestamp를 HIVE datetime으로 인식시키는 방법"
toc: true
toc_sticky: true
categories:
- AWS 
modified_date: 2021-08-02 09:36:28 +0900
---

크롤러로 카탈로그를 생성하면 iso8601 timestamp(YYYY-MM-DD'T'HH:MM:DD'Z')는 hive의 datetime(YYYY-MM-DD HH:MM:SS) 형식과 맞지 않아서
시간을 string으로 인식한다. 이렇게 되면 quicksight에서는 x축을 시간으로 보고 그래프를 생성하는데 string은 정상적인 시간의 표현을 할 수 가없다.
따라서 아래와 같은 방법으로 hive의 datetime 형태로 인식시켜야 한다

<br>
* 수동으로 테이블 생성, 생성시 SerDe 포맷 변경 및 프로퍼티 추가
* 수동생성 테이블 메타데이터 업데이트

<br>
아래의 샘플을 참고하여 쿼리를 작성하면 된다
변경되는 지점은 ROW FORMAT SERDE와 WITH SERDEPROPERTIES이다
ROW FORMAT SERDE에서 기존의 org.openx.data.jsonserde.JsonSerDe format을 아래의 hive format으로 변경한다
또한 WITH SERDEPROPERTIES에 들어간 paths는 삭제하고(paths는 의미없는 구문으로 추후에 삭제될 예정이라고한다)
("timestamp.formats"="yyyy-MM-dd'T'HH:mm:ss") 구문을 추가하면 된다

<br>
* 수동생성 예제쿼리(테이블 생성, [참고 링크](https://docs.aws.amazon.com/athena/latest/ug/json-serde.html))

``` sql
CREATE EXTERNAL TABLE `energymeter`(
  `timestamp` timestamp COMMENT 'from deserializer', 
  `site` string COMMENT 'from deserializer', 
  `dong` string COMMENT 'from deserializer', 
  `ho` string COMMENT 'from deserializer', 
  `energy_meter_id` int COMMENT 'from deserializer', 
  `light_count` int COMMENT 'from deserializer', 
  `light_total_instant` double COMMENT 'from deserializer', 
  `light_total_cumulative` int COMMENT 'from deserializer')
PARTITIONED BY ( 
  `site_name` string, 
  `year` int, 
  `month` int, 
  `day` int, 
  `hour` int)
ROW FORMAT SERDE 
  'org.apache.hive.hcatalog.data.JsonSerDe' 
WITH SERDEPROPERTIES ("timestamp.formats"="yyyy-MM-dd'T'HH:mm:ss")
STORED AS INPUTFORMAT 
  'org.apache.hadoop.mapred.TextInputFormat' 
OUTPUTFORMAT 
  'org.apache.hadoop.hive.ql.io.HiveIgnoreKeyTextOutputFormat'
LOCATION
  's3://hdci-ambt-wallpad-raw/dev-clean/energymeter/'
TBLPROPERTIES (
  'CrawlerSchemaDeserializerVersion'='1.0', 
  'CrawlerSchemaSerializerVersion'='1.0', 
  'UPDATED_BY_CRAWLER'='ambt-wallpad-cleaned-s3-crawler', 
  'averageRecordSize'='181', 
  'classification'='json', 
  'compressionType'='none', 
  'objectCount'='5727', 
  'recordCount'='175916', 
  'sizeKey'='32236388', 
  'typeOfData'='file')
```
<br>
<br>
* 수동생성 예제쿼리(메타데이터 업데이트 [참고 링크](https://docs.aws.amazon.com/athena/latest/ug/msck-repair-table.html))

``` sql
MSCK REPAIR TABLE energymeter
```
<br>
메타데이터 업데이트 후 파티션이 추가되었을 때는 정보를 업데이트 해주어야 한다 업데이트시에는
MSCK PEPAIR TABLE 명령을 다시 실행해도 되지만 전체적으로 다시 업데이트하면서 파티션이 망가질 수도 있고 비효율적이므로
추가된 파티션 정보만 업데이트 하는 것이 좋다

<br>
<br>
* 수동생성 예제쿼리(파티션 추가,[참고 링크](https://stackoverflow.com/questions/56281554/aws-update-athena-meta-glue-crawler-vs-msck-repair-table))

``` sql
ALTER TABLE database.table ADD PARTITION (partition_name='PartitionValue') location 's3://bucket/path/partition'
```