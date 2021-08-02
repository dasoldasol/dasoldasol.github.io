---
title: "Windows Dummy File 만들기"
excerpt: "테스트에 쓸 Dummy File을 만드는 명령어"
categories:
- BatchScript
modified_date: 2021-08-02 10:36:28 +0900
---
- 만들고자 하는 폴더 위치에서 PowerShell 열기 ([파일] 클릭 )
- 필요 용량의 더미 파일 생성 
```shell
fsutil file createnew ts_backup-2021-08-02.tsbak 283115520
```    
    1KB = 1024 Byte     
    1MB = 1048576 Byte    
    1GB = 1073741824 Byte     