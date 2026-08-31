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
