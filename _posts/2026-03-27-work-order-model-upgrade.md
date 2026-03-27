---
title: "[데이터파이프라인] VOC-작업지시 통합 분석 - Semi-supervised Learning으로 작업지시 분류 모델 구축"
excerpt: "VOC 모델이 작업지시에서 왜 정확도가 낮았고, Semi-supervised Learning으로 어떻게 개선했는지"
toc: true
toc_sticky: true
classes: wide
categories:
- DataPipeline
- NLP
- AI
date: 2026-03-27 09:00:00 +0900
---

> 전편: [[데이터파이프라인] VOC 분류 시스템 - Kiwi 형태소 분석기 도입](https://dasoldasol.github.io/datapipeline/nlp/ai/voc-nlp-kiwi-tokenizer/)

## 배경: 왜 모델이 필요했나

빌딩 관리 VOC(고객 민원) 자동 분류 시스템(Phase 1)이 운영 중이었다. TF-IDF + LinearSVC 하이브리드 모델로 VOC를 주제(22개 클래스)와 작업유형(11개 클래스)으로 분류하고 있었고, 검수 기준 정확도는 88~90%로 안정적이었다.

Phase 2에서는 같은 분류 체계를 **작업지시(Work Order) 데이터 130,000건**에도 적용하고 싶었다.

### 작업지시란?

빌딩 관리 현장에서는 설비 점검, 고장 수리, 민원 대응 등의 업무가 발생할 때 "작업지시"를 등록한다. 현장 직원이 작성하는 업무 기록으로, 어떤 건물에서 누가 무슨 작업을 했는지가 기록된다.

| 항목 | 예시 |
|------|------|
| 제목 | "B2F 주차장 LED 램프 교체" |
| 설명 | "지하2층 주차장 B구역 LED 램프 3개 불량" |
| 조치 내용 | "LED 15.7W 3EA 교체 완료" |
| 작성자 | 전기팀 김OO |
| 건물 | 판교세븐벤처밸리 |

VOC가 **고객이 접수하는 민원**이라면, 작업지시는 **현장 직원이 작성하는 업무 기록**이다. 같은 건물 관리 도메인이지만 작성자와 텍스트 스타일이 완전히 다르다.

같은 분류 체계로 VOC와 작업지시를 태깅하면, "이 민원이 어떤 작업으로 이어졌는가?", "반복적으로 같은 작업을 하는 패턴은 없는가?" 같은 교차 분석이 가능해진다.

**문제:** VOC 모델(5,041건 학습)로 작업지시를 분류하면 정확도가 크게 떨어졌다.

| 분류 | VOC 모델 정확도 (VOC 대상) | VOC 모델 정확도 (작업지시 대상) |
|------|--------------------------|-------------------------------|
| 주제 | 90.6% | 69% |
| 작업유형 | 86.6% | 55% |

69%와 55%로는 실무에서 쓸 수 없었다.

## 왜 낮았나: 텍스트 스타일 차이

같은 상황을 설명하더라도 VOC와 작업지시의 텍스트 스타일이 완전히 다르다.

| | VOC (고객 작성) | 작업지시 (현장 직원 작성) |
|---|----------------|------------------------|
| 예시 1 | "5층 남자화장실 변기가 막혔어요. 빠른 조치 부탁드립니다." | "5층 남화 양변기 통수" |
| 예시 2 | "사무실 에어컨이 안 켜져요" | "3층 FCU 이상" |
| 예시 3 | "엘리베이터에서 이상한 소리가 나요" | "EV 소음 점검" |
| 특징 | 격식체, 긴 문장, 구어체 | 약어, 전문용어, 짧은 메모 |

TF-IDF 모델은 단어 빈도 패턴을 학습한다. VOC에서는 "변기가 막혔어요"를 학습했지만, 작업지시의 "양변기 통수"는 본 적이 없다. FCU, EV, DDC 같은 설비 약어도 VOC에는 거의 등장하지 않는다.

## 시도 1: 작업지시만으로 학습

가장 직관적인 해결책은 작업지시 데이터로 별도 모델을 학습하는 것이었다. 주제 1,280건, 작업유형 900건을 수작업 검수하여 학습 데이터를 만들었다.

| 분류 | 검수 건수 | 클래스 수 | 클래스당 평균 |
|------|----------|----------|-------------|
| 주제 | 1,280건 | 22개 | 58건 |
| 작업유형 | 900건 | 11개 | 82건 |

5-fold CV 결과:

| 분류 | CV 정확도 | Train 정확도 | Gap |
|------|----------|-------------|-----|
| 주제 | 63.6% | 99.0% | 35.4%p |
| 작업유형 | 71.3% | 99.1% | 27.8%p |

**심각한 과적합이었다.** Train 99%인데 CV 64%라면 데이터가 부족하다는 뜻이다. 클래스당 58건으로는 TF-IDF + LinearSVC가 일반화할 수 없었다.

## 시도 2: VOC + 작업지시 통합 학습

VOC 5,041건과 작업지시 검수 데이터를 합쳐서 학습하되, `sample_weight`로 작업지시에 가중치를 줬다(VOC 1.0 : WO 3.0).

| 분류 | 작업지시 only | VOC+WO weighted | 개선폭 |
|------|-------------|-----------------|--------|
| 주제 | 63.6% | 71.9% | +8.3%p |
| 작업유형 | 71.3% | 77.0% | +5.7%p |

개선됐지만 80%에 미달이었다. 근본적으로 VOC 텍스트와 작업지시 텍스트의 스타일이 달라서, 모델이 두 스타일 사이에서 혼란을 겪었다.

## 시도 3: Semi-supervised Learning

### 아이디어

검수 데이터는 1,280건뿐이지만, VOC 모델로 이미 분류한 작업지시가 **96,562건** 있었다. 정확도가 69%라 해도, 나머지 31%만 틀리고 **69%는 맞다**는 뜻이다.

이 중 AI가 확신하는 건(기타 분류 제외)을 "가짜 정답(pseudo-label)"으로 추가하면, 검수 데이터 1,280건을 5배 이상 늘릴 수 있다.

```
검수 데이터 1,280건 (정확한 정답)
    +
pseudo-label 5,000건 (AI가 확신하는 예측)
    =
총 6,280건으로 학습
```

### pseudo-label 선별 기준

기존 모델(VOC로 학습한 모델)로 작업지시 96,562건을 분류한 결과에서:

1. 주제가 "기타"인 건 제외 (분류 불확실)
2. 나머지에서 5,000건 랜덤 샘플링

```python
# pseudo-label 데이터 준비 (기존 재태깅 결과에서 고신뢰 샘플)
retag_existing = pd.read_csv("output/wo_retagging_result.csv")
pseudo_candidates = retag_existing[retag_existing["subj_major"] != "기타"].copy()

if len(pseudo_candidates) > 5000:
    pseudo_sample = pseudo_candidates.sample(n=5000, random_state=42)
```

전체를 사용하지 않고 5,000건으로 제한한 이유는, pseudo-label이 너무 많으면 노이즈 비율이 높아져서 검수 데이터의 신호를 묻어버리기 때문이다.

### 왜 이게 작동하는가

pseudo-label에는 분명히 틀린 라벨도 포함되어 있다. 그런데 왜 도움이 될까?

1. **작업지시 텍스트 패턴 학습**: 기존 모델은 VOC 스타일만 알고 있었다. pseudo-label이 맞든 틀리든, 학습 과정에서 "통수", "FCU", "EV" 같은 작업지시 특유의 토큰들이 TF-IDF 벡터 공간에 들어온다.
2. **다수결 효과**: 69%가 맞으니, 대부분의 pseudo-label은 올바른 방향을 가리킨다.
3. **검수 데이터의 보정 역할**: 정확한 검수 데이터 1,280건이 잘못된 pseudo-label의 노이즈를 보정해준다.

### CV 방식이 핵심이다

단순히 전체 6,280건으로 학습하고 검수 데이터에 대해 예측하면 과적합이다(검수 데이터가 학습에 포함되니까). 올바른 방법은 5-fold CV에서 각 fold마다 pseudo-label을 처리하는 것이다.

```
5-fold CV의 각 fold:
  train = (해당 fold의 검수 train 분할) + (전체 pseudo-label 5,000건)
  test  = (해당 fold의 검수 test 분할)
```

pseudo-label은 항상 train에만 들어가고, test는 순수 검수 데이터로만 구성된다. 이렇게 해야 검수 데이터에 대한 공정한 정확도를 측정할 수 있다.

```python
skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

for train_idx, test_idx in skf.split(r3_batch, subj_y):
    # train: fold의 검수 train + pseudo 전체
    train_texts = np.concatenate([r3_batch[train_idx], pseudo_batch_texts])
    train_y = np.concatenate([subj_y[train_idx], pseudo_subj_y])

    pipe = make_calibrated_pipeline()
    pipe.fit(train_texts, train_y)

    # test: fold의 검수 test만
    fold_preds = pipe.predict(r3_batch[test_idx])
```

이 방식에서 각 fold의 test 데이터는 학습에 전혀 사용되지 않으므로, 측정된 정확도는 신뢰할 수 있다.

## 결과 비교

| 방법 | 주제 CV | 작업유형 CV |
|------|---------|-----------|
| VOC 모델로 작업지시 분류 (기존) | 69% (검수) | 55% (검수) |
| 작업지시 only (1,280건) | 63.6% | 71.3% |
| VOC+WO weighted | 71.9% | 77.0% |
| **Semi-supervised (1,280+5,000건)** | **79.7%** | **87.2%** |

- 주제: 63.6% -> 79.7% (+16.1%p)
- 작업유형: 71.3% -> 87.2% (+15.9%p)

작업유형이 더 크게 개선된 이유는, 작업지시의 작업유형 분류가 VOC보다 텍스트와 라벨 간 관계가 명확하기 때문이다. "교체", "점검", "청소" 같은 단어가 직접적으로 등장하는 경우가 많다.

## 하이브리드 분류

주제 분류에는 키워드+AI 하이브리드 방식을 적용했다.

```
키워드 태깅 (taxonomy 기반) 결과가 있는 경우:
  키워드 신뢰도 = kw_score / (kw_score + alpha)
  if AI 확률 >= 키워드 신뢰도:
      AI 결과 사용
  else:
      키워드 결과 사용
키워드 태깅 결과가 없는 경우:
  AI 결과 사용
```

alpha=400으로 설정했다. alpha가 높을수록 AI를 더 신뢰한다. 키워드 score가 100이면 kw_conf=0.20이므로, AI가 20% 이상 확신하면 AI 결과를 사용한다.

Semi-supervised로 AI 모델이 충분히 강해지면서, 대부분의 건에서 AI 결과가 채택되었다. 결과적으로 하이브리드 주제 정확도도 79.7%로, AI only와 거의 동일했다.

작업유형은 AI only로 분류한다. 작업유형은 키워드 매칭이 어려운 케이스가 많아서(같은 "펌프" 텍스트가 유지보수일 수도, 점검일 수도 있다) AI 단독이 더 정확했다.

## 기술 스택

| 구성 요소 | 선택 | 이유 |
|----------|------|------|
| Tokenizer | Kiwi 형태소 분석기 (lemma + 복합명사) | Java 불필요, 한국어 복합명사 분리 우수 |
| 벡터화 | TfidfVectorizer (max_features=10000, ngram=(1,2)) | 도메인 어휘 10K면 충분, bigram으로 복합 표현 포착 |
| 분류기 (주제) | CalibratedClassifierCV(LinearSVC(C=1.0)) | 확률 출력 필요 (하이브리드 비교용) |
| 분류기 (작업유형) | LinearSVC(C=1.0, class_weight="balanced") | 확률 불필요, 빠른 학습/추론 |

```python
# 주제 파이프라인 (CalibratedCV로 확률 지원)
Pipeline([
    ("tfidf", TfidfVectorizer(
        tokenizer=kiwi_lemma_compound_tokenizer,
        token_pattern=None,
        max_features=10000,
        ngram_range=(1, 2),
        sublinear_tf=True,
        min_df=1,
    )),
    ("clf", CalibratedClassifierCV(
        LinearSVC(C=1.0, max_iter=10000, class_weight="balanced"),
        cv=3,
    )),
])
```

`class_weight="balanced"`는 소수 클래스에 높은 가중치를 부여한다. 검수 데이터에서 "계측/검침" 같은 소수 클래스는 30건 미만인데, balanced를 쓰지 않으면 다수 클래스에 묻혀서 아예 예측하지 못한다.

## 전체 파이프라인

Semi-supervised 모델 학습부터 96,000건 재태깅까지의 전체 흐름이다.

```
STEP A: Semi-supervised 모델 학습
  - 검수 CSV(주제 1,280건, 작업유형 900건) 로드
  - pseudo-label 5,000건 샘플링 (기존 재태깅 결과에서)
  - 검수 + pseudo로 배치/API 모델 4개 학습
  - pkl 저장 (wo_batch_models.pkl, wo_api_models.pkl, ...)

STEP B: 5-fold CV 정확도 측정
  - 주제: 키워드+AI 하이브리드 79.7%
  - 작업유형: AI only 87.2%

STEP C: 수시 작업지시 96,635건 재태깅
  - 운영 DB에서 수시 작업지시 전체 조회
  - Semi-supervised 모델로 하이브리드 재태깅
  - CSV 저장 (wo_retagging_result_v2.csv)

STEP D: 팀장 보고용 HTML 리포트 생성
```

## 실험 과정에서 배운 것

**1. 데이터 양 vs 품질의 트레이드오프**

검수 데이터 1,280건은 품질이 높지만 양이 부족했다. pseudo-label 5,000건은 품질이 낮지만 양이 풍부했다. Semi-supervised learning은 이 둘을 결합해서 양쪽의 장점을 취한다.

**2. 도메인 텍스트 스타일 차이는 심각하다**

같은 도메인(빌딩 관리)이라도 작성자가 다르면 텍스트 스타일이 완전히 달라진다. VOC+작업지시 통합 학습이 기대만큼 안 된 이유다. 모델을 분리하는 게 맞았다.

**3. CV 설계가 결과 신뢰도를 결정한다**

pseudo-label을 사용할 때 CV 방식을 잘못 설계하면, 실제보다 높은 정확도가 나온다. 반드시 pseudo-label은 train에만, test는 순수 검수 데이터로 구성해야 한다.

## 남은 과제

| 과제 | 현재 | 목표 |
|------|------|------|
| 주제 정확도 | 79.7% | 90%+ |
| 작업유형 정확도 | 87.2% | 90%+ |

개선 방향:
- **Iterative semi-supervised**: 1차 모델로 재태깅 -> 고신뢰 건 추가 -> 2차 모델 학습 (반복)
- **키워드 보강**: taxonomy 키워드를 작업지시 텍스트 패턴에 맞게 추가
- **사전학습 한국어 모델**: KoBERT, KoELECTRA 등으로 텍스트 표현력 자체를 개선
- **추가 검수**: 정확도 70% 미만 클래스(주차, 계측/검침, 안내/민원 등)에 집중 검수
