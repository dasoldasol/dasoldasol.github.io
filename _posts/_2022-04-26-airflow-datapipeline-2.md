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
  - storing_user(bashOperator)

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

### DAG 만들기 : SQliteOperator로 구성한 python 파일 작성 
- 수정 user_processing.py    
  ```
  from airflow.providers.sqlite.operators.sqlite import SqliteOperator
  ...
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
- airflow tasks test [dag_id] [task_id] [execution_date]
- airflow tasks test user_processing creating_table 2020-01-01
- 확인 sqlite3 airflow.db

## is_api_available (HTTP Sensor)
### Sensor란
- Sensor는 시간, 파일, 외부 이벤트를 기다리며 해당 조건을 충족해야만 이후의 작업을 진행할 수 있게 해주는 Airflow의 기능으로 Operator와 같이 하나의 task가 될 수 있으며 filesystem, hdfs, hive 등 다양한 형식을 제공한다.

### DAG 만들기 : HttpSensor로 구성한 python 파일 작성 
- user_processing.py
```
  from airflow.providers.http.sensors.http import HttpSensor
  ...
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
### provider 다운로드 
- https://airflow.apache.org/docs/apache-airflow-providers/packages-ref.html
### connection
-airflow UI [Admin]-[Connection]   
  ![image](https://user-images.githubusercontent.com/29423260/165209584-d2fa4907-48c7-4b89-a175-7b7ee2993953.png)
### test task 
- airflow tasks test [dag_id] [task_id] [execution_date]
- airflow tasks test user_processing is_api_available 2020-01-01

## extracting_user (HTTPOperator) 
- API로 (API가 available하면) user를 fetch해오는 작업 
### DAG 만들기 : SimpleHttpOperator 로 구성한 python 파일 작성 
- user_processing.py
```
  from airflow.providers.http.operators.http import SimpleHttpOperator
  import json
  ...
  with DAG('user_processing', schedule_interval='@daily',
      default_args=default_args,
           catchup=False) as dag:
      # Define tasks/operators

      extracting_user = SimpleHttpOperator(
          task_id='extracting_user',
          http_conn_id='user_api',
          endpoint='api/',
          method='GET',
          response_filter= lambda response: json.loads(response.text),
          log_response=True
      )
```
### test 
- airflow tasks test user_processing extracting_user 2020-01-01

## processing user (PythonOperator)
### Xcom ? 
- DAG 내의 task 사이에서 데이터를 전달하기 위해 사용 
- 1) pythonOperator return 값을 이용한 xcom 사용 (def 생성 -> def name을 task_id로 해서 xcom에 자동 push) 
- 2) push-pull 이용한 xcom 사용 
  - context['task_instance'] or context['ti']로 return과 push를 동시 사용하고 (key-value 형식) 
  - xcom_pull(task_ids=~) or xcom_pull(key=~)로 데이터를 pull해서 전달받을 수 있다 
### DAG 작성 : PythonOperator 사용 
```
    from airflow.operators.python import PythonOperator
    from pandas import json_normalize
    ...
    def _processing_user(ti):
        users = ti.xcom_pull(task_ids=['extracting_user'])
        if not len(users) or 'results' not in users[0]:
            raise ValueError('User is empty')
        user = users[0]['results'][0]
        processed_user = json_normalize({
            'firstname': user['name']['first'],
            'lastname': user['name']['last'],
            'country': user['location']['country'],
            'username': user['login']['username'],
            'password': user['login']['password'],
            'email': user['email']
        }) # json to df
        processed_user.to_csv('/tmp/processed_user.csv', index=None, header=False)


    with DAG('user_processing', schedule_interval='@daily',
        default_args=default_args,
             catchup=False) as dag:
        # Define tasks/operators
        
        processing_user = PythonOperator(
          task_id='processing_user',
          python_callable=_processing_user
    )
  
```

### test 
- airflow tasks test user_processing processing_user 2020-01-01
- processed_user 결과 확인하기 
- ls /tmp/
- cat /tmp/processed_user.csv 
## Storing_user (bashOperator)
- tmp폴더에 있는 csv를 읽어서 SQLite DB에 넣기 
### DAG 작성 : BashOperator
```
  from airflow.operators.bash import BashOperator
  
  with DAG('user_processing', schedule_interval='@daily',
    default_args=default_args,
         catchup=False) as dag:
    # Define tasks/operators
    
    storing_user = BashOperator(
        task_id='storing_user',
        bash_command='echo -e ".separator ","\n.import /tmp/processed_user.csv users" | sqlite3 /home/airflow/airflow.db'
    )
```
### test 
- airflow tasks test user_processing storing_user 2020-01-01
- 테이블 확인 
- sqlite3 airflow.db
- SELECT * FROM users;

## 
