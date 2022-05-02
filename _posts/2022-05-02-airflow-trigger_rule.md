## 9 Trigger Rule 
- all_success: (기본값) 모든 parent가 성공했습니다.
- all_failed: 모든 상위가 실패 또는 upstream_failed 상태입니다.
- all_done: 모든 parent가 실행을 완료했습니다.
- one_failed: 적어도 하나의 parent가 실패하는 즉시 실행되며 모든 parent가 완료될 때까지 기다리지 않습니다.
- one_success: 적어도 하나의 parent가 성공하는 즉시 실행되며 모든 parent가 완료될 때까지 기다리지 않습니다.
- none_failed: 모든 parent가 실패하지 않았습니다(실패 또는 upstream_failed). 즉, 모든 parent가 성공했거나 건너뛰었습니다.
- none_failed_or_skipped: 모든 상위 항목이 실패하지 않았으며(실패 또는 upstream_failed) 적어도 하나의 상위 항목이 성공했습니다.
- none_skipped: 건너뛴 상태의 parent가 없습니다. 즉, 모든 parent가 성공, 실패 또는 upstream_failed 상태입니다.
- dummy: 종속성은 단지 표시를 위한 것이며 마음대로 트리거합니다.

## 구성도 
- task 여러개중 한개가 fail했을때 alarm을 보낸다. (one_failed)
- Branching을 사용할 때 'depends_on_past = True'로 설정하면 건너뛴 작업은 실패한 작업으로 간주되어 DAG를 다시 실행하고 조건이 이전에 건너뛴 경로를 따를 경우 실행되지 않는다.
  - 앞 task가 실패하더라도(skip되더라도) 어쨌든 실행하게 해보자.     
      
  ![image](https://user-images.githubusercontent.com/29423260/166195650-77196e67-6e0a-4d8d-88fa-cfd2fa8e341a.png)

## DAG 구성
```python
  from airflow import DAG
  from airflow.operators.bash import BashOperator
  from datetime import datetime

  default_args = {
      'start_date': datetime(2020, 1, 1)
  }

  with DAG('trigger_rule', schedule_interval='@daily', default_args=default_args, catchup=False) as dag:

      task_1 = BashOperator(
          task_id='task_1',
          bash_command='exit 1',
          do_xcom_push=False
      )
      # exit 0 : success / exit 1 : fail

      task_2 = BashOperator(
          task_id='task_2',
          bash_command='sleep 30',
          do_xcom_push=False
      )

      task_3 = BashOperator(
          task_id='task_3',
          bash_command='exit 0',
          do_xcom_push=False,
          trigger_rule='one_failed'
      )

      [task_1, task_2] >> task_3
```
