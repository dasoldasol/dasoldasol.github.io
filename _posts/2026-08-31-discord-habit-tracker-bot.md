---
title: "[Side Project] 나 대신 잔소리하는 봇 만들기 — Discord + Python 습관 트래커"
excerpt: "주 3~4일이 한계였던 기록이 전환 첫 주에 7일이 됐다. 기록이 안 되는 건 게으름이 아니라 마찰이었다. 계정 만들기부터 24시간 무료 서버 배포까지, 코드 249줄로 그대로 따라 할 수 있게 정리했다."
toc: true
toc_sticky: true
classes: wide
categories:
  - Python
  - Discord
modified_date: 2026-08-31 09:00:00 +0900
---

## 왜 만들었나 : "작심삼일의 늪" 매번 3일 만에 무너졌다

### 뭘 기록하려던 거였나

**하루의 몸 상태와 생활 패턴**을 남기고 싶었다. 항목은 이 정도였다.

| 분류 | 항목 |
|---|---|
| 몸 | 컨디션(1~5) · 수면(상/중/하) · 체중 |
| 생활 | 운동(점수 + 종류) · 식사 4끼 · 간식 횟수 |
| 일상 | 지출 · 할 일 · 한 줄 일기 |

**13칸이다.** 하나하나는 3초면 적는다. 다 합쳐도 2분이 안 걸린다.

목적은 "성실하게 살기"가 아니었다. **패턴을 보고 싶었다.**
잠을 못 잔 다음 날 컨디션이 어떤지, 운동을 거른 주에 간식이 늘어나는지 같은 것.
그건 **머리로는 절대 안 보이고, 며칠치 기록이 나란히 있어야만 보인다.**

### 그런데 표가 안 채워졌다

방식은 **HTML 표를 만들어 놓고 매일 손으로 채우는 것**이었다.
날짜별 행을 만들고, 13칸에 값을 적고, 저장하고.

표는 예뻤다. 문제는 **채워지질 않는다**는 것이었다.

```
월  ██████  씀
화  ██████  씀
수  ███░░░  밤에 몰아서. 점심 뭐 먹었는지 기억 안 남
목  ░░░░░░  빈칸
금  ░░░░░░  파일을 안 열었음
토  ░░░░░░  아예 잊음
일  ░░░░░░
```

**2분이면 되는 13칸을 못 채웠다.** 오랫동안 이걸 **의지 문제**로 진단했다.
"이번 주는 진짜 제대로 써야지" 하고 표를 다시 예쁘게 만들고, 또 3일 만에 무너졌다.
몇 달을 반복했다.

그러다 **빠진 날들의 공통점**이 눈에 들어왔다.

> 기록이 끊긴 날은 전부 **노트북을 안 연 날**이었다.

야근한 날, 밖에서 저녁 먹은 날, 주말. 게으른 날이 아니라 **노트북 앞에 없던 날**이다.
기록하려면 ① 노트북을 열고 ② 파일을 찾고 ③ 표를 채워야 하는데,
그 세 단계가 **하루 끝의 피곤한 나에게는 너무 멀었다.**

**게으름이 아니라 마찰이었다.**

### 그래서 도구를 바꿨다

의지를 더 짜내는 대신 **마찰을 없애기로** 했다. 딱 두 가지만.

| | 전 | 후 |
|---|---|---|
| **누가 시작하나** | 내가 기억해서 연다 | **봇이 먼저 물어본다** |
| **어디서 적나** | 노트북 → 파일 → 표 | **폰에서 답장 한 줄** |

결과부터 말하면 — **전환 첫 주에 7일 전부 기록됐다.** 그 전엔 주 3~4일이 한계였다.

의미 있던 변화는 숫자가 아니었다.
**"기록해야지"라고 생각할 일이 없어졌다.** 알림이 오면 답만 하면 되니까.

이 글은 그 봇을 **처음부터 끝까지 따라 만들 수 있게** 정리한 것이다.
Discord 계정 만들기부터 24시간 무료 서버 배포까지, 코드는 249줄이다.

---

## 이 글로 만들 것

**정해진 시각에 봇이 먼저 물어보고, 답장 한 줄이면 기록되는 habit tracker.**

```
07:40  봇: 🌅 아침 뭐 먹었어?
       나: 그릭요거트, 달걀            ← 그냥 답장하면 기록됨

12:30  봇: 🍽️ 점심 뭐 먹었어?
       나: 구내식당

21:00  봇: 📋 하루 정리
            🩺 컨디션 4 · 운동 0.5
            🍽️ 아침 그릭요거트, 달걀
               점심 구내식당
               저녁 — 안 적음
            ⚠️ 빠진 칸 — 저녁, 일기
```

실제 화면은 이렇다.

![아침 알림](/assets/images/habit-bot-alert.png)

컨디션·운동 같은 숫자 항목은 **버튼**으로 누른다. 타이핑이 없다.

![버튼 패널](/assets/images/habit-bot-panel.png)

그리고 밤에 하루를 정리해준다. **빠진 칸까지 알려준다.**

![하루 정리](/assets/images/habit-bot-digest.png)

### 필요한 것

| | |
|---|---|
| 파이썬 | 3.8 이상 (`python3 -V`로 확인) |
| 라이브러리 | `discord.py` 하나. 나머지는 표준 라이브러리 |
| 계정 | Discord — **이메일만, 전화번호 인증 없음** |
| 비용 | **0원** (서버까지 무료 티어로 가능) |
| 시간 | 첫 알림까지 약 20분 |

파이썬 기초(딕셔너리, 함수)만 알면 된다. 비동기(`async`)를 몰라도 복붙으로 돌아간다.

---

## 왜 Discord인가

메신저를 먼저 정해야 한다. 조사한 결과는 이렇다.

| | 예약 발송 | **수신(답장)** | 버튼 UI | 가입 |
|---|---|---|---|---|
| **Discord** | ✅ | ✅ | ✅ | **이메일만** |
| 텔레그램 | ✅ | ✅ | ✅ | 지역에 따라 SMS 인증 요금이 붙는 경우가 있음 |
| 카카오톡 | ✅ | ❌ | — | — |
| 이메일(IMAP) | ✅ | ✅ | ❌ | — |

**카카오톡은 구조적으로 불가능하다.** "나에게 보내기" API는 **송신만** 되고,
개인이 메시지를 **받는 API가 존재하지 않는다**. 양방향 봇을 만들 수 없다.

**텔레그램도 기술적으로는 훌륭하다.** Bot API가 무료고 표준 라이브러리만으로 구현된다.
다만 한국에서 신규 가입 시 일회성 SMS 인증 요금이 붙는 사례가 있다.

**Discord는 전화번호 인증이 아예 없고 버튼 UI를 그대로 쓸 수 있다.**

> 💡 나중에 갈아탈 수 있게 **로직과 메신저 계층을 분리**해두는 걸 권한다.
> 실제로 텔레그램 → Discord로 옮기는 데 하루가 안 걸렸다.

---

## STEP 1 — Discord 준비 (10분)

### 1-1. 서버 만들기

1. [discord.com](https://discord.com) 가입 (이메일만)
2. 왼쪽 사이드바 맨 아래 **`+`** → **`Create My Own`**(직접 만들기)
3. **`For me and my friends`** → 서버 이름 아무거나
4. 만들어지면 안에 **`#general`** 채널이 있다. **이거 그대로 쓰면 된다**

> 템플릿(Gaming, Study Group…)은 쓰지 마라. 안 쓰는 채널이 여러 개 딸려온다.

### 1-2. 봇 만들기

[discord.com/developers/applications](https://discord.com/developers/applications) 접속.

1. 우측 상단 **`New Application`** → 이름 입력 → `Create`
2. 왼쪽 메뉴 **`Bot`**
3. ⚠️ 아래로 스크롤 → **`Privileged Gateway Intents`**
   → **`MESSAGE CONTENT INTENT` 를 켠다** → `Save Changes`
4. 위로 올라가 **`Reset Token`** → 나온 토큰 복사 **(한 번만 보여준다)**

> ### 🚨 가장 흔한 실패 지점
> **`MESSAGE CONTENT INTENT`를 안 켜면 봇이 내 메시지 내용을 못 읽는다.**
> 봇은 온라인인데 아무 반응이 없다면 십중팔구 이것이다.
> 켜고 나서 **`Save Changes`를 눌렀는지**도 확인하자.
>
> 같은 화면에서 **`PUBLIC BOT`은 꺼두는 걸** 권한다. 남이 내 봇을 자기 서버에 넣지 못하게.

### 1-3. 봇을 내 서버에 초대

1. 왼쪽 메뉴 **`OAuth2`** → **`OAuth2 URL Generator`**
2. **SCOPES**: `bot` 체크
3. **BOT PERMISSIONS**: `Send Messages`, `Read Message History` 체크
4. 맨 아래 **`GENERATED URL`** 복사 → 브라우저에서 열기 → 내 서버 선택 → `승인`

### 1-4. 채널 ID 알아내기

Discord 앱에서 **설정 → 고급 → `개발자 모드` 켜기**.
그다음 `#general` 채널을 **우클릭(모바일은 길게 누르기) → `채널 ID 복사`**.

---

## STEP 2 — 코드

### 2-1. 설치

```bash
python3 -m pip install --user "discord.py>=2.3,<3"
```

### 2-2. 전체 코드

`habit_bot.py` 파일 하나다. **249줄이고 이게 전부다.**
아래에서 부분별로 설명하지만, 급하면 [맨 아래 전체 코드](#전체-코드)를 복사해서 바로 돌려도 된다.

#### ① 설정 — 여기만 고치면 내 항목이 된다

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""habit_bot.py — 하루 기록을 대신 물어봐 주는 Discord 봇 (최소 동작본)

실행:  python3 habit_bot.py
필요:  python3 -m pip install --user "discord.py>=2.3,<3"
"""
import json, os, re
from datetime import datetime

import discord
from discord.ext import tasks

TOKEN   = os.environ.get("BOT_TOKEN", "")   # 봇 토큰
CHANNEL = int(os.environ.get("CHANNEL_ID", "0"))
DATA    = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

# 알림 시각 ─ (시각, 슬롯이름, 보낼 메시지)
SLOTS = [
    ("07:40", "아침", "🌅 **아침 뭐 먹었어?**"),
    ("12:30", "점심", "🍽️ **점심 뭐 먹었어?**"),
    ("19:00", "저녁", "🏃 **저녁 뭐 먹었어?** 운동은 버튼으로"),
    ("21:00", "정리", None),          # None = 하루 정리
]
MEALS = ("아침", "점심", "저녁")

HELP = """📖 **쓰는 법 — 3가지**

**① 봇이 물어보면 그냥 답장**
　"점심 뭐 먹었어?" → `구내식당`   (프리픽스 없이)

**② 버튼으로** — 컨디션 · 운동
　🟩 초록 = 지금 선택된 값 / ⬜ 회색 = 선택 안 됨

**③ 앞에 한 단어 붙여서** (아무 때나, 순서 무관)
　`아침 그릭요거트, 달걀`
　`점심 구내식당`
　`저녁 연어구이, 현미밥`
　`컨디션 4`
　`일기 오늘은 괜찮았다`

**고치기 · 지우기**
　`저녁 없음`  — 아무것도 안 붙음 (없어 · 패스 · - 도 됨)
　`아침 삭제`  — 그 칸 비우기

**명령**
　`/도움` 이 화면　`/패널` 버튼 다시 띄우기　`/오늘` 하루 정리 미리보기"""
```

**`SLOTS`가 이 봇의 심장이다.** `(시각, 슬롯이름, 메시지)` 튜플을 넣으면 그 시각에 알림이 간다.
간식을 추가하고 싶으면 한 줄만 넣으면 된다.

```python
SLOTS = [
    ("07:40", "아침", "🌅 **아침 뭐 먹었어?**"),
    ("15:30", "간식", "🍪 **간식 있었어?**"),   # ← 이렇게 추가
    ...
]
```

> 💡 알림 시각은 `07:40`처럼 **애매한 분**으로 두는 걸 권한다.
> 정각은 다른 알림들과 겹쳐서 묻힌다.

#### ② 저장 — DB 없이 JSON 파일

```python
# ─────────────────── 저장 ───────────────────
def today():        return datetime.now().strftime("%Y-%m-%d")
def path(d):        return os.path.join(DATA, d + ".json")

def load(d=None):
    d = d or today()
    try:
        return json.load(open(path(d), encoding="utf-8"))
    except Exception:
        return {"date": d, "컨디션": None, "운동": None,
                "meals": {k: "" for k in MEALS}, "일기": ""}

def save(rec):
    os.makedirs(DATA, exist_ok=True)
    tmp = path(rec["date"]) + ".tmp"
    json.dump(rec, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    os.replace(tmp, path(rec["date"]))       # 원자적 쓰기

STATE = os.path.join(DATA, "_state.json")
def st_load():
    try:    return json.load(open(STATE, encoding="utf-8"))
    except Exception: return {}
def st_save(s):
    os.makedirs(DATA, exist_ok=True)
    json.dump(s, open(STATE, "w", encoding="utf-8"), ensure_ascii=False)
```

**하루에 파일 하나.** DB를 쓸 이유가 없다. 하루치 데이터가 몇 KB고,
텍스트라 문제가 생기면 **눈으로 보고 손으로 고칠 수 있다.**

```json
{
 "date": "2026-08-31",
 "컨디션": 4,
 "운동": 0.5,
 "meals": { "아침": "그릭요거트, 달걀", "점심": "구내식당", "저녁": "" },
 "일기": "괜찮았다"
}
```

`save()`의 **원자적 쓰기**는 꼭 따라 하자. 임시 파일에 쓰고 `os.replace()`로 바꾸면
**쓰는 중에 프로세스가 죽어도 파일이 깨지지 않는다.**

#### ③ 파싱 — 세 가지 입력 방식

```python
# ─────────────────── 텍스트 파싱 ───────────────────
NONE_WORDS = {"없음", "없어", "안먹음", "패스", "-", "x"}

def parse(rec, text, s):
    """반환: 봇이 답할 문자열 (None이면 답 없음)"""
    t = (text or "").strip()
    if not t:
        return None
    head, _, rest = t.partition(" ")

    if head in MEALS and rest:
        if rest.strip().lower() in NONE_WORDS:
            return "🍽️ **%s** — 기록 안 함" % head
        if rest.strip() == "삭제":
            rec["meals"][head] = ""
            return "🗑️ **%s** 비웠어" % head
        cur = rec["meals"][head]
        rec["meals"][head] = (cur + " / " + rest) if cur else rest
        return "🍽️ **%s** ← %s" % (head, rec["meals"][head])

    if head == "일기" and rest:
        rec["일기"] = rest
        return "✍️ 일기 기록"

    if head == "컨디션" and rest:
        m = re.search(r"[1-5]", rest)
        if m:
            rec["컨디션"] = int(m.group())
            return "🩺 컨디션 **%s**" % m.group()

    # 봇이 방금 물어본 슬롯으로
    aw = s.get("awaiting")
    if aw in MEALS:
        s["awaiting"] = None
        if t.lower() in NONE_WORDS:
            return "🍽️ **%s** — 기록 안 함" % aw
        cur = rec["meals"][aw]
        rec["meals"][aw] = (cur + " / " + t) if cur else t
        return "🍽️ **%s** ← %s" % (aw, rec["meals"][aw])
    return "어디에 넣을지 모르겠어. `점심 김치찌개` 처럼 보내줘."
```

입력을 세 갈래로 받는다.

| 방식 | 예시 | 설명 |
|---|---|---|
| **프리픽스** | `점심 구내식당` | 아무 때나, 순서 무관 |
| **열린 슬롯** | (봇이 점심을 물어본 뒤) `구내식당` | 프리픽스 없이 그냥 답장 |
| **없음/삭제** | `저녁 없음` · `아침 삭제` | 특수 처리 |

> ### ⚠️ 반드시 넣어야 하는 것 — 수정과 삭제
> 처음엔 **추가만** 되게 만들었다가 데이터가 오염됐다.
> `"없으면 없음이라고 보내"`라고 안내해놓고 `없음`을 텍스트로 이어붙여서 이렇게 됐다.
>
> ```
> 간식 ← 쿠키 / 고구마 / 없음 / 삭제
> ```
>
> `간식 삭제`라고 쳤더니 "삭제"라는 글자가 또 붙은 것이다.
> **추가만 되고 수정·삭제가 없는 기록 시스템은 반드시 오염된다.**
>
> 그리고 **완전 일치**로 판정해야 한다. 부분 일치로 하면
> `간식 없는데 그냥 물` 같은 정상 입력이 오작동한다.

#### ④ 화면 — 패널과 하루 정리

```python
# ─────────────────── 화면 ───────────────────
def panel_text(rec):
    n = lambda v: "—" if v is None else v
    return ("🩺 **%s 오늘**\n\n컨디션 **%s**   ·   운동 **%s**"
            % (rec["date"][5:], n(rec["컨디션"]), n(rec["운동"])))

def digest(rec):
    n = lambda v: "—" if v is None else v
    L = ["📋 **%s 하루 정리**" % rec["date"], "",
         "🩺 컨디션 %s · 운동 %s" % (n(rec["컨디션"]), n(rec["운동"])), "", "🍽️ **먹은 것**"]
    for k in MEALS:
        L.append("　　%s  %s" % (k, rec["meals"][k] or "*— 안 적음*"))
    miss = [k for k in MEALS if not rec["meals"][k]]
    if rec["컨디션"] is None: miss.append("컨디션")
    if not rec["일기"]:       miss.append("일기")
    L += ["", "⚠️ **빠진 칸** — " + ", ".join(miss)] if miss else ["", "✅ **다 찼어.**"]
    if rec["일기"]:
        L += ["", "✍️ " + rec["일기"]]
    return "\n".join(L)
```

![하루 정리](/assets/images/habit-bot-digest.png)

**`digest()`의 「빠진 칸」이 핵심이다.** 그날 안에 뭘 안 적었는지 알려주면
바로 채우게 된다. 다음 날 아침에 알면 이미 늦다.

#### ⑤ 버튼 — 색이 곧 상태

```python
# ─────────────────── 버튼 ───────────────────
class Btn(discord.ui.Button):
    def __init__(self, label, code, row, style):
        super().__init__(label=label, style=style, row=row, custom_id="h:" + code)
        self.code = code

    async def callback(self, itx):
        rec = load()
        if self.code.startswith("c"):
            rec["컨디션"] = int(self.code[1:])
        elif self.code.startswith("e"):
            rec["운동"] = float(self.code[1:])
        save(rec)
        await itx.response.edit_message(content=panel_text(rec), view=Panel(rec))

class Panel(discord.ui.View):
    def __init__(self, rec=None):
        super().__init__(timeout=None)
        ON, OFF = discord.ButtonStyle.success, discord.ButtonStyle.secondary
        r = rec or {}
        for i in range(1, 6):
            self.add_item(Btn("🩺%d" % i, "c%d" % i, 0,
                              ON if r.get("컨디션") == i else OFF))
        for v in (0, 0.5, 1):
            self.add_item(Btn("🏃%g" % v, "e%g" % v, 1,
                              ON if r.get("운동") == v else OFF))
```

![버튼 색이 곧 상태](/assets/images/habit-bot-panel.png)

**선택된 것만 초록이다.** 컨디션 4, 수면 중, 영양제·배변, 운동 0.5·홈, 커리어 1, 습관 —
지금 상태가 색만 봐도 읽힌다.

> ### 💡 이 글에서 가장 중요한 UX 교훈
> 처음엔 첫 행 버튼을 **전부 파란색**으로 칠했다. 그랬더니
> **컨디션 5개가 전부 선택된 것처럼 보여서**, 눌러도 아무 반응이 없는 것처럼 느껴졌다.
> 실제로는 저장이 잘 되고 있었는데도.
>
> **상태를 텍스트로만 보여주는 건 부족하다.** 특히 모바일에서는 메시지 수정이
> 즉시 다시 그려지지 않는 경우가 있다. **버튼 색 자체가 상태여야** 눌렸다는 확신이 생긴다.
>
> `custom_id`를 고정하고 `client.add_view()`로 등록하는 것도 중요하다.
> **안 하면 봇을 재시작할 때마다 기존 버튼이 죽는다**(`This interaction failed`).

#### ⑥ 봇 본체와 스케줄러

```python
# ─────────────────── 봇 ───────────────────
intents = discord.Intents.default()
intents.message_content = True            # 개발자 포털에서 반드시 켤 것
client = discord.Client(intents=intents)
CH = {"obj": None}

async def say(text, view=None):
    if not CH["obj"]:
        return
    try:
        return await CH["obj"].send(content=text[:1990], view=view) if view \
            else await CH["obj"].send(content=text[:1990])
    except Exception as e:
        print("전송 실패:", e, flush=True)

@client.event
async def on_ready():
    CH["obj"] = client.get_channel(CHANNEL)
    client.add_view(Panel())              # 재시작해도 버튼이 살아나게
    print("로그인:", client.user, "· 채널", CH["obj"], flush=True)
    await say("🤖 기록 봇 켜졌어.  `/도움`")
    if not scheduler.is_running():
        scheduler.start()

@client.event
async def on_message(msg):
    if msg.author.bot or not CH["obj"] or msg.channel.id != CH["obj"].id:
        return
    rec, s = load(), st_load()
    t = msg.content.strip()

    if t in ("/도움", "/help"):
        return await say(HELP)
    if t in ("/패널", "/panel"):
        return await say(panel_text(rec), Panel(rec))
    if t in ("/오늘", "/정리"):
        return await say(digest(rec), Panel(rec))

    out = parse(rec, t, s)
    save(rec); st_save(s)
    if out:
        await say(out)

@tasks.loop(seconds=30)
async def scheduler():
    if not client.is_ready() or client.is_closed():
        return                                    # 연결 없으면 슬롯을 소비하지 않는다
    s = st_load()
    sent = s.setdefault("sent", {})
    if s.get("date") != today():
        s["date"] = today(); sent.clear()
    now = datetime.now()
    due = []
    for hhmm, name, text in SLOTS:
        if sent.get(name):
            continue
        h, m = map(int, hhmm.split(":"))
        t0 = now.replace(hour=h, minute=m, second=0, microsecond=0)
        if now < t0:
            continue
        if (now - t0).total_seconds() > 3 * 3600:  # 3시간 넘게 지난 건 스킵
            sent[name] = "skip"; continue
        sent[name] = now.strftime("%H:%M")
        due.append((name, text))
    st_save(s)                                     # ★ 발송 '전에' 저장
    for name, text in due:
        rec = load()
        print("슬롯 발사:", name, flush=True)
        if name == "정리":
            await say(digest(rec), Panel(rec))
            s["awaiting"] = None
        else:
            if name == "아침":
                await say(panel_text(rec), Panel(rec))
            await say(text)
            s["awaiting"] = name
        st_save(s)

@scheduler.before_loop
async def _w():
    await client.wait_until_ready()

if __name__ == "__main__":
    if not TOKEN:
        raise SystemExit("BOT_TOKEN 환경변수가 비어 있어.")
    client.run(TOKEN)
```

> ### ⚠️ 스케줄러에서 꼭 지켜야 할 두 가지
>
> **① 연결이 없으면 슬롯을 소비하지 않는다**
>
> ```python
> if not client.is_ready() or client.is_closed():
>     return
> ```
>
> 이게 없으면 네트워크가 끊긴 동안 슬롯이 "발사됨"으로 처리되어 **알림이 영구 누락**된다.
>
> **② "보냈음" 표시를 발송 *전에* 저장한다**
>
> ```python
> st_save(s)          # ★ 발송 전에 먼저
> for name, text in due:
>     await say(...)  # 여기서 실패해도 재발사되지 않는다
> ```
>
> 순서가 반대면 **전송 실패가 곧 무한 루프**가 된다. 실제로 겪었다 —
> 노트북이 절전에서 깨어난 직후 WiFi가 붙기 전에 슬롯이 발사되면서
> **같은 알림이 30초마다 17번** 갔다.
>
> 원인이 하나 더 있었다. `say()`가 `discord.HTTPException`만 잡고 있었는데
> 네트워크 예외는 `aiohttp.ClientConnectorError`라서 그냥 터져 나갔다.
> **`except Exception`으로 넓게 잡아야 한다.**

### 2-3. 실행

```bash
export BOT_TOKEN="여기에_봇_토큰"
export CHANNEL_ID="여기에_채널_ID"
python3 habit_bot.py
```

Discord 채널에 **`🤖 기록 봇 켜졌어.`** 가 오면 성공이다.

폰에 Discord 앱을 깔면 예약 시각에 **푸시 알림**이 온다.

![아침 알림](/assets/images/habit-bot-alert.png)

> ### 📱 안드로이드에서 알림이 안 온다면
> 두 가지를 확인하자. One UI(삼성) 등은 기본 설정으로 두면 알림이 지연된다.
> 1. **설정 → 배터리 → 앱별 배터리 관리 → Discord → "제한 없음"**
> 2. **Discord → 서버 길게 누르기 → 알림 → "모든 메시지"**
>
> 더 확실하게 하려면 **예약 메시지에 자기 자신을 `@멘션`** 하면 된다.
> 멘션은 알림 설정과 무관하게 항상 푸시된다.
>
> ```python
> MY_ID = 123456789012345678          # 내 유저 ID
> await say("<@%d> %s" % (MY_ID, text))
> ```

### 2-4. `/도움` — 사용법을 봇 안에 넣어두기

만들고 나서 **제일 먼저 까먹는 게 "내가 뭘 칠 수 있더라?"** 다.
직접 만든 봇인데도 며칠 지나면 프리픽스가 기억 안 난다.

그래서 **사용법을 봇 안에 넣어뒀다.** `/도움`을 치면 이게 온다.

![도움말 — 입력 방식](/assets/images/habit-bot-help.png)

![도움말 — 명령 목록](/assets/images/habit-bot-commands.png)

> 위 화면은 이 글의 예제 봇이 아니라 **실제로 쓰고 있는 봇**의 도움말이다.
> 기능이 늘면서 도움말도 같이 자랐다. 예제 코드의 `HELP`는 이보다 짧다.

코드는 `HELP` 상수 하나와 분기 세 줄이 전부다.

```python
if t in ("/도움", "/help"):
    return await say(HELP)
if t in ("/패널", "/panel"):
    return await say(panel_text(rec), Panel(rec))
if t in ("/오늘", "/정리"):
    return await say(digest(rec), Panel(rec))
```

> ### 💡 도움말은 기능이 아니라 **인터페이스의 일부**다
> 봇은 화면이 없다. 버튼은 눈에 보이지만 **"어떤 텍스트를 칠 수 있는지"는 아무 데도 안 보인다.**
> 사용법을 노션이나 README에 적어두면 절대 안 본다. **봇 안에 있어야 본다.**
>
> 기능을 추가할 때마다 `HELP`도 같이 고치자. 이게 밀리면
> **자기가 만든 기능을 자기가 안 쓰게 된다.** (실제로 `/도움`에 안 적어둔 명령을
> 며칠 뒤 까맣게 잊고 있었다.)

---

## STEP 3 — 24시간 돌리기

노트북에서 돌리면 **덮으면 멈춘다.** 세 가지 선택지가 있다.

| | 비용 | 항상 켜짐 | 난이도 |
|---|---|---|---|
| 노트북 (뚜껑 열고 충전) | 0원 | ⚠️ 종료하면 끊김 | 쉬움 |
| **GCP 무료 티어** | **0원** | ✅ | 보통 |
| 유료 VPS | 월 4~7천원 | ✅ | 쉬움 |

### 노트북에서 버티기 (macOS)

```bash
sudo pmset -c sleep 0          # 충전 중엔 시스템 잠자기 끔
sudo pmset -c displaysleep 5   # 화면만 5분 뒤 꺼짐
```

> ### 🚨 Apple Silicon 함정
> **`disablesleep`(뚜껑 닫아도 안 자게)은 Apple Silicon에서 지원되지 않는다.**
> 그런데 **에러도 안 나고 조용히 무시된다.**
>
> ```bash
> $ pmset -g cap
> Capabilities for AC Power:
>  displaysleep      ← 있음
>  sleep             ← 있음
>                    ← disablesleep 이 목록에 없다
> ```
>
> **지원되는 키인지 `pmset -g cap`으로 먼저 확인하고,
> 적용됐는지 `pmset -g custom`으로 다시 확인**해야 한다.
> 결론적으로 **뚜껑을 닫으면 무조건 잔다.** 열어두면 `sleep 0`으로 계속 깨어 있다.

또 하나. **코드를 클라우드 동기화 폴더(iCloud/OneDrive 등)에 두지 마라.**
`launchd`로 자동 실행하면 이 에러가 난다.

```
[Errno 1] Operation not permitted
```

macOS가 보호하는 경로라 백그라운드 서비스는 접근할 수 없다.
게다가 **동기화 폴더는 하루에 수십 번 쓰는 파일에 안 맞고**,
설정 파일에 든 **토큰이 클라우드로 올라간다.**

### GCP 무료 티어 (권장)

**Always Free e2-micro**를 쓰면 영구 무료다. **조건 3개**를 정확히 맞춰야 한다.

| 항목 | 값 | 주의 |
|---|---|---|
| **리전** | `us-west1` / `us-central1` / `us-east1` | 이 셋 외에는 과금 |
| **머신 유형** | `e2-micro` **1대만** | `e2-small`은 과금 |
| **부팅 디스크** | **표준 영구 디스크** 30GB | ⚠️ **기본값이 유료다** |

**제일 많이 틀리는 게 디스크다.** 콘솔에서 `부팅 디스크 → 변경`을 눌러야 나오고,
기본값이 **"균형 있는(balanced)"** 으로 되어 있는데 그건 과금된다.
제대로 바꾸면 견적에 이렇게 뜬다.

```
30GB 표준 영구 디스크        US$0.00     ← 이렇게 나와야 함
```

> **참고** — GCP 견적기는 인스턴스의 Always Free를 반영하지 못해서
> `vCPU 2개 + 1GB 메모리 US$6.11`이 계속 표시된다. 디스크는 $0.00으로 반영되는데
> 인스턴스는 안 된다. **조건만 맞으면 실제 청구는 $0이다.**
>
> 그리고 무료 체험판(90일)이 끝나면 **"정식 계정으로 업그레이드"를 눌러야**
> Always Free가 유지된다. 안 누르면 30일 뒤 VM이 삭제된다.
> 업그레이드해도 무료 한도 안이면 청구는 $0이다.

### 서버에 올리기

```bash
# 1) 서버에서 — 시간대부터!
sudo timedatectl set-timezone Asia/Seoul
sudo apt update && sudo apt install -y python3-pip
python3 -m pip install --user "discord.py>=2.3,<3"
mkdir -p ~/habitbot/data

# 2) 로컬에서 — 코드 업로드
scp habit_bot.py <서버주소>:~/habitbot/
```

> ### ⏰ 시간대를 꼭 먼저 바꿔라
> 클라우드 VM은 기본이 **UTC**다. 안 바꾸면 **알림이 9시간 밀린다.**
> `date` 명령으로 `KST`가 뜨는지 확인하자.

### systemd 등록

`/etc/systemd/system/habitbot.service`:

```ini
[Unit]
Description=Habit Tracker Discord Bot
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=<사용자명>
WorkingDirectory=/home/<사용자명>/habitbot
ExecStart=/usr/bin/python3 /home/<사용자명>/habitbot/habit_bot.py

Restart=always
RestartSec=10

Environment=BOT_TOKEN=<봇_토큰>
Environment=CHANNEL_ID=<채널_ID>
Environment=PYTHONUNBUFFERED=1
Environment=TZ=Asia/Seoul

StandardOutput=append:/home/<사용자명>/habitbot/bot.log
StandardError=append:/home/<사용자명>/habitbot/bot.log

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now habitbot
```

- `Restart=always` → 죽어도 10초 뒤 자동으로 살아난다
- `enable` → **서버 재부팅 후에도 자동 시작**

> ⚠️ **로컬 봇을 반드시 끄자.** 두 곳에서 동시에 돌면 **알림이 두 번 온다.**

---

## 확인하는 법

### 살아 있나

```bash
systemctl is-active habitbot      # active
systemctl is-enabled habitbot     # enabled  ← 재부팅해도 자동 시작
```

### 로그

```bash
tail -f ~/habitbot/bot.log
```

정상이면 이렇게 찍힌다.

```
로그인: 내봇#0000 · 채널 general
슬롯 발사: 아침
슬롯 발사: 점심
```

### 시간대 (제일 자주 틀린다)

```bash
date "+%Y-%m-%d %H:%M %Z"
# 2026-08-31 10:39 KST     ← UTC면 알림이 9시간 밀린다
```

### 데이터

```bash
cat ~/habitbot/data/2026-08-31.json
```

---

## 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| 봇은 온라인인데 **내 말에 반응 없음** | `MESSAGE CONTENT INTENT` 꺼짐 | 개발자 포털에서 켜고 `Save Changes` |
| 채널에 봇이 안 보임 | 초대 안 됨 | OAuth2 URL로 다시 초대 |
| 로그에 **`채널 미설정`** | `CHANNEL_ID` 틀림 / 권한 없음 | 개발자 모드로 ID 재확인, `Send Messages` 권한 확인 |
| **알림이 9시간 밀림** | 서버 시간대가 UTC | `timedatectl set-timezone Asia/Seoul` |
| **같은 알림이 반복** | 상태 저장이 발송 뒤에 있음 | 발송 **전에** `st_save()` |
| 버튼이 `This interaction failed` | 재시작으로 View가 죽음 | `custom_id` 고정 + `add_view()` |
| **알림이 두 번 옴** | 봇이 두 곳에서 실행 중 | 로컬 봇 종료 |
| 폰에 푸시가 안 옴 | 배터리 최적화 / 알림 설정 | 위 「안드로이드」 박스 참고 |
| `LoginFailure` | 토큰 오류 | `Reset Token`으로 재발급 |

---

## 내 항목으로 바꾸기

이 봇의 항목(컨디션·운동·식사)은 예시일 뿐이다. **세 군데만 고치면 된다.**

**① 알림 시각과 질문** — `SLOTS`

```python
SLOTS = [
    ("07:00", "물", "💧 **물 마셨어?**"),
    ("22:00", "독서", "📖 **오늘 몇 쪽 읽었어?**"),
    ("22:30", "정리", None),
]
```

**② 저장할 항목** — `load()`의 기본 딕셔너리

```python
return {"date": d, "물잔": None, "독서쪽수": None, "meals": {}, "일기": ""}
```

**③ 파싱 규칙** — `parse()`에 프리픽스 추가

```python
if head == "독서" and rest:
    m = re.search(r"\d+", rest)
    if m:
        rec["독서쪽수"] = int(m.group())
        return "📖 **%s쪽** 기록" % m.group()
```

버튼을 추가하려면 `Panel`에 `Btn`을 넣고 `callback`에서 해당 키를 채우면 된다.

### 더 붙이면 좋은 것들

실제로 쓰면서 추가한 기능들이다. 있으면 확실히 편하다.

| 기능 | 왜 필요한가 |
|---|---|
| **지난 날짜 채우기** | 하루 놓쳤을 때. `어제 저녁 김치찌개` 또는 `/날짜 어제` |
| **따라잡기(catch-up)** | 아래 박스 참고 |
| **주간 표 출력** | 주간 회고를 자동화 |
| **백업 명령** | 데이터를 zip으로 채널에 올려두면 서버가 날아가도 복구된다 |

> ### 💡 따라잡기(catch-up)가 필요한 이유
> **Discord Gateway는 봇이 꺼진 동안 온 메시지를 재전송해주지 않는다.**
> (텔레그램 `getUpdates`가 24시간 큐에 쌓아주는 것과 다르다.)
> 채널에 글은 남아 있지만 `on_message`가 호출되지 않는다.
>
> 그래서 켜질 때 채널 히스토리를 직접 읽어서 메운다.
>
> ```python
> pending = [m async for m in channel.history(
>     limit=300, after=discord.Object(id=int(last_id)), oldest_first=True)
>     if not m.author.bot]
>
> for m in pending:
>     # ★ 메시지가 '보내진 시각'의 날짜에 기록한다
>     d = m.created_at.astimezone().strftime("%Y-%m-%d")
>     rec = load(d)
>     parse(rec, m.content, state)
>     save(rec)
> ```
>
> 토요일에 보낸 메시지는 월요일에 처리되더라도 **토요일 파일**로 들어간다.
> `on_ready`뿐 아니라 **`on_resumed`에도 붙여야 한다** — 절전에서 깨어날 때
> 세션이 '재개'만 되면 `on_ready`가 안 뜬다.

> ### ⚠️ 지난 날짜 모드의 안전장치
> `/날짜 어제`처럼 날짜를 고정하는 기능을 만든다면 **반드시 넣어야 하는 것들**이 있다.
> 고정을 걸어놓고 잊으면 **그 뒤 모든 기록이 엉뚱한 날로 들어간다.**
>
> 1. 고정 중일 때 **모든 답장에 배너**를 붙인다 (`📅 8/27에 기록 중`)
> 2. **예약 알림이 오면 자동 해제**한다
> 3. 예약 알림 자체는 **언제나 오늘 기준**으로 기록한다
> 4. **미래 날짜는 거부**한다

---

## 실제로 써보니

전환 첫 주에 **7일 전부 기록**됐다. 그 전에는 주 3~4일이 한계였다.

숫자보다 의미 있던 변화는 이거다 —
**"기록해야지"라고 생각할 필요가 없어졌다.** 알림이 오면 답만 하면 된다.

그리고 데이터가 쌓이니 **항목 사이의 관계**가 보였다.
예를 들어 운동 점수가 0인 날에 다른 지표들도 같이 무너지는 패턴 같은 것.
**손으로 적을 땐 빈 날이 많아서 절대 안 보이던 것**이다.

### 코드 밖에서 배운 것

1. **기록의 적은 게으름이 아니라 마찰이다.** 도구를 손에 맞추면 습관은 따라온다
2. **추가만 되는 기록 시스템은 반드시 오염된다.** 수정·삭제를 처음부터 넣어라
3. **상태 저장은 부수효과보다 먼저.** 전송 실패가 무한 루프가 되지 않으려면
4. **조용히 실패하는 것들을 의심하라** — `pmset`의 미지원 키, `str.replace`의 no-op
5. **로직과 전달 계층을 분리하면** 메신저를 갈아타는 데 하루가 안 걸린다

---

## 전체 코드

`habit_bot.py` — 그대로 복사해서 쓰면 된다.

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""habit_bot.py — 하루 기록을 대신 물어봐 주는 Discord 봇 (최소 동작본)

실행:  python3 habit_bot.py
필요:  python3 -m pip install --user "discord.py>=2.3,<3"
"""
import json, os, re
from datetime import datetime

import discord
from discord.ext import tasks

TOKEN   = os.environ.get("BOT_TOKEN", "")   # 봇 토큰
CHANNEL = int(os.environ.get("CHANNEL_ID", "0"))
DATA    = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

# 알림 시각 ─ (시각, 슬롯이름, 보낼 메시지)
SLOTS = [
    ("07:40", "아침", "🌅 **아침 뭐 먹었어?**"),
    ("12:30", "점심", "🍽️ **점심 뭐 먹었어?**"),
    ("19:00", "저녁", "🏃 **저녁 뭐 먹었어?** 운동은 버튼으로"),
    ("21:00", "정리", None),          # None = 하루 정리
]
MEALS = ("아침", "점심", "저녁")

HELP = """📖 **쓰는 법 — 3가지**

**① 봇이 물어보면 그냥 답장**
　"점심 뭐 먹었어?" → `구내식당`   (프리픽스 없이)

**② 버튼으로** — 컨디션 · 운동
　🟩 초록 = 지금 선택된 값 / ⬜ 회색 = 선택 안 됨

**③ 앞에 한 단어 붙여서** (아무 때나, 순서 무관)
　`아침 그릭요거트, 달걀`
　`점심 구내식당`
　`저녁 연어구이, 현미밥`
　`컨디션 4`
　`일기 오늘은 괜찮았다`

**고치기 · 지우기**
　`저녁 없음`  — 아무것도 안 붙음 (없어 · 패스 · - 도 됨)
　`아침 삭제`  — 그 칸 비우기

**명령**
　`/도움` 이 화면　`/패널` 버튼 다시 띄우기　`/오늘` 하루 정리 미리보기"""

# ─────────────────── 저장 ───────────────────
def today():        return datetime.now().strftime("%Y-%m-%d")
def path(d):        return os.path.join(DATA, d + ".json")

def load(d=None):
    d = d or today()
    try:
        return json.load(open(path(d), encoding="utf-8"))
    except Exception:
        return {"date": d, "컨디션": None, "운동": None,
                "meals": {k: "" for k in MEALS}, "일기": ""}

def save(rec):
    os.makedirs(DATA, exist_ok=True)
    tmp = path(rec["date"]) + ".tmp"
    json.dump(rec, open(tmp, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    os.replace(tmp, path(rec["date"]))       # 원자적 쓰기

STATE = os.path.join(DATA, "_state.json")
def st_load():
    try:    return json.load(open(STATE, encoding="utf-8"))
    except Exception: return {}
def st_save(s):
    os.makedirs(DATA, exist_ok=True)
    json.dump(s, open(STATE, "w", encoding="utf-8"), ensure_ascii=False)

# ─────────────────── 텍스트 파싱 ───────────────────
NONE_WORDS = {"없음", "없어", "안먹음", "패스", "-", "x"}

def parse(rec, text, s):
    """반환: 봇이 답할 문자열 (None이면 답 없음)"""
    t = (text or "").strip()
    if not t:
        return None
    head, _, rest = t.partition(" ")

    if head in MEALS and rest:
        if rest.strip().lower() in NONE_WORDS:
            return "🍽️ **%s** — 기록 안 함" % head
        if rest.strip() == "삭제":
            rec["meals"][head] = ""
            return "🗑️ **%s** 비웠어" % head
        cur = rec["meals"][head]
        rec["meals"][head] = (cur + " / " + rest) if cur else rest
        return "🍽️ **%s** ← %s" % (head, rec["meals"][head])

    if head == "일기" and rest:
        rec["일기"] = rest
        return "✍️ 일기 기록"

    if head == "컨디션" and rest:
        m = re.search(r"[1-5]", rest)
        if m:
            rec["컨디션"] = int(m.group())
            return "🩺 컨디션 **%s**" % m.group()

    # 봇이 방금 물어본 슬롯으로
    aw = s.get("awaiting")
    if aw in MEALS:
        s["awaiting"] = None
        if t.lower() in NONE_WORDS:
            return "🍽️ **%s** — 기록 안 함" % aw
        cur = rec["meals"][aw]
        rec["meals"][aw] = (cur + " / " + t) if cur else t
        return "🍽️ **%s** ← %s" % (aw, rec["meals"][aw])
    return "어디에 넣을지 모르겠어. `점심 김치찌개` 처럼 보내줘."

# ─────────────────── 화면 ───────────────────
def panel_text(rec):
    n = lambda v: "—" if v is None else v
    return ("🩺 **%s 오늘**\n\n컨디션 **%s**   ·   운동 **%s**"
            % (rec["date"][5:], n(rec["컨디션"]), n(rec["운동"])))

def digest(rec):
    n = lambda v: "—" if v is None else v
    L = ["📋 **%s 하루 정리**" % rec["date"], "",
         "🩺 컨디션 %s · 운동 %s" % (n(rec["컨디션"]), n(rec["운동"])), "", "🍽️ **먹은 것**"]
    for k in MEALS:
        L.append("　　%s  %s" % (k, rec["meals"][k] or "*— 안 적음*"))
    miss = [k for k in MEALS if not rec["meals"][k]]
    if rec["컨디션"] is None: miss.append("컨디션")
    if not rec["일기"]:       miss.append("일기")
    L += ["", "⚠️ **빠진 칸** — " + ", ".join(miss)] if miss else ["", "✅ **다 찼어.**"]
    if rec["일기"]:
        L += ["", "✍️ " + rec["일기"]]
    return "\n".join(L)

# ─────────────────── 버튼 ───────────────────
class Btn(discord.ui.Button):
    def __init__(self, label, code, row, style):
        super().__init__(label=label, style=style, row=row, custom_id="h:" + code)
        self.code = code

    async def callback(self, itx):
        rec = load()
        if self.code.startswith("c"):
            rec["컨디션"] = int(self.code[1:])
        elif self.code.startswith("e"):
            rec["운동"] = float(self.code[1:])
        save(rec)
        await itx.response.edit_message(content=panel_text(rec), view=Panel(rec))

class Panel(discord.ui.View):
    def __init__(self, rec=None):
        super().__init__(timeout=None)
        ON, OFF = discord.ButtonStyle.success, discord.ButtonStyle.secondary
        r = rec or {}
        for i in range(1, 6):
            self.add_item(Btn("🩺%d" % i, "c%d" % i, 0,
                              ON if r.get("컨디션") == i else OFF))
        for v in (0, 0.5, 1):
            self.add_item(Btn("🏃%g" % v, "e%g" % v, 1,
                              ON if r.get("운동") == v else OFF))

# ─────────────────── 봇 ───────────────────
intents = discord.Intents.default()
intents.message_content = True            # 개발자 포털에서 반드시 켤 것
client = discord.Client(intents=intents)
CH = {"obj": None}

async def say(text, view=None):
    if not CH["obj"]:
        return
    try:
        return await CH["obj"].send(content=text[:1990], view=view) if view \
            else await CH["obj"].send(content=text[:1990])
    except Exception as e:
        print("전송 실패:", e, flush=True)

@client.event
async def on_ready():
    CH["obj"] = client.get_channel(CHANNEL)
    client.add_view(Panel())              # 재시작해도 버튼이 살아나게
    print("로그인:", client.user, "· 채널", CH["obj"], flush=True)
    await say("🤖 기록 봇 켜졌어.  `/도움`")
    if not scheduler.is_running():
        scheduler.start()

@client.event
async def on_message(msg):
    if msg.author.bot or not CH["obj"] or msg.channel.id != CH["obj"].id:
        return
    rec, s = load(), st_load()
    t = msg.content.strip()

    if t in ("/도움", "/help"):
        return await say(HELP)
    if t in ("/패널", "/panel"):
        return await say(panel_text(rec), Panel(rec))
    if t in ("/오늘", "/정리"):
        return await say(digest(rec), Panel(rec))

    out = parse(rec, t, s)
    save(rec); st_save(s)
    if out:
        await say(out)

@tasks.loop(seconds=30)
async def scheduler():
    if not client.is_ready() or client.is_closed():
        return                                    # 연결 없으면 슬롯을 소비하지 않는다
    s = st_load()
    sent = s.setdefault("sent", {})
    if s.get("date") != today():
        s["date"] = today(); sent.clear()
    now = datetime.now()
    due = []
    for hhmm, name, text in SLOTS:
        if sent.get(name):
            continue
        h, m = map(int, hhmm.split(":"))
        t0 = now.replace(hour=h, minute=m, second=0, microsecond=0)
        if now < t0:
            continue
        if (now - t0).total_seconds() > 3 * 3600:  # 3시간 넘게 지난 건 스킵
            sent[name] = "skip"; continue
        sent[name] = now.strftime("%H:%M")
        due.append((name, text))
    st_save(s)                                     # ★ 발송 '전에' 저장
    for name, text in due:
        rec = load()
        print("슬롯 발사:", name, flush=True)
        if name == "정리":
            await say(digest(rec), Panel(rec))
            s["awaiting"] = None
        else:
            if name == "아침":
                await say(panel_text(rec), Panel(rec))
            await say(text)
            s["awaiting"] = name
        st_save(s)

@scheduler.before_loop
async def _w():
    await client.wait_until_ready()

if __name__ == "__main__":
    if not TOKEN:
        raise SystemExit("BOT_TOKEN 환경변수가 비어 있어.")
    client.run(TOKEN)
```

```bash
python3 -m pip install --user "discord.py>=2.3,<3"
export BOT_TOKEN="..." CHANNEL_ID="..."
python3 habit_bot.py
```
