# Airflow 개념 
## What is Airflow? 
### Core component 
- Web server : UI 보여주는 flask 서버 
- Scheduler : workflow 스케줄링하는 데몬 
	- 데몬 : 데몬(daemon)은 사용자가 직접적으로 제어하지 않고, 백그라운드에서 돌면서 여러 작업을 하는 프로그램
- Metastore 
- Executer 
### Core concepts 
- DAG 
- Operator 
	- Actioin Operator : Bash Operator, Python Operator
	- Transfer Operator 
	- Sensor Operator 
- Task / TaskInstance 
- Workflow : DAG 

## How Airflow works
### One Node Architecture
- Web server : metastore에서 메타데이터 읽어옴 
- Scheduler : 실행할 태스크를 전달하기 위해  metastor/executer와 정보 주고받음 
- Executer : 태스크 상태 업데이트 해서 metastore에 저장함 
	- Queue : 태스크의 순서를 정함. One Node Architecture에서는 Executer의 일부임 

### Multi Nodes Architecture (Celery)
- Queue가 바깥에 있음. 
- Executer가 큐에 태스크를 푸시함. 
- 큐에 푸시된 태스크를 worker가 fetch해서 가져가서 그들의 machine상에서 태스크를 execute함 

### How works 
- Folder DAGS
### commands 

## UI 
- 간트 그래프 : 병목 현상 확인에 좋음 

## summary
Airflow is an orchestrator, not a processing framework, process your gigabytes of data outside of Airflow (i.e. You have a Spark cluster, you use an operator to execute a Spark job, the data is processed in Spark).

A DAG is a data pipeline, an Operator is a task.

An Executor defines how your tasks are execute whereas a worker is a process executing your task

The scheduler schedules your tasks, the web server serves the UI, the database stores the metadata of Airflow.

airflow db init is the first command to execute to initialise Airflow

If a task fails, check the logs by clicking on the task from the UI and "Logs"

The Gantt view is super useful to sport bottlenecks and tasks are too long to execute-
