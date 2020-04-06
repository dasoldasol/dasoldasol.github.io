## Features
- **AWS Database Migration Service** 는 oracle - oracle 과 같은 동종 마이그레이션뿐만 아니라 oracle/microsoft SQL server - aurora와 같은 다른 데이터베이스 플랫폼간의 이종 마이그레이션을 지원합니다. 
- DMS를 이용하여, RDS/EC2 기반 데이터베이스로 한번에 데이터 마이그레이션이 가능합니다. 
- Redshift 및 S3에 데이터를 스트리밍하여, 고 가용성(다중 AZ 사용)으로 데이터를 지속적으로 복제하고, 페타 바이트 규모의 데이터 웨어하우스로 데이터베이스를 통합할 수 있습니다. 
- 데이터센터<->AWS 데이터베이스 간의 연속 복제를 수행할 수 있습니다. 
- 온프레미스 데이터베이스<->온프레미스 데이터베이스 간의 복제는 지원하지 않습니다. 
- 복제 파이프라인의 각 지점에 대한 진단 및 성능 데이터를 포함하여, 데이터 복제 프로세스에 대한 end-to-end view를 제공합니다. 
- **AWS Schema Conversation Tool(SCT)**
  - 소스 데이터 베이스 스키마, 뷰, 저장 프로시저 및 함수를 포함한 대부분의 데이터베이스 코드 객체를 대상 데이터베이스와 호환되는 형식으로 자동 변환
  - SCT는 응용 프로그램 소스 코드에서 임베디드 SQL문을 스캔하여 데이터베이스 스키마 변환 프로젝트의 일부로 변환할 수 있습니다. 
- **기본 스키마 복사(Basic Schema Copy)**
  - 데이터베이스 스키마를 대상 인스턴스로 빠르게 마이그레이션하기 위한 기능
  - 대상에 이름이 같은 테이블이 아직 없는 경우 대상 인스턴스에 테이블과 기본키를 자동 생성
  - 보조인덱스, 외래키, 저장프로시저는 마이그레이션하지 않습니다. (SCT 사용)


## Scenarios 
- A leading media company has recently adopted a hybrid cloud architecture which requires them to migrate their application servers and databases in AWS. One of their applications requires a **heterogeneous database migration** in which you need to transform your on-premises **Oracle database to PostgreSQL in AWS**. This entails a schema and code transformation before the proper data migration starts.      
Which of the following options is the most suitable approach to migrate the database in AWS? 
  - **A) First, use the AWS Schema Conversation Tool to convert the source schema and application code to match that the target database, and then use the AWS Database Migration Service to migrate data from the source database to the target database.**
  
