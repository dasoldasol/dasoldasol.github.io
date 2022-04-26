---
title: "Airflow cli 시작하기"
excerpt: "Airflow 설치부터 환경설정까지"
toc: true
toc_sticky: true
categories:
  - Airflow
  - DataPipeline
modified_date: 2020-04-26 09:36:28 +0900
---
## 구성도 
- 간단하게 보자면 Fetch -> Clean -> Store
  - table 생성 (SQLiteOperator) 
  - is_api_available (HTTPSensor)
  - extracting_user (HTTPOperator)
  - processing_user (PythonOperator)
  - storing_user(bashOperator)'

## DAG 첫 구성 
- mkdir dags
- 생성 user_processing.py 
  ```
  from airflow.models import DAG
  from datetime import datetime

  default_args = {
      'start_date': datetime(2020, 1, 1)
  }

  with DAG('user_processing', schedule_interval='@daily',
      default_args=default_args,
           catchup=False) as dag:
  ```
- DAG가 시작되는 기준 시점이다. 고정값이다. (start_date 날짜에 실행된다는 의미가 아니다.)

- start_date
start_date가 2021-03-07이면 DAG는 2021-03-07 00:00 기준으로 시작되는 것으로 스케쥴링 된다. 그리고 매 10분 기준마다 돌 것이다. 2021-03-07 00:10, 2021-03-07 00:20, ... 
그러면 실제 DAG가 도는 시간을 생각해보자. 위에서 정리했듯이 Airflow 스케쥴링 컨셉은 일배치면 하루 전 기준으로 돌고, 시간배치면 시간 전 기준으로 돌고, 분배치면 분 전 기준으로 돈다. 그러니 2021-03-07 00:10 에 2021-03-07 00:00 기준으로 돈다. 그 다음 2021-03-07 00:20이 되면 2021-03-07 00:10 기준으로 돈다 ...

- catchup 

## create table (SqliteOperator)
### operator
- 1 operator 1 task! : 실패시 retry하면 중복되잖아 
- operator 종류 : Action(Execute), Transfer, Sensor

### SQliteOperator로 구성한 python 파일 작성 
- 수정 user_processing.py    
  ```
  from airflow.models import DAG
  from airflow.providers.sqlite.operators.sqlite import SqliteOperator
  from datetime import datetime

  default_args = {
      'start_date': datetime(2020, 1, 1)
  }

  with DAG('user_processing', schedule_interval='@daily',
      default_args=default_args,
           catchup=False) as dag:
      # Define tasks/operators

      creating_table = SqliteOperator(
          task_id = 'creating_table',
          sqlite_conn_id = 'db_sqlite',
          sql='''
              CREATE TABLE users (
                  firstname TEXT NOT NULL,
                  lastname  TEXT NOT NULL,
                  country  TEXT NOT NULL,
                  username TEXT NOT NULL,
                  password  TEXT NOT NULL, 
                  email  TEXT NOT NULL PRIMARY KEY
                  );
          '''
      )
  ```
- task_id는 데이터 파이프라인 안에서 unique해야함 
- airflow webserver 
- airflow scheduler
### provider 다운로드 
- https://airflow.apache.org/docs/apache-airflow-providers/packages-ref.html
- pip install 'apache-airflow-providers-sqlite'
- pip install apache-airflow-providers-http==2.0.0
- providers list 조회 : airflow providers list
### **providers?

### connection
-airflow UI [Admin]-[Connection]     
  ![image](https://user-images.githubusercontent.com/29423260/165206138-475dc079-0302-44ea-9281-81b18e0604ea.png)    
### test task 
- airflow tasks test user_processing creating_table 2020-01-01
- 확인 sqlite3 airflow.db

## is_api_available (HTTP Sensor)
- user_processing.py
```
  from airflow.models import DAG
  from airflow.providers.http.sensors.http import HttpSensor
  from datetime import datetime

  default_args = {
      'start_date': datetime(2020, 1, 1)
  }

  with DAG('user_processing', schedule_interval='@daily',
      default_args=default_args,
           catchup=False) as dag:
      # Define tasks/operators

      is_api_available = HttpSensor(
          task_id='is_api_available',
          http_conn_id='user_api',
          endpoint='api/'
      )
```
### HttpSensor로 구성한 python 파일 작성 
### provider 다운로드 
- https://airflow.apache.org/docs/apache-airflow-providers/packages-ref.html
### connection
-airflow UI [Admin]-[Connection]   
  ![image](https://user-images.githubusercontent.com/29423260/165209584-d2fa4907-48c7-4b89-a175-7b7ee2993953.png)

