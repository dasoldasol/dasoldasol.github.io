---
title: "Airflow Xcoms로 task간 데이터 주고받기"
excerpt: "Xcoms는 DAG 내의 task 사이에서 데이터를 전달하기 위해 사용한다"
toc: true
toc_sticky: true
categories:
  - Airflow
  - DataPipeline
modified_date: 2022-05-02 14:26:28 +0900
---
- [Airflow 관련 포스팅 전체 보기](https://dasoldasol.github.io/airflow/datapipeline/airflow-linklist/)


## Xcoms 
- [이전 게시글 - Airflow DAG구성하기 : Xcom?](https://dasoldasol.github.io/airflow/datapipeline/airflow-2/#xcom-)
- DAG 내의 task 사이에서 데이터를 전달하기 위해 사용 
- **SQLite는 2GB, PostgreSQL은 1GB, MySQL은 64KB의 용량 제한**이 있다. 


## Xcoms로 데이터 주고받는 DAG 구성하기 
```python
from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator
from airflow.utils.task_group import TaskGroup

from random import uniform
from datetime import datetime

default_args = {
    'start_date': datetime(2020, 1, 1)
}


def _training_model(ti):
    accuracy = uniform(0.1, 10.0)
    print(f'model\'s accuracy: {accuracy}')
    ti.xcom_push(key='model_accuracy', value=accuracy)


def _choose_best_model(ti):
    print('choose best model')
    accuracies = ti.xcom_pull(key='model_accuracy', task_ids=[
        'processing_tasks.training_model_a',
        'processing_tasks.training_model_b',
        'processing_tasks.training_model_c'
    ])
    print(accuracies)

with DAG('xcom_dag', schedule_interval='@daily', default_args=default_args, catchup=False) as dag:

    downloading_data = BashOperator(
        task_id='downloading_data',
        bash_command='sleep 3'
        do_xcom_push=False
    )

    with TaskGroup('processing_tasks') as processing_tasks:
        training_model_a = PythonOperator(
            task_id='training_model_a',
            python_callable=_training_model
        )

        training_model_b = PythonOperator(
            task_id='training_model_b',
            python_callable=_training_model
        )

        training_model_c = PythonOperator(
            task_id='training_model_c',
            python_callable=_training_model
        )

    choose_best_model = PythonOperator(
        task_id='choose_best_model',
        python_callable=_choose_best_model
    )

    downloading_data >> processing_tasks >> choose_best_model
```
- ```ti.xcom_push(key='model_accuracy', value=accuracy)``` : xcom에 데이터 push (key-value형태의 JSON, pickle) 
- ```ti.xcom_pull(key='model_accuracy', task_ids=['task_id'..])``` : 데이터 pull 
- ```do_xcom_push=False``` : 비어있는 value를 xcoms에 push하지 않도록 함 

## UI 확인 
- DAG trigger      
  ![image](https://user-images.githubusercontent.com/29423260/166187645-99ebab05-7733-488c-9d6a-6c79d4054668.png)
- [Admin]-[Xcoms]
  ![image](https://user-images.githubusercontent.com/29423260/166187730-c56e0d37-db9a-42de-aad4-d71f997c8e84.png)
- 태스크 ```processing_tasks``` 로부터 태스크 ```choose_best_model``` 이 데이터를 잘 pull 해온것을 print를 통해 logs에서 확인할 수 있다.     
  ![image](https://user-images.githubusercontent.com/29423260/166187992-00d5c281-b7e7-4370-bd52-0f99884e6525.png)
 
