---
title: "CDC(Change Data Capture)를 위한 glue job 북마크 사전 조건"
excerpt: "CDC(Change Data Capture)를 위한 glue job 북마크 사전 조건"
toc: true
toc_sticky: true
categories:
- AWS 
modified_date: 2021-10-15 09:36:28 +0900
---
## CDC(Change Data Capture)
- CDC(Change Data Capture)란 마지막으로 추출한 이후 변경된 데이터만 골라내는 기술이다. 흔히 데이터 백업이나 통합 작업을 할 경우 방대한 데이터를 다뤄야 하는데 원본 소스 데이터 가운데 최근 변경된 데이터들만 골라 다른 시스템으로 옮기게 되면 시스템 로드도 줄이고 전체적인 작업 생산성을 향상시킬 수 있다. 특히 한 시스템에 있는 대량의 데이터를 정기적으로 추출해 다른 시스템으로 이동하는 데이터 통합이나 데이터 웨어하우스 업무의 경우 CDC 기술을 이용하면 데이터를 추출, 이동하는 시간을 크게 줄일 수 있다. 또한 24시간 운영해야하는 필수적인 업무 시스템의 경우 CDC 기술을 이용하면 다운타임 없이 실시간 백업과 데이터 통합이 가능하다.
- 이번 작업의 경우 현재 단지서버 여러개 서버를 통합으로 S3로 수집하면서, CDC를 처리하기 위해 glue job의 북마크를 사용할 수 있는지 살펴보았다.
## 내용
job bookmark로 cdc와 유사한 기능을 제공한다    
아래와 같은 소스에서 사용 가능하다

* JDBC data sources
* the Relationalize transform
* Amazon S3 sources.

아래의 테이블은 S3가 소스일 경우 지원하는 포맷이다

| AWS Glue version | Amazon S3 source formats |
| --- | --- |
| Version 0.9 | JSON, CSV, Apache Avro, XML |
| Version 1.0 and later | JSON, CSV, Apache Avro, XML, Parquet, ORC |

JDBC는 아래와 같은 룰을 따라야 한다(정렬된 프라이머리키가 있어야하고 한번 수행하고 지나간 데이터 중 update로 변경된 내용은 갱신하지 못한다)

* <span style="color: inherit;">For each table, AWS Glue uses one or more columns as bookmark keys to determine new and processed data. The bookmark keys combine to form a single compound key.</span>
* <span style="color: inherit;">You can specify the columns to use as bookmark keys. If you don't specify bookmark keys, AWS Glue by default uses the primary key as the bookmark key, provided that it is sequentially increasing or decreasing (with no gaps).</span>
* <span style="color: inherit;">If user-defined bookmarks keys are used, they must be strictly monotonically increasing or decreasing. Gaps are permitted.</span>
* <span style="color: inherit;">AWS Glue doesn't support using case-sensitive columns as job bookmark keys.</span>

## 이번 적용 사례 
단지서버는 대부분 created_at의 시간 데이터가 존재하여 북마크를 사용할 수 있으나, 시간 데이터 없는 정보 테이블의 경우 사용 불가