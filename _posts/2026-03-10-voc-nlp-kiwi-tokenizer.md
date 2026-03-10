---
title: "[데이터파이프라인] VOC 분류 시스템 - Kiwi 형태소 분석기 도입"
excerpt: ""
toc: true
toc_sticky: true
classes: wide
categories:
- DataPipeline
- NLP
- AI
date: 2026-03-10 09:00:00 +0900
---

> 전편: [[데이터파이프라인] VOC 분류 시스템 - 실시간 분류 API 구축](https://dasoldasol.github.io/datapipeline/nlp/ai/voc-nlp-api/)

## 배경

VOC 자동 분류 시스템에서 텍스트 토큰화는 두 곳에서 사용된다.

| 용도 | 모듈 | 기존 토크나이저 | 역할 |
|------|------|----------------|------|
| AI 모델 학습/추론 | `ai_classifier.py` | sklearn 기본 토크나이저 | TF-IDF 벡터화 입력 |
| HTML 리포트 키워드 분석 | `keyword_analysis.py` | KoNLPy Komoran | 워드클라우드, 키워드 TOP20 추출 |

**문제:**
- AI 모델의 sklearn 기본 토크나이저는 한국어 형태소를 고려하지 않아, "엘리베이터수리"를 하나의 토큰으로 처리하거나 의미 없는 단위로 분리하는 문제가 있었다
- Komoran의 `nouns()` 메서드는 의존명사(NNB)까지 추출하여, 워드클라우드에 "때문", "것", "수" 같은 무의미한 토큰이 포함되었다
- AI 모델과 키워드 분석이 서로 다른 토크나이저를 사용하여, 분류와 리포트 간 토큰 품질이 불일치했다

**목표:** Kiwi 형태소 분석기로 통일하여 AI 모델과 키워드 분석 모두의 토큰 품질을 개선한다.

## Kiwi 형태소 분석기

[Kiwi(Korean Intelligent Word Identifier)](https://github.com/bab2min/kiwipiepy)는 C++로 구현된 한국어 형태소 분석기로, JVM 없이 Python에서 바로 사용할 수 있다.

**Kiwi의 장점:**
- **Java 불필요**: 순수 C++ 바인딩, pip install만으로 설치 완료
- **Lemmatization 지원**: 활용형을 원형으로 복원 ("더러워요" → "더럽다")
- **빠른 속도**: C++ 기반으로 Komoran 대비 처리 속도 우수
- **모호성 해소 성능 우수**: 통계적 언어 모델 + Skip-Bigram 조합으로 평균 정확도 86.7% ([벤치마크](https://github.com/bab2min/kiwipiepy/tree/main/benchmark/disambiguate))

### 왜 Komoran 대신 Kiwi인가

형태소 분석에서 가장 까다로운 문제는 **모호성 해소**다. 같은 형태의 단어가 문맥에 따라 다른 품사로 분석되어야 하는 경우가 많다.

| 문장 | Komoran | Kiwi |
|------|---------|------|
| "문을 **잠그다**" (동사) | 잠그/VV + 다/EC | 잠그/VV + 다/EC |
| "잠을 **자다**" → "**잠그고**" | 잠그/VV (정확) | 잠그/VV (정확) |
| "그 **배**가 맛있다" (과일) | 배/NNG | 배/NNG |
| "그 **배**가 출항했다" (선박) | 배/NNG | 배/NNG |
| "나는 **밤**에 간다" (시간) | 밤/NNG | 밤/NNG |
| "나는 **밤**을 먹는다" (열매) | 밤/NNG (구분 실패) | 밤/NNG (문맥 반영) |

Kiwi는 근거리 맥락을 고려하는 **통계적 언어 모델**과 원거리 맥락을 고려하는 **Skip-Bigram 모델**을 조합하여 모호성을 해소한다. [kiwipiepy 공식 벤치마크](https://github.com/bab2min/kiwipiepy/tree/main/benchmark/disambiguate)에서 불규칙 활용, 동사/형용사 구분, 명사+조사 구분, 장거리 문맥 등 4가지 평가 항목에서 기존 오픈소스 형태소 분석기(평균 50~70%) 대비 **평균 86.7%**의 정확도를 달성했다.

VOC 텍스트에서도 "에어컨 **필터** 교체" vs "**필터**링 조건 변경"처럼 같은 단어가 다른 문맥에서 등장하는 경우가 많아, 모호성 해소 성능이 분류 정확도에 직접적으로 영향을 미친다.

## AI 모델 토크나이저 개선

### 기존: sklearn 기본 토크나이저

```python
# TfidfVectorizer 기본 설정
TfidfVectorizer()  # token_pattern=r"(?u)\b\w\w+\b"
```

공백/특수문자 기준으로 분리만 하므로 "엘리베이터수리"는 하나의 토큰으로 처리된다.

### 변경: Kiwi lemma + 복합명사 토크나이저

```python
from kiwipiepy import Kiwi

_kiwi_instance = None
_NOUN_TAGS = {"NNG", "NNP", "NNB", "NR", "NP"}
_VERB_ADJ_TAGS = {"VV", "VA"}

def _get_kiwi():
    global _kiwi_instance
    if _kiwi_instance is None:
        _kiwi_instance = Kiwi()
    return _kiwi_instance

def kiwi_lemma_compound_tokenizer(text: str) -> list:
    kiwi = _get_kiwi()
    tokens = kiwi.tokenize(text)
    result = []
    noun_buffer = []

    for t in tokens:
        if t.tag in _NOUN_TAGS and len(t.form) > 0:
            noun_buffer.append(t.form)
        else:
            # 연속 명사가 2개 이상이면 복합명사 토큰 추가
            if len(noun_buffer) >= 2:
                result.append("".join(noun_buffer))
            for n in noun_buffer:
                if len(n) > 1:
                    result.append(n)
            noun_buffer = []
            # 동사/형용사는 lemma(원형) 추출
            if t.tag in _VERB_ADJ_TAGS and len(t.form) > 1:
                result.append(t.form)

    # 버퍼 잔여 처리
    if len(noun_buffer) >= 2:
        result.append("".join(noun_buffer))
    for n in noun_buffer:
        if len(n) > 1:
            result.append(n)

    return result
```

**토큰화 예시 (실제 VOC 데이터):**

| VOC 원문 | sklearn 기본 | Kiwi lemma+복합명사 |
|----------|-------------|-------------------|
| 주차장 조명 교체 요청합니다 | `[주차장, 조명, 교체, 요청합니다]` | `[주차장조명, 주차장, 조명, 교체, 요청]` |
| 화장실이 너무 더러워요 | `[화장실이, 너무, 더러워요]` | `[화장실, 더럽다]` |
| 에어컨 필터 청소 부탁드립니다 | `[에어컨, 필터, 청소, 부탁드립니다]` | `[에어컨필터, 에어컨, 필터, 청소, 부탁]` |
| 엘리베이터 버튼 고장 | `[엘리베이터, 버튼, 고장]` | `[엘리베이터버튼, 엘리베이터, 버튼, 고장]` |
| 복도 소화기 점검 바랍니다 | `[복도, 소화기, 점검, 바랍니다]` | `[복도, 소화기, 점검, 바라다]` |

핵심은 **복합명사 자동 생성**이다. 연속된 명사("주차장"+"조명", "에어컨"+"필터")를 결합하여 복합 토큰을 추가 생성한다.

이것이 분류에 미치는 영향을 예시로 보면:
- "주차장 조명 교체" → 복합명사 "주차장조명"이 생성되어 `시설>전기/조명`으로 분류되는 신호가 강화된다
- sklearn 기본으로는 "조명"과 "주차장"이 개별 토큰이므로, "주차장"이 `환경>주차`로 분류를 끌어가는 노이즈가 발생할 수 있다
- 복합명사가 TF-IDF 피처로 학습되면, 개별 단어보다 정확한 분류 신호를 제공한다

### TfidfVectorizer에 적용

```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline

pipeline = Pipeline([
    ("tfidf", TfidfVectorizer(tokenizer=kiwi_lemma_compound_tokenizer)),
    ("clf", LinearSVC())
])
```

sklearn의 `TfidfVectorizer`는 `tokenizer` 파라미터로 커스텀 토크나이저를 받을 수 있다. Kiwi 토크나이저를 주입하면 학습과 추론 모두에서 형태소 분석이 적용된다.

### 교차 검증 결과

5,046건 검수 데이터, 5-fold Stratified CV:

| 분류 항목 | sklearn 기본 | Kiwi lemma+복합명사 | 변화 |
|-----------|-------------|-------------------|------|
| 주제 (대분류>중분류) | 88.6% | **90.6%** | +2.0%p |
| 작업유형 (대분류>중분류) | 85.9% | **86.6%** | +0.7%p |

주제 분류에서 +2.0%p 향상이 두드러진다. 예를 들어 "에어컨수리"와 같은 복합명사가 시설>냉난방/공조 분류에 강한 신호로 작용한 결과다.

## HTML 리포트 키워드 토큰화 개선

### 기존: KoNLPy Komoran

```python
from konlpy.tag import Komoran  # Java(JVM) 필요
komoran = Komoran()
toks = komoran.nouns(text)  # 모든 명사 추출 (의존명사 포함)
```

Komoran의 `nouns()` 메서드는 의존명사(NNB)까지 추출하여, 워드클라우드에 "때문", "것", "수" 같은 무의미한 토큰이 포함되는 문제가 있었다.

### 변경: Kiwi 명사 추출 (NNG, NNP만)

```python
from ai_classifier import _get_kiwi

kiwi = _get_kiwi()
_NOUN_TAGS = {"NNG", "NNP"}  # 일반명사 + 고유명사만

toks = [tok.form for tok in kiwi.tokenize(text) if tok.tag in _NOUN_TAGS]
```

**필터링하는 품사 태그:**

| 태그 | 설명 | 예시 | 추출 여부 |
|------|------|------|----------|
| NNG | 일반명사 | 엘리베이터, 누수, 청소 | O |
| NNP | 고유명사 | 해운대, 삼성 | O |
| NNB | 의존명사 | 때문, 것, 수, 등 | X |
| NR | 수사 | 하나, 둘 | X |
| NP | 대명사 | 저, 우리 | X |

의존명사/수사/대명사를 제외하여 워드클라우드와 키워드 TOP20에 의미 있는 명사만 표시된다.

### 워드클라우드 비교

**Before (Komoran):**

![Komoran 워드클라우드](/assets/images/komoran-wordcloud.jpg)

"달라", "내", "에", "가운데" 같은 불필요한 토큰이 큰 비중을 차지하고 있다. 의존명사와 조사가 필터링되지 않아 실제 VOC 키워드가 묻힌다.

**After (Kiwi):**

![Kiwi 워드클라우드](/assets/images/kiwi-wordcloud.jpg)

"여자화장실", "남자화장실", "지하주차장" 같은 복합명사가 등장하고, 불필요한 토큰이 제거되어 실제 시설 관련 키워드가 명확하게 드러난다.

## AI 모델 vs 키워드 분석의 품사 필터 차이

같은 Kiwi를 사용하지만, 용도에 따라 추출하는 품사 태그가 다르다.

| 용도 | 추출 품사 | 이유 |
|------|----------|------|
| AI 모델 (`ai_classifier.py`) | NNG, NNP, NNB, NR, NP + VV, VA | 분류 신호를 최대한 활용 (의존명사도 문맥 정보 포함) |
| 키워드 분석 (`keyword_analysis.py`) | NNG, NNP | 시각화 목적이므로 의미 있는 명사만 표시 |

AI 모델은 "때문"이나 "것" 같은 의존명사도 분류에 유용한 문맥 정보를 제공할 수 있으므로 폭넓게 추출한다. 반면 키워드 분석은 사람이 보는 워드클라우드/차트이므로 일반명사와 고유명사만 추출하여 가독성을 높인다.

## 정리

| 개선 항목 | 효과 |
|-----------|------|
| AI 모델 Kiwi lemma+복합명사 토크나이저 | 주제 +2.0%p, 작업유형 +0.7%p |
| 리포트 키워드 Kiwi 명사 추출 (NNG, NNP) | 의존명사 제거, 워드클라우드 품질 향상 |
| 토크나이저 통일 | AI 모델과 키워드 분석 모두 Kiwi 사용, 일관된 토큰 품질 |

하나의 형태소 분석기(Kiwi)로 AI 모델 학습과 키워드 분석을 통일하면서, 용도에 맞게 품사 필터를 달리 적용하여 각각의 목적에 최적화했다.
