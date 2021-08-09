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

- tsm 명령어 이후에는 배치 스크립트가 자동 종료되므로.. 파일을 쪼개줌. 
  

- **daily-backup.bat**

    ```shell
    @echo off
    for /f %%a in ('param.bat') do set "dt=%%a"
    set year=%dt:~0,4%
    set mm=%dt:~5,2%
    set dd=%dt:~-2%
    
    echo delete old backup files
    del /s /q "*.tsbak"
    
    echo backup tableau server repo
    tsm maintenance backup -f ts_backup -d
    ```

- **daily-export.bat**
  
    ```shell
    @echo off
    for /f %%a in ('param.bat') do set "dt=%%a"
    set year=%dt:~0,4%
    set mm=%dt:~5,2%
    set dd=%dt:~-2%
    
    echo delete old backup files
    del /s /q "*.json"
    
    echo export tableau server topology
    tsm settings export --output-config-file ts_export-%dt%.json
    ```

- **daily-transfer.bat**
  
    ```shell
    @echo off
    for /f %%a in ('param.bat') do set "dt=%%a"
    set year=%dt:~0,4%
    set mm=%dt:~5,2%
    set dd=%dt:~-2%
    
    echo s3 cp backup file
    aws s3 cp "ts_backup-%dt%.tsbak" s3://{bucket_name}/db=backup/year=%year%/month=%mm%/day=%dd%/
    
    echo s3 cp export file
    aws s3 cp "ts_export-%dt%.json" s3://{bucket_name}/db=backup/year=%year%/month=%mm%/day=%dd%/
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


## S3 수명주기 
![1](https://dasoldasol.github.io/assets/images/image/backup1.png)
![2](https://dasoldasol.github.io/assets/images/image/backup2.png)

## TODO 
- Error Handling 부분 추가해야됨~
