---
title: "ipynb를 깃블로그 md 파일로 변환하기"
excerpt: "주피터 노트북 파일을 md파일로 변환해서 깃블로그에 업로드하자"
categories:
- AWS
modified_date: 2021-06-01 10:36:28 +0900
---
anaconda 프롬프트를 열고 inbpy 파일이 위치한 경로에서 다음 명령어를 입력한다.
```
jupyter nbconvert --to markdown notebook.ipynb
```
이 명령어를 입력하면 md 파일이 나오고 복붙해서 쓰면 된다.    
다만 이미지 파일은 깨지므로 따로 업로드가 필요하다.
