---
title: "[문서관리]Colab 노트북파일 html, pdf, 공유링크 생성 자동화"
excerpt: ""
toc: true
toc_sticky: true
categories:
- Python
- Colab
- JupyterNotebook
- Documentation
modified_date: 2025-04-09 09:36:28 +0900
---

## 이 글의 목적 
- POC를 자주하다보면.. Colab에서 노트북 구동 후 그 결과를 소스코드 없이 간단하게 제공해야하는 순간이 온다.
- 그 때마다 보려고 기록함 
- 얻을 수 있는 내용
  - notebook에 쓴 텍스트 목차 넣어서 html 만드는 것
  - notebook에서 그린 큰 그래프 따로 그림파일로 만들어 html에 넣는 것
  - pdf 변환
  - 구글드라이브 다운로드 공유 링크 출력

## Pre-requisite 

```sh
!pip install nbconvert
!pip install jupyter_contrib_nbextensions
```

## 자동화 스크립트 

```python
import base64
from bs4 import BeautifulSoup
import os

# === 사용자 설정 ===
notebook_input = "/content/drive/MyDrive/hdc_csp/nsquare_keyword.ipynb"
html_output_path = "/content/drive/MyDrive/hdc_csp/nsquare_keyword_final.html"
pdf_output_path = "/content/drive/MyDrive/hdc_csp/nsquare_keyword_final.pdf"
image_file_path = "/content/drive/MyDrive/hdc_csp/voc_wordcloud.png" # 꼭 html과 같은 경로에 있어야한다. 
temp_html_path = "/content/drive/MyDrive/hdc_csp/temp.html"

# === 1단계: nbconvert (출력 없이, Google Drive 폴더에 저장) ===
!jupyter nbconvert --to html --no-input "{notebook_input}" --output "{temp_html_path[:-5]}" > /dev/null 2>&1

# === 2단계: temp.html 열기 ===
with open(temp_html_path, "r", encoding="utf-8") as file:
    soup = BeautifulSoup(file, "html.parser")

# === 3단계: 'Output hidden' 텍스트 삭제 ===
for output_hidden in soup.find_all(string=lambda text: isinstance(text, str) and "Output hidden;" in text):
    output_hidden.extract()

# === 4단계: TOC 생성 (h1 > h2 > h3 트리 구조 완성) ===
toc_container = soup.new_tag("div", id="toc")
toc_title_tag = soup.new_tag("strong")
toc_title_tag.string = "📖 목차"
toc_container.append(toc_title_tag)

toc_list = soup.new_tag("ul")
toc_container.append(toc_list)

header_tags = soup.find_all(["h1", "h2", "h3"])

current_h1 = None
current_h2 = None

for idx, header in enumerate(header_tags):
    if not header.has_attr("id"):
        header['id'] = f"toc_{idx}"

    link = soup.new_tag("a", href=f"#{header['id']}")
    link.string = header.get_text()

    list_item = soup.new_tag("li")
    list_item.append(link)

    if header.name == "h1":
        toc_list.append(list_item)
        current_h1 = list_item
        current_h2 = None
    elif header.name == "h2":
        if current_h1 is None:
            toc_list.append(list_item)
        else:
            if not current_h1.find('ul'):
                current_h1.append(soup.new_tag("ul"))
            current_h1.find('ul').append(list_item)
        current_h2 = list_item
    elif header.name == "h3":
        if current_h2 is not None:
            if not current_h2.find('ul'):
                current_h2.append(soup.new_tag("ul"))
            current_h2.find('ul').append(list_item)
        elif current_h1 is not None:
            if not current_h1.find('ul'):
                current_h1.append(soup.new_tag("ul"))
            current_h1.find('ul').append(list_item)
        else:
            toc_list.append(list_item)

style_tag = soup.new_tag("style")
style_tag.string = """
#toc {
    position: fixed;
    top: 20px;
    right: 20px;
    width: 250px;
    background: #f9f9f9;
    border: 1px solid #ddd;
    padding: 10px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 1000;
    font-family: sans-serif;
    font-size: 14px;
}
#toc ul {
    list-style: none;
    padding-left: 0;
}
#toc li {
    margin: 5px 0;
}
#toc li ul {
    padding-left: 15px;
}
#toc li ul li ul {
    padding-left: 15px;
}
#toc a {
    text-decoration: none;
    color: #333;
}
#toc a:hover {
    text-decoration: underline;
}
"""
soup.head.append(style_tag)

if soup.body:
    soup.body.insert(0, toc_container)

# === 5단계: 이미지 base64 삽입 (문서 맨 마지막) ===
with open(image_file_path, "rb") as image_file:
    image_base64 = base64.b64encode(image_file.read()).decode('utf-8')

img_tag = soup.new_tag("img", alt="VOC 워드클라우드",
                       style="max-width: 100%; height: auto; display: block; margin: 20px auto;",
                       src=f"data:image/png;base64,{image_base64}")

if soup.body:
    soup.body.append(img_tag)

# === 6단계: 최종 HTML 저장 ===
with open(html_output_path, "w", encoding="utf-8") as file:
    file.write(str(soup))

print(f"최종 HTML 파일이 저장되었습니다: {html_output_path}")

# === 7단계: 중간 파일 삭제 ===
os.remove(temp_html_path)

# === 8단계: PDF 변환 ===
!apt-get -q install -y wkhtmltopdf > /dev/null
!wkhtmltopdf "{html_output_path}" "{pdf_output_path}" > /dev/null 2>&1

print(f"PDF 파일도 저장되었습니다: {pdf_output_path}")

# === 9단계: 다운로드 링크 생성 ===
from google.colab import files

print("다운로드 링크 (HTML):")
files.download(html_output_path)

print("다운로드 링크 (PDF):")
files.download(pdf_output_path)

# === 10단계: Google Drive 공유 링크 출력 ===
drive_file_id = html_output_path.split('/')[-1]
print(f"Google Drive 공유 링크 (HTML): https://drive.google.com/file/d/{drive_file_id}/view?usp=sharing")

pdf_file_id = pdf_output_path.split('/')[-1]
print(f"Google Drive 공유 링크 (PDF): https://drive.google.com/file/d/{pdf_file_id}/view?usp=sharing")

```
