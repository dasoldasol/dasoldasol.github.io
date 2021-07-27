---
title: "[논문리뷰]Predicting residential energy consumption using CNN-LSTM neural networks(2019)"
excerpt: "빌딩 에너지 소비 예측 method 리뷰"
categories:
- Deep Learning 
modified_date: 2021-07-13 10:36:28 +0900
toc: true
toc_sticky: true
---

## Why this paper?
- Energy, 2019 / Reference count, 214
- 빌딩 에너지 소비 관련 연구 쟁점 확인, 주로 뭘 궁금해하고, 뭘 중점적으로 풀고자 하는지 보기 위함
- 빌딩 에너지 수요 예측에서 성능 평가는 어떻게 하는지 보기 위함 : 얼마나 잘 됐는지 설명하는 방법을 봄
- 시계열성이 강한 빌딩 에너지 데이터를 처리하는 일반적 방법을 보고자 함

## 0. Abstract

- 안정적인 전력 공급을 위해서는 에너지 소비량을 미리 정확히 예측하는 것이 중요하다.
- 본 논문에서는 주택 에너지 소비를 효과적으로 예측하기 위해 공간적, 시간적 특징을 추출할 수 있는 CNN-LSTM 신경망을 제안
- CNN(Convolutional Neural Network)과 LSTM(Long Short-Term Memory)를 결합한 CNN-LSTM 신경망은 복잡한 에너지 소비 특성을 추출
    - CNN 레이어는 에너지 소비에 영향을 미치는 여러 변수 사이의 특징을 추출
    - LSTM 계층은 시계열 구성 요소의 불규칙한 추세에 대한 시간 정보를 모델링하는 데 적합
- 성능을 **RMSE**로 평가, 기존 예측방법에 비해 가장 작은 값 기록
- +) 변수에 대한 실증적 분석을 통해 소비전력 예측에 가장 영향을 미치는 것이 무엇인지 확인

## 1. Introduction

- 에너지 소비 예측은 "**다변수 시계열 예측 문제(multivariate time series prediction)**"
- 에너지 소비의 불규칙성  :  "규칙적인 계절적 패턴 + 불규칙한 trend 구성 요소 + 랜덤 요인"으로 이루어져 고전적 예측 방법으로 예측하기 어려움 (아래 그림은 에너지 소비 시계열 분해에서의 "불규칙성"을 보여줌)

![00](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/00.png)

- 대상 데이터 셋 : 4년간 주거 전력 소비 데이터 (약 200만 시계열 데이터, 변수 12개)
- 충격 반응 함수(impulse response function)는 수집된 여러 시계열 데이터 간의 상관관계를 기반으로 각 변수가 다른 변수에 미치는 영향을 결정하는데 사용한다. → 이를 이용해 **변수간의 영향이 매우 큰 것**을 확인할 수 있다. 따라서, **시계열 변수 중에서 특징을 추출하는 것이 매우 어렵다**.
- 최근 지역적 특징과 순차적 특징을 함께 학습시키는 연구들
    - 보통 CNN은 추상적인 시각적 특징을 추출하고 학습 이미지에 대한 픽셀 간의 관계를 보존한다. RNN은 순차 정보를 저장하고 시간 정보가 지속되도록 업데이트 된다.
    - 자연어 처리에서의 CNN-LSTM 모델 : 자연어 처리 분야에서 CNN 모델과 LSTM 모델을 결합해 문장 내 local 정보를 순차적으로 통합하여 긴 문장에서의 단어간 의존성을 파악하도록 함.
    - 음성 검색에서의 CLDNN 모델 : CNN, LSTM, DNN을 결합해 노이즈에 대한 견고성을 보여주는 음성 검색 작업
    - 비디오 처리 분야 : CNN과 양방향 LSTM을 결합해 비디오 시퀀스에서 인간의 행동을 인식
    - ECG 부정맥 감지 : CNN-LSTM 결합 모델 사용
- 제안하는 **에너지 소비 예측 CNN-LSTM** 방법
    - CNN 레이어 : 에너지 소비 예측에 영향을 미치는 여러 변수 중 특징을 추출

      → 기여부분) CNN 레이어가 여러 변수의 특징을 추출하는지 confirm, 에너지 소비 예측에서 어떤 변수가 가장 중요한지 분석

    - LSTM 레이어 : 전기 에너지 소비의 불규칙한 추세 요인을 기억
    - CNN-LSTM 방법으로 어느 시간 주기까지 정확한 예측이 가능한지 계측함.

      → 기여부분) 이전 연구들에 비해 고해상도(high time resolution)에서 최고의 성능 구현

## 2. Related Works

### 통계 기반 모델링

- **선형회귀** : 전력 소비 예측 시, 시간 해상도(time resolution)가 예측 모델의 성능에 영향을 미침.
- **다중회귀+genetic programming** : 유전자 알고리즘을 사용한 중요 변수 선택 → 독립변수간의 상관관계는 다중공선성 문제를 유발할 수 있는 문제가 있음

### ML 기반 모델링

- **서포트 벡터 회귀, 랜덤 포레스트 회귀** : 데이터의 특징이 많지 않은 경우에도 용이 → 여러 변수의 상관관계가 복잡해지거나 데이터의 양이 많아지면 과적합이 심함. 과적합 발생 시 장기 소비를 예측하기 어려움

### DL 기반 모델링

- Sequence to sequence, autoencoder : 딥러닝 방법을 이용해 전력 소비 데이터에서 무작위성과 노이즈를 줄이고 중요한 특징을 추출. 기존 데이터가 많고 복잡한 속성이 있어도 용이함 → 기존 방법은 소비 전력의 시공간적 특성을 함께 모델링하는데 어려움

### 문제제기

- 대부분 연구는 에너지 소비 데이터에서 중요 변수 중 일부만 선택한 다음 시간 정보를 모델링하여 에너지 소비를 예측
- 지금까지 소비 전력, 다변수 시계열 데이터에서 시간 정보와 변수의 공간적(spatial) 상관관계를 예측하려는 시도는 없었음

## 3. The proposed method

![11](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/01.png)

- 학습 대상 데이터 : 슬라이딩 윈도우 알고리즘에 의해 60분마다 사전 처리된 입력 데이터
- CNN 레이어 : 다변량 시계열 변수의 공간적 특성을 추출하여 노이즈 제거 후 LSTM 레이어로 전달
- LSTM 레이어 : 전송된 공간 특성을 사용해 불규칙한 시간 정보를 모델링
- FC 레이어 : 에너지 소비 예측

### CNN-LSTM neural networks

- **CNN 레이어**
    - 구성) 입력 : 센서 변수, 날짜, 시간(다변수 시계열 시퀀스) / 출력 : LSTM에 기능을 추출

    - 전력 소비 입력 벡터
    
      n : window당 정규화된 60분 단위 유닛
    
      ![22](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/02.png)
    
    - 컨볼루션 레이어 출력
    
      sigma : 활성화함수 ReLU
    
      ![03.png](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/03.png)
    
    - Max Pooling
    
      T : stride , R : pooling size(y보다는 작아야함)
    
      ![04.png](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/04.png)

- **LSTM 레이어**
    - 기능) 추출된 전력 수요의 중요 특성에 대한 시간 정보를 저장. → 장기 시퀀스에서 시간적 관계를 쉽게 이해할 수 있음, 게이트 유닛 사용하여 RNN에서의 기울기 문제 해결
    - 입력) CNN레이어의 출력 값이 게이트 유닛으로 전달

    - 게이트 유닛 (입력, 망각, 출력)

      p : 에너지 소비 중요 특성/ sigma : 활성화함수 tanh

      ![05.png](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/05.png)

      LSTM을 구성하는 메모리 셀은 0과 1 사이의 연속 값으로 제어되는 각 게이트 유닛의 활성화로 상태를 업데이트함.  매 t 스텝마다 은닉상태 h_t가 업데이트 됨.

    - 셀 상태, 은닉 상태

      ![06.png](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/06.png)

- **FC 레이어**

  ![07.png](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/07.png)

### Architecture

- 입력 데이터 대상 : 다변수 시계열로, 슬라이딩 윈도우 알고리즘에 의해 60분 윈도우로 전처리됨
- 입력 크기  60 * 10 (60분 시계열로 구성된 총 10개의 변수)

![08.png](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/08.png)

## 4. Experiments

### Indivisual household electric power consumption dataset

- 주기 : 1분 단위
- 전처리 : 60분 슬라이딩 윈도우 구성 → 다음 60분을 예측

### Performance comparison with ML

- 비교대상 : LR(선형회귀), DT(의사결정나무), RF(랜덤포레스트), MLP(다층퍼셉트론)
- 성능 측정 : 10-fold cross validaion → MSE
- 제안 방법이 MSE가 낮고, 관측되는 variance가 작다.

![09.png](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/09.png)

### Performance comparison with DL

- 비교대상 : LSTM, GRU, Bi-LSTM, Attention LSTM
- 성능 측정 : MSE, RMSE, MAE, MAPE
- 제안 방법이 가장 성능이 좋음

![10.png](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/10.png)

### Prediction results for CNN-LSTM network

- 선형회귀와 비교시, local feature에 대한 모델링 성능이 좋음 (위 그래프)
- 선형회귀와 비교시, 복잡한 시계열 패턴과 전력 소비에서 자주 발생하는 피크 예측이 잘 됨 (아래 그래프)

![11.png](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/11.png)

### Comparison of prediction performance by time resolution

- 제안 모델은 다양한 시간 해상도(time resolution)에도 강건함
- 시간해상도 : minutely, hourly, daily, weekly

![12.png](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/12.png)

### CNN-LSTM model internal analysis

- CNN-LSTM의 동작 원리를 확인하기 위해 모델 내부 분석 시각화
-
- CNN레이어에서  노이즈가 감소하는 것을 보여주지만 시간적 경향은 거의 동일함. 즉, CNN-LSTM이 최소한의 정보 손실로 모델링을 수행함을 의미

![13.png](https://dasoldasol.github.io/assets/images/image/Predicting-residential-energy-consumption/13.png)

- 커널A, 커널 B에 의해 필터링된 에너지 소비 데이터의 중간 출력은 노이즈를 감소시킬 뿐만 아니라 로컬 및 전역 특성을 보존함

### Analysis of variables affecting power consumption prediction

- 클래스 활성화 점수의 평균값을 통해 중요 변수 도출(블랙박스 모델 분석)
- 특히 중요 변수로 도출된 sub_metering3은 전기온수기/에어컨임. 난방/냉방 시스템은 에너지 소비 예측에 중요 변수임. 즉, CNN-LSTM 예측 모형에 영향을 미친 소비 변수가 중요 변수임을 역으로 나타냄

## 5. Conclusions

- 기여한 점
    - CNN-LSTM 모델은 기존 머신러닝 방법에서는 예측할 수 없었던 불규칙한 전력 소비 경향을 예측
    - 또한 예측에 영향을 미치는 변수를 설명하려고 시도함
    - 1) 0.37 MSE의 안정적인 성능으로 주거용 주택 전기 에너지 소비 추정
    - 2) 다양한 시간 해상도(분, 시간, 일, 주 단위)의 모든 경우에서 최고의 성능
    - 3) 가장 큰 영향을 미치는 변수인 전기온수/에어컨 변수를 찾아냄
- 한계
    - 최적의 하이퍼 파라미터 검색 자동화가 필요 (유전 알고리즘 등)
    - 검증을 위한 에너지 소비 데이터 수집 필요
    - 현재 데이터에는 가구 특성에 대한 정보가 없음