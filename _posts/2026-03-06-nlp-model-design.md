---
title: "[NLP] LinearSVC에 확률을 입히다 - CalibratedClassifierCV로 키워드와 ML 신뢰도 비교"
excerpt: ""
toc: true
toc_sticky: true
classes: wide
categories:
- NLP
- AI
date: 2026-03-06 09:00:00 +0900
---

> 시리즈:
> 1. [[데이터파이프라인] VOC 분류 시스템 - AI 기반 고객 피드백 자동 분류](https://dasoldasol.github.io/datapipeline/nlp/ai/voc-nlp-pipeline/)
> 2. [[데이터파이프라인] VOC 분류 시스템 - 실시간 분류 API 구축](https://dasoldasol.github.io/datapipeline/nlp/ai/voc-nlp-api/)
> 3. 본 글

## 배경

VOC 자동 분류 시스템에서는 키워드 기반 분류와 ML 기반 분류를 병행하는 하이브리드 전략을 사용한다. 이 전략이 동작하려면 한 가지 전제가 필요하다: **키워드 점수와 ML 예측을 같은 [0, 1] 스케일에서 비교할 수 있어야 한다.**

문제는, 텍스트 분류에서 성능이 좋은 LinearSVC가 확률을 출력하지 않는다는 것이다.

```python
from sklearn.svm import LinearSVC

clf = LinearSVC()
clf.fit(X_train, y_train)
clf.predict_proba(X_test)  # AttributeError: 'LinearSVC' has no attribute 'predict_proba'
```

`decision_function()`으로 결정 경계까지의 거리를 얻을 수는 있지만, 이 값은 범위가 정해져 있지 않아서 키워드 점수와 직접 비교할 수 없다. 이 글에서는 `CalibratedClassifierCV`로 이 문제를 해결한 과정과, 모델 설계 시 내린 선택들을 정리한다.

## 왜 LinearSVC인가

텍스트 분류 모델을 선택할 때 고려한 조건:

| 조건 | 이유 |
|------|------|
| 고차원 희소 행렬에 강할 것 | TF-IDF 출력이 수천 차원의 sparse matrix |
| 학습/추론이 빠를 것 | 매월 배치 학습 + API 실시간 추론 |
| 소규모 데이터에서도 동작할 것 | 학습 데이터 4,726건 (딥러닝 모델이 요구하는 수만~수십만건에 비해 적음) |

LinearSVC는 이 세 조건을 모두 만족한다. 고차원 sparse 데이터에서 로지스틱 회귀와 함께 가장 널리 쓰이는 모델이고, liblinear 기반이라 학습 속도가 빠르다. 4,726건 학습이 수 초 내에 끝난다.

다만 LinearSVC는 확률이 아닌 결정 경계 거리(margin)를 출력한다. `predict_proba()`가 없다.

## CalibratedClassifierCV

`CalibratedClassifierCV`는 분류기의 출력을 보정된 확률로 변환하는 scikit-learn 래퍼다.

```python
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV

base_clf = LinearSVC(C=1.0, max_iter=10000, class_weight="balanced")
clf = CalibratedClassifierCV(base_clf, cv=3)
clf.fit(X_train, y_train)

probas = clf.predict_proba(X_test)  # 이제 동작한다
```

### 동작 원리

1. 학습 데이터를 `cv` 개의 fold로 나눈다
2. 각 fold에서 base 모델(LinearSVC)을 학습하고, hold-out fold로 `decision_function()` 값을 수집한다
3. 수집된 decision 값과 실제 라벨의 관계를 시그모이드(Platt scaling)로 피팅한다
4. 추론 시 decision 값을 이 시그모이드에 통과시켜 [0, 1] 확률로 변환한다

```
decision_function() → [-2.3, 0.1, 1.7, ...]  범위 제한 없음
        ↓ sigmoid fitting (Platt scaling)
predict_proba()    → [0.09, 0.52, 0.85, ...]  [0, 1] 보정 확률
```

### 핵심: 보정(calibration)이 왜 중요한가

단순히 softmax나 min-max 정규화로 [0, 1]을 만들 수도 있지만, 이렇게 만든 값은 **확률로서의 의미가 없다.** 보정된 확률은 "모델이 0.8이라고 출력한 샘플 중 실제로 80%가 정답"이라는 통계적 의미를 갖는다. 키워드 점수의 신뢰도와 비교하려면 이 보정이 필수적이다.

## 하이브리드 비교에서의 역할

키워드 태거는 매칭된 키워드의 위치, 빈도, 우선순위를 곱한 점수(score)를 출력한다. 이 점수는 범위가 정해져 있지 않으므로, 다음과 같이 정규화한다:

```
kw_conf = score / (score + alpha)    # → [0, 1]
```

CalibratedClassifierCV의 `predict_proba()`는 이미 [0, 1] 범위의 보정된 확률이므로, 직접 비교가 가능하다:

```python
if kw_score == 0:
    # 키워드 매칭 없음 → AI 사용
    use_ai()
elif ai_proba > kw_conf:
    # AI 신뢰도가 더 높음
    use_ai()
else:
    # 키워드 신뢰도가 더 높음
    use_keyword()
```

이 비교는 주제 분류에만 적용한다. 작업유형은 실험 결과 AI가 키워드 대비 +4.6%p 우세하여 AI로 전면 교체했다.

## 결합 라벨 전략

분류 체계가 대분류-중분류 2단계 계층이다:

```
시설 > 전기/조명
시설 > 냉난방/공조
환경 > 청결/미화
```

대분류와 중분류를 별도 모델로 학습하면 예측 시 불일치가 발생할 수 있다. 예를 들어 대분류 모델은 "시설"을, 중분류 모델은 "청결/미화"를 예측하면 "시설 > 청결/미화"라는 존재하지 않는 조합이 만들어진다.

이를 방지하기 위해 `"대분류>중분류"`를 하나의 라벨로 결합하여 단일 모델로 학습한다:

```python
LABEL_SEP = ">"

# 학습 시: 결합 라벨 생성
label = f"{major}{LABEL_SEP}{minor}"   # "시설>전기/조명"

# 추론 시: 분리
parts = label.split(LABEL_SEP, 1)
major, minor = parts[0], parts[1]
```

이 방식의 트레이드오프:

| | 개별 모델 (대분류 + 중분류) | 결합 모델 ("대분류>중분류") |
|------|------|------|
| 장점 | 각 모델이 적은 클래스 수를 다룸 | 대분류-중분류 불일치 원천 차단 |
| 단점 | 예측 시 불일치 가능 | 클래스 수 증가 (학습 데이터 분산) |

4,726건의 학습 데이터에서 결합 라벨의 고유 클래스 수는 약 30개 내외이므로, 데이터 분산 문제는 크지 않았다.

## 소수 클래스 대응

결합 라벨을 사용하면 "대분류>중분류" 조합 중 샘플이 극히 적은 클래스가 생긴다. 2건 이하인 클래스는 학습이 불안정하고, CalibratedClassifierCV의 CV fold 분할 시 오류를 유발할 수 있다.

### 1. 희귀 클래스 병합

샘플 수가 3건 미만인 클래스는 `"기타>기타"`로 병합한다:

```python
MIN_CLASS_SAMPLES = 3

rare = {cls for cls, cnt in counter.items() if cnt < MIN_CLASS_SAMPLES}
labels = np.array([
    "기타>기타" if lbl in rare else lbl
    for lbl in labels
])
```

### 2. CV fold 동적 조정

CalibratedClassifierCV의 `cv` 파라미터는 최소 클래스 샘플 수보다 클 수 없다. 예를 들어 가장 적은 클래스가 2건인데 `cv=3`이면 fold 분할이 불가능하다.

```python
min_count = min(counter.values())
cal_cv = min(3, min_count)  # 최소 클래스 수에 맞춰 CV fold 조정
clf = CalibratedClassifierCV(base_clf, cv=cal_cv)
```

### 3. class_weight="balanced"

클래스 간 샘플 수 불균형을 자동 보정한다. "시설>전기/조명"이 500건이고 "기타>기타"가 10건이라면, 소수 클래스의 오분류에 더 높은 페널티를 부여한다.

```python
base_clf = LinearSVC(C=1.0, max_iter=10000, class_weight="balanced")
```

## TfidfVectorizer 설정

```python
TfidfVectorizer(
    max_features=5000,
    ngram_range=(1, 2),
    sublinear_tf=True,
    min_df=2,
)
```

| 파라미터 | 값 | 설정 근거 |
|----------|-----|----------|
| `max_features` | 5000 | 4,726건 학습 데이터 대비 충분한 어휘 크기. 과도하게 크면 노이즈 증가 |
| `ngram_range` | (1, 2) | 단일 단어 + 바이그램. "전등 교체", "냉방 고장" 같은 2어절 패턴 포착 |
| `sublinear_tf` | True | `tf → 1 + log(tf)` 변환. 특정 단어가 반복 출현하는 VOC에서 과대 가중 방지 |
| `min_df` | 2 | 전체 문서 중 1건에만 등장하는 단어 제거. 오타·고유명사 등 노이즈 필터링 |

### sublinear_tf의 효과

VOC 텍스트에는 "에어컨 에어컨 에어컨 안 켜져요"처럼 같은 단어를 반복하는 경우가 있다. `sublinear_tf=True`가 없으면 TF 값이 3이 되어 해당 단어의 가중치가 과도하게 높아진다. 로그 변환을 적용하면 `1 + log(3) ≈ 2.1`로 완화된다.

## 전체 파이프라인 구성

```python
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV

# 주제 분류: 확률 필요 (키워드와 비교)
subject_pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        max_features=5000, ngram_range=(1, 2),
        sublinear_tf=True, min_df=2,
    )),
    ("clf", CalibratedClassifierCV(
        LinearSVC(C=1.0, max_iter=10000, class_weight="balanced"),
        cv=3,
    )),
])

# 작업유형 분류: 확률 불필요 (AI 전면 교체)
work_pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(
        max_features=5000, ngram_range=(1, 2),
        sublinear_tf=True, min_df=2,
    )),
    ("clf", LinearSVC(C=1.0, max_iter=10000, class_weight="balanced")),
])
```

주제 분류만 `CalibratedClassifierCV`로 감싼다. 작업유형은 키워드와 비교할 필요 없이 AI 결과를 그대로 사용하므로, 확률 보정 오버헤드가 불필요하다.

## 정확도

검수 완료 4,726건 기반, 5-fold 교차 검증:

| 분류 항목 | 키워드 | AI (결합 모델) | 전략 |
|-----------|--------|---------------|------|
| 주제 (대분류>중분류) | 88.1% | 88.4% | 키워드 vs AI 확률 비교 → 높은 쪽 사용 |
| 작업유형 (대분류>중분류) | 84.9% | 89.5% | AI 전면 교체 (+4.6%p) |

주제는 키워드(88.1%)와 AI(88.4%)가 거의 비슷하다. 이 경우 한쪽으로 통일하는 것보다, 건별로 신뢰도가 높은 쪽을 선택하는 하이브리드가 유리하다. CalibratedClassifierCV가 출력하는 보정 확률 덕분에 이 비교가 가능하다.

작업유형은 AI가 +4.6%p 우세하므로 비교 없이 전면 교체한다. 이 경우 확률 보정이 필요 없어 LinearSVC를 그대로 사용한다.

## 정리

| 설계 결정 | 해결한 문제 |
|-----------|------------|
| CalibratedClassifierCV | LinearSVC에 보정된 확률 부여 → 키워드 점수와 동일 스케일 비교 |
| 결합 라벨 ("대분류>중분류") | 대분류-중분류 예측 불일치 원천 차단 |
| 소수 클래스 병합 + CV 동적 조정 | 희귀 클래스로 인한 학습 불안정/CV 분할 오류 방지 |
| class_weight="balanced" | 클래스 불균형 자동 보정 |
| sublinear_tf=True | 반복 단어의 과대 가중 방지 |
| 주제만 확률 보정, 작업유형은 생략 | 불필요한 보정 오버헤드 제거 |
