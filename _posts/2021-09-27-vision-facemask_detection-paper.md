---
title: "[Vision/Object Detection]What is the best model for Face Mask Detection? - 논문작성"
excerpt: '코로나 시대, 객체 탐지 모델 7개를 비교하여 마스크 착용 유무 탐지에 가장 좋은 모델을 찾아본다.'
categories:
- Deep Learning
- Vision
- Object Detection
modified_date: 2021-09-27 10:36:28 +0900
toc: true
toc_sticky: true
---
# 목적
- 마스크 착용 여부를 가장 정확하게 탐지하는 모델을 찾아보자.
- 7개의 모델을 비교하고자 한다.
- 코드 구현 : [What is the best model for Face Mask Detection? - 코드구현]()
# 발표 Slide 
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드1.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드2.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드3.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드4.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드5.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드6.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드7.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드8.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드9.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드10.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드11.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드12.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드13.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드14.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드15.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드16.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드17.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드18.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드19.JPG)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_slides/슬라이드20.JPG)
# 논문 페이퍼
![image.jpg](https://dasoldasol.github.io/assets/images/image/face_mask_detection_paper/0001.jpg)
![image.jpg](https://dasoldasol.github.io/assets/images/image/face_mask_detection_paper/0002.jpg)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_paper/0003.jpg)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_paper/0004.jpg)
![image.JPG](https://dasoldasol.github.io/assets/images/image/face_mask_detection_paper/0005.jpg)