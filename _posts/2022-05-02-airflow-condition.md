---
title: "Airflow BranchOperator로 task를 조건에 따라 실행하기"
excerpt: "BranchPythonOperator로 Airflow task를 조건에 따라 분기 실행하기"
toc: true
toc_sticky: true
categories:
  - Airflow
  - DataPipeline
modified_date: 2022-05-02 16:26:28 +0900
---
- [Airflow 관련 포스팅 전체 보기](https://dasoldasol.github.io/airflow/datapipeline/airflow-linklist/)


## Executing a Task with Condition : BranchPythonOperator
- 선행 작업의 결과에 따라 이어나갈 작업이 달라야 할 때(conditional)는 Branch로 분기를 나누어 줄 수 있다. 
### 예상 상황
- 데이터 입수 후 검증
	- 데이터에 이상 징후가 포착될 경우, 추가 전처리 작업 실행
	- 아닐 경우 해당 전처리 작업 Skip
- 모델 예측 후 적용
	- 모델 예측 결과가 기준치 이하일 경우, Archiving 및 이전 결과 사용
	- 모델 예측 결과가 기준치 초과할 경우, 새 결과 적용
- 그 외 분기가 필요한 작업
- 위와 같이 분기가 필요한 상황에 ```BranchPythonOperator```를 이용할 수 있다. 

## DAG 구성 
```python
from airflow import DAG
from airflow.operators.bash import BashOperator
from airflow.operators.python import PythonOperator, BranchPythonOperator
from airflow.utils.task_group import TaskGroup
from airflow.operators.dummy import DummyOperator

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
    print(f'accuracies : {accuracies}')
    for accuracy in accuracies:
        if accuracy > 5:
            return 'accurate'# task_id ['taskid1', 'taskid2'] 처럼 여러 task로도 가능하다
    return 'inaccuate'


with DAG('xcom_dag', schedule_interval='@daily', default_args=default_args, catchup=False) as dag:

    downloading_data = BashOperator(
        task_id='downloading_data',
        bash_command='sleep 3',
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

    choose_best_model = BranchPythonOperator(
        task_id='choose_best_model',
        python_callable=_choose_best_model
    )

    accurate = DummyOperator(
        task_id='accurate',
    )

    inaccurate = DummyOperator(
        task_id='inaccurate',
    )

    downloading_data >> processing_tasks >> choose_best_model >> [accurate, inaccurate]
```

## UI확인 
- condition(accuracy>5)에 따라 accurate로 분기된 것을 확인할 수 있다.    
  ![image](https://user-images.githubusercontent.com/29423260/166191860-a112b377-c48b-4ecb-b99e-e4af78940057.png)
- [Admin]-[xcoms]에서 전송된 condition 및 value 확인 
  ![image](https://user-images.githubusercontent.com/29423260/166191764-89870671-7b93-4984-8451-8e34df9c607a.png)
