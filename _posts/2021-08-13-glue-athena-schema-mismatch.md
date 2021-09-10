---
title: "S3-Glue-Athena 연동 시 Athena 스키마 미스매치 문제"
excerpt: "S3-Glue-Athena 연동 시 Athena 스키마 미스매치 문제"
categories:
- AWS
- DB
modified_date: 2021-08-13 10:36:28 +0900
toc: true
toc_sticky: true
---
## 문제 정의
- 수집 완료한 S3 데이터를 Glue Crawler로 연동해 Athena로 조회시, 수집한 파일별로 동일 컬럼인데 각 스키마가 일치하지 않아 조회 불가    
  ![1.png](https://dasoldasol.github.io/assets/images/image/schema_mismatch0.png)
- 에러 명칭 : HIVE_PARTITION_SCHEMA_MISMATCH, HIVE_BAD_DATA
- 스키마 미스매치 예시 : double <-> int

## 문제 원인
- S3수집한 데이터 소스는 106개 사이트의 mariadb. mariadb의 decimal 데이터타입으로 인해 int, double 등으로 데이터타입이 다르게 됨

## 문제 해결 프로세스
1. Athena HIVE 메타 데이터 삭제
2. Glue 크롤러 편집
    * 크롤러 설정 : 테이블에서 메타데이터가 있는 새 파티션과 기존 파티션을 모두 업데이트하도록 설정
3. Glue 스키마 편집(필요시)
4. Athena HiveQL 활용 : 새로운 테이블 생성으로 string 형변환 -> `msck repair table`로 파티션키 추가