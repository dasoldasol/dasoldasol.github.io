# dasolseo.github.io
welcome to dasol seo blog

## 로컬 개발 환경

### 사전 요구사항
- Ruby 2.5 이상
- Bundler (`gem install bundler`)

### 실행 방법
```bash
bundle install                  # 의존성 설치
bundle exec jekyll serve        # 로컬 서버 실행 (http://localhost:4000)
bundle exec jekyll build        # 정적 사이트 빌드
```

## 프로젝트 구조

| 디렉토리/파일 | 설명 |
|--------------|------|
| `_posts/` | 블로그 포스트 (YYYY-MM-DD-slug.md 형식) |
| `_pages/` | 정적 페이지 (about, projects 등) |
| `_layouts/` | 페이지 템플릿 |
| `_includes/` | 재사용 가능한 컴포넌트 |
| `assets/` | 이미지, CSS, JS 파일 |
| `_config.yml` | Jekyll 설정 파일 |

## 자주 발생하는 문제

| 문제 | 해결 방법 |
|------|----------|
| `jekyll` 명령어 오류 | `bundle exec jekyll serve` 사용 |
| 포스트가 안 보임 | 파일명이 `YYYY-MM-DD-` 형식인지 확인 |
| Front matter 오류 | YAML 문법 확인 (들여쓰기, 콜론 뒤 공백) |
| 한글 깨짐 | 파일 인코딩 UTF-8 확인 |

## 기여 워크플로우

1. 브랜치 생성: `git checkout -b feature/설명`
2. 변경 후 확인: `git diff`
3. 커밋: `git commit -m "간결한 메시지"`
4. 푸시: `git push origin 브랜치명`
5. GitHub에서 PR 생성 (base: master)
