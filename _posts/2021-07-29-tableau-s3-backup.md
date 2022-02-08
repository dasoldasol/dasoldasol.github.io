---
title: "Tableau Server 백업 스크립트"
excerpt: "Tableau Server의 DB와 설정을 백업하는 스크립트"
categories:
- Tableau
- BatchScript
- Disaster Recovery
modified_date: 2021-07-29 10:36:28 +0900
toc: true
toc_sticky: true
---
## 목적
- Tableau Server 운영을 하고 있는데 뜬금 **Disaster Recovery 방안** 뭐있냐 질문받음..
- 네 그래서 하루에 한번씩 백업하는거 자동화하께여!
- *그리고 요즘 Window 서버에 백업 작업 많이 걸어놔서.. 기억하려고 포스팅!!*
  
## 방법개요
- Tableau Server Management에 백업 명령어 (tsm-cli) 있네? 이거 쓸게여! 
- 근데 한번 백업하면 백업파일이 200메가 넘네? -> Tableau Server 올려놓은 서버는 코딱지만하니까 S3로 전송한다음에 지워버릴게여~
- S3에 저장된 파일은 수명 주기 정책 걸어서-> 30일 후에 삭제하게 할게요 

## 배치스크립트 (Windows)
- ```tsm maintenence backup -f ts_backup -d```    
  Tableau Server의 데이터, 통합문서 백업. 백업 파일 형태는 *ts_backup-%yyyy%-%mm%-%dd%.tsbak*    
    
- ```tsm settings export --output-config-file ts_export-2021-07-28.json```    
Tableau Server의 토폴로지 설정 export. 백업하고 달리, 날짜 지정해줘야함. 파일 형태는 json    
    
- 당연하지만 tsm 명령어 이후에는 배치 스크립트가 자동 종료되므로.. call 사용
    
- ```call tsm maintenance cleanup -l --log-files-retention 1```    
로그파일이 포함되어있으면 파일 사이즈 커지므로 주기적으로 지워준다 
   
- ```forfiles /P "C:\ProgramData\Tableau\Tableau Server\data\tabsvc\files\backups" /M *.tsbak /D -4 /C "cmd /c del @file```     
서버 상에서 백업파일 4일치만 남기도록 백업파일을 지워준다.
  

- **daily-backup.bat**
  
  ```shell
  @echo off
  
  rem delete existing file
  if exist "C:\ProgramData\Tableau\Tableau Server\data\tabsvc\files\backups\ts_backup-%date%.tsbak" del /s /q "C:\ProgramData\Tableau\Tableau Server\data\tabsvc\files\backups\ts_backup-%date%.tsbak"
  
  rem cleanup log files
  call tsm maintenance cleanup -l --log-files-retention 1
  if %errorlevel% neq 0 exit /b %errorlevel%
  
  rem cmd
  echo backup tableau server repo
  call tsm maintenance backup -f ts_backup -d
  if %errorlevel% neq 0 exit /b %errorlevel%
  
  rem del files
  call forfiles /P "C:\ProgramData\Tableau\Tableau Server\data\tabsvc\files\backups" /M *.tsbak /D -4 /C "cmd /c del @file"
  ```

- **daily-export.bat**
  
  ```shell
  @echo off

  rem log
  set LOGFILE=%date%-export.log
  call :LOG > %LOGFILE%
  exit /B
  
  :LOG
  rem Get start time:
  echo %date% %time%
  
  rem delete existing file
  if exist "C:\ProgramData\Tableau\Tableau Server\data\tabsvc\files\backups\ts_export-%date%.json" del /s /q "C:\ProgramData\Tableau\Tableau Server\data\tabsvc\files\backups\ts_export-%date%.json"
  
  rem cmd
  echo export tableau server topology
  call tsm settings export --output-config-file "ts_export-%date%.json"
  
  rem Get end time:
  echo %date% %time%
  ```

- param.bat 

  ```shell
   @if (@x)==(@y) @end /***** jscript comment ******
       @echo off
  
       cscript //E:JScript //nologo "%~f0"
       exit /b 0
  
   @if (@x)==(@y) @end ******  end comment *********/
  
  var d = new Date();
  d.setDate(d.getDate());
  
  var mm=(d.getMonth())+1
  if (mm<10){
    mm="0"+mm;
  }
  var dd=d.getDate();
  if (dd<10) {
   dd="0"+dd;
  }
  WScript.Echo(d.getFullYear()+"-"+mm+"-"+dd);
  ```

- **daily-transfer.bat** : S3 전송
  ```shell
  @echo off

  rem log
  set LOGFILE=%date%-transfer.log
  call :LOG > %LOGFILE%
  exit /B
  
  :LOG
  rem Get start time:
  echo %date% %time%
  
  rem transfer
  echo s3 cp export file
  aws s3 cp "C:\ProgramData\Tableau\Tableau Server\data\tabsvc\files\backups\ts_export-%date%.json" s3://hdci-dt/db=backup/
  
  rem transfer
  echo s3 cp backup file
  aws s3 cp "C:\ProgramData\Tableau\Tableau Server\data\tabsvc\files\backups\ts_backup-%date%.tsbak" s3://hdci-dt/db=backup/
  
  rem Get end time:
  echo %date% %time%
  ```
## S3 수명주기 
![1](https://dasoldasol.github.io/assets/images/image/backup1.png)
![2](https://dasoldasol.github.io/assets/images/image/backup2.png)

