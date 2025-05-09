---
title: "[분석환경구축]프라이빗 EC2에 Jupyter 분석환경 구축하기"
excerpt: "ssm 포트포워딩 및 Jupyter 서버환경 설정"
toc: true
toc_sticky: true
categories:
- Infra
- Server
- JupyterNotebook
modified_date: 2025-05-09 09:36:28 +0900
---

## 이 글의 목적 
- 프라이빗 EC2에서 구동하는 JupyterLab 구동 환경 구축


## 1. Pre-requisite (환경 전제 조건)

| 항목 | 설명 |
|------|------|
| 운영체제 | Amazon Linux 2023 (AL2023) |
| EC2 접속 방식 | AWS Systems Manager Session Manager (SSM) |
| EC2 IAM Role | SSM StartSession 권한 포함되어야 함 |
| 외부 접속 방식 | Route53 + ALB or 로컬 포트포워딩 |
| Python 버전 | **3.11 이상** (AL2023 기본 제공됨) |
| 실행 사용자 | `ssm-user` (or 해당 EC2 사용자) |
| 접속 인증 방식 | 비밀번호 로그인 |
| 실행 관리 방식 | `systemd` 서비스로 등록 (자동 실행/복구) |

- EC2 생성 및 보안그룹 설정, ALB 설정은 이 문서에서는 다루지 않음 


## 2. 요구사항 요약

- JupyterLab은 Python 3.11 기반 가상환경에서 실행
- `systemd`로 관리되어 EC2 재부팅 후에도 자동 실행됨
- 비밀번호 설정하여 토큰 URL 필요 없이 비밀번호만으로 Jupyter 노트북 접근함
- ALB 도메인 or 로컬 SSM 포워딩 중 하나 선택 가능
- 운영 / 스테이징 서버 모두 자동화되어 동일하게 구성 가능
- 로컬 접속 시 SSM 포트포워딩 포트는 **스테이징 8888 / 운영 9999**



## 3. JupyterLab 설치 및 실행 자동화 스크립트

### 파일명: `setup_jupyterlab.sh`

```bash
#!/bin/bash
set -e

read -p " 도메인(ALB) 접속용으로 설정하시겠습니까? (y/n): " domain_mode

if [[ "$domain_mode" =~ ^[Yy]$ ]]; then
  JUPYTER_IP="0.0.0.0"
  echo " 외부 접속 허용 (0.0.0.0)"
else
  JUPYTER_IP="127.0.0.1"
  echo " 로컬 전용 접속 (127.0.0.1)"
fi

echo "[1/9] 필수 패키지 설치"
sudo dnf install -y python3.11 python3.11-devel gcc make libpq-devel

echo "[2/9] pip 설치 및 alias 설정"
sudo /usr/bin/python3.11 -m ensurepip
sudo /usr/bin/python3.11 -m pip install --upgrade pip

grep -q 'alias python=' ~/.bashrc || echo 'alias python=python3.11' >> ~/.bashrc
grep -q 'alias pip=' ~/.bashrc || echo 'alias pip=\"python3.11 -m pip\"' >> ~/.bashrc
source ~/.bashrc

echo "[3/9] 가상환경 생성 및 활성화"
rm -rf ~/pyenv
/usr/bin/python3.11 -m venv ~/pyenv
source ~/pyenv/bin/activate

echo "[4/9] 필수 패키지 설치"
pip install --upgrade pip
pip install requests pandas psycopg2-binary jupyterlab
pip install 'notebook<7.0'

echo "[5/9] Jupyter 디렉토리 생성"
mkdir -p ~/jupyter

echo "[6/9] Jupyter 설정 생성 (비밀번호: {PASSWORD})"
mkdir -p ~/.jupyter
HASHED_PASSWORD=$(/home/ssm-user/pyenv/bin/python -c "from notebook.auth import passwd; print(passwd('{PASSWORD}'))")

cat > ~/.jupyter/jupyter_lab_config.py <<EOF2
c = get_config()
c.ServerApp.ip = '${JUPYTER_IP}'
c.ServerApp.port = 8888
c.ServerApp.open_browser = False
c.ServerApp.password = u'''${HASHED_PASSWORD}'''
c.ServerApp.notebook_dir = '/home/ssm-user/jupyter'
c.ServerApp.trust_xheaders = True
c.ServerApp.allow_remote_access = True
EOF2

echo "[7/9] systemd 서비스 등록"
sudo tee /etc/systemd/system/jupyter-lab.service > /dev/null <<EOF3
[Unit]
Description=Jupyter Lab (venv with password)
After=network.target

[Service]
Type=simple
User=ssm-user
ExecStart=/home/ssm-user/pyenv/bin/jupyter-lab --config=/home/ssm-user/.jupyter/jupyter_lab_config.py
WorkingDirectory=/home/ssm-user/jupyter
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF3

echo "[8/9] systemd 서비스 실행"
sudo systemctl daemon-reexec
sudo systemctl daemon-reload
sudo systemctl enable jupyter-lab
sudo systemctl restart jupyter-lab

echo "[9/9] 완료!"
if [[ "$domain_mode" =~ ^[Yy]$ ]]; then
  echo "외부 접속 주소: http://<도메인>:8888 (ALB 연결 시)"
else
  echo "로컬 접속 주소: http://localhost:8888 (SSM 포트포워딩 필요)"
fi
echo "로그인 비밀번호:{PASSWORD}"
```



## 4. SSM 포트포워딩 자동 스크립트
- 로컬에서 SSM을 이용하여 프라이빗 EC2 상의 Jupyter 노트북 접근 시 사용
- pre-requisite : 보안그룹에서 로컬 IP 등록, 로컬 콘솔에 AWS configuration 등록 

### 파일명: `port_forward.sh`

```bash
#!/bin/bash

if [ $# -ne 1 ]; then
  echo "❗ 사용법: $0 [stg|prd]"
  exit 1
fi

ENV="$1"

case "$ENV" in
  stg)
    INSTANCE_ID="i-0c13a4b4e338507e3"
    LOCAL_PORT=8888
    ;;
  prd)
    INSTANCE_ID="i-0952038fead2eb9be"
    LOCAL_PORT=9999
    ;;
  *)
    echo "❌ 잘못된 인자입니다. 사용법: $0 [stg|prd]"
    exit 1
    ;;
esac

REMOTE_PORT=8888

echo "🔌 [$ENV] 환경 ($INSTANCE_ID)에 포트포워딩 연결 중..."
echo "🌐 로컬 접속 주소 → http://localhost:$LOCAL_PORT"
aws ssm start-session \
  --target "$INSTANCE_ID" \
  --document-name "AWS-StartPortForwardingSession" \
  --parameters "{\"portNumber\":[\"$REMOTE_PORT\"],\"localPortNumber\":[\"$LOCAL_PORT\"]}"
```



## 결과

- 로컬에서:
  ```bash
  ./port_forward.sh stg  → http://localhost:8888
  ./port_forward.sh prd  → http://localhost:9999
  ```
- 운영/스테이징 모두 동일한 스크립트로 구성
- 접속 후 비밀번호 `{PASSWORD}` 입력 시 로그인 성공

