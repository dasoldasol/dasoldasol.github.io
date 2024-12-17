---
title: "[DB] PostgresQL FDW로 멀티 데이터베이스 구현"
excerpt: "FDW로 다른 데이터베이스를 로컬 데이터베이스처럼 써보자 "
toc: true
toc_sticky: true
categories:
- DB
- PostgresQL
modified_date: 2024-11-20 08:36:28 +0900
---
## 개요 
- 발단 : 기존에 있던 테이블 일부를 새로운 데이터베이스에 이관한 후, 기존 데이터베이스의 테이블과 새로운 데이터베이스의 테이블을 함께 써야하는 상황. Bean 설정부터 다시하면서 코드를 싹다 수정하느냐? 설마 그런 원시적으로 한다고? 에서 시작한 서칭. 
- 문서 목적 : 코드 수정 없이 FDW를 통해 멀티 데이터베이스 구현 
- **FDW(Foreign Data Wrapper)** : 서로 다른 PostgreSQL 데이터베이스 간에 데이터를 연결하여, 별도의 코드 변경 없이 다른 데이터베이스의 테이블을 마치 로컬 테이블처럼 쿼리할 수 있게 해주는 기능. 

## 1.새 데이터베이스 new_db 생성

new_db 데이터베이스를 생성

## 2. 특정 테이블 마이그레이션

테이블 이름에 bems가 포함된 테이블만 pg_dump를 사용해 추출한 후 새로운 데이터베이스 bems로 이동

### a. 특정 테이블만 덤프
- 로컬 개발 서버 
```
pg_dump --host={DB-HOST} --port=5432 --username={DB-USER} \
--dbname={CURRENT-DB-NAME} --no-owner --table='bems%' --file=curr_bems_with_procs.sql --section=pre-data --section=post-data
```

- AWS 서버 
```
pg_dump --host={RDS-엔드포인트} --port=5432 --username={DB-USER} \
--dbname={CURRENT-DB-NAME} --no-owner --table='bems%' --file=curr_bems_with_procs.sql --section=pre-data --section=post-data
```
### b. 새로운 데이터베이스로 데이터 적재
- 개발 서버 
```
pg_dump --host={DB-HOST} --port=5432 --username={DB-USER} \
--dbname=bems -f curr_bems_with_procs.sql 
```
- AWS 서버 
```
pg_dump --host={RDS-엔드포인트} --port=5432 --username={DB-USER} \
--dbname=bems -f curr_bems_with_procs.sql
```
## 3. FDW 설정

새 데이터베이스 bems에서 FDW를 사용하여 curr_db 데이터베이스를 외부 데이터소스로 설정

### a. postgres_fdw 확장 설치
```
CREATE EXTENSION postgres_fdw;
```
### b. 외부 서버 생성
```
CREATE SERVER curr_server
FOREIGN DATA WRAPPER postgres_fdw
OPTIONS (host '111.111.11.11', dbname 'curr_db', port '5432');
```
### c. 사용자 매핑
```
CREATE USER MAPPING FOR CURRENT_USER
SERVER curr_server
OPTIONS (user 'DB-USER', password 'DB-PASSWORD');
```
### d. 외부 테이블 가져오기

csp 데이터베이스의 테이블을 외부 테이블로 bems에 가져오기
```
IMPORT FOREIGN SCHEMA public
LIMIT TO (account, building, facility)
FROM SERVER curr_server
INTO public
```
## 4. 검증 및 테스트

•	FDW 테이블 검증: bems 데이터베이스에서 curr_db의 외부 테이블이 잘 조회되는지 확인
•	설정 확인: 권한, 파라미터 등이 curr_db와 동일하게 설정되었는지 검증
### 1. curr_db 데이터베이스 테이블 신규 추가 
![image](https://github.com/user-attachments/assets/2f4a7c53-d34f-49f7-95fb-c5b062f210c7)

### 2. 새로만든 bems 데이터베이스 외부테이블 연동 확인 
![image](https://github.com/user-attachments/assets/a62b45cc-5f8e-4fb7-8b05-87f3fa315479)



## Appendix A. 프라이빗 RDS 포워딩 
- 발단 : 프라이빗 RDS, 프라이빗 EC2.. 보안접속설정으로 psql 어떻게 날릴까 고민함 
- 전제조건 : EC2 보안그룹이 RDS 보안그룹 inbound 규칙에 포함되어있어야함 (Postgresql 5432)
- 세션매니저로 로컬 포워딩 
 ```
 aws ssm start-session \
--target {EC2-인스턴스-ID} \
--document-name AWS-StartPortForwardingSessionToRemoteHost \
--parameters '{"host":["RDS-엔드포인트"],"portNumber":["5432"],"localPortNumber":["5433"]}'
 ```
 
Starting session with SessionId: ds.seo-fsn9v396873o874gl9e2ldi5p8
Port 5433 opened for sessionId ds.seo-fsn9v396873o874gl9e2ldi5p8.
Waiting for connections...

Connection accepted for session [ds.seo-fsn9v396873o874gl9e2ldi5p8]

이런 출력이 나오면 세션 연결된것 

-  로컬 PC에서 연결하기 
```
psql -h 127.0.0.1 -p 5433 -U {DB-USER} -d {DB-NAME}
```
