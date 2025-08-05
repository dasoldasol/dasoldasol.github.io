---
title: "[서버보안]Amazon Linux 2 보안 설정 가이드"
excerpt : "리눅스 서버 보안취약점 개선"
toc: true
toc_sticky: true
categories:
  - AWS
  - 보안
  - 서버
modified_date: 2025-08-05 09:36:28 +0900
---

# Amazon Linux 서버 보안 설정 적용 스크립트 (서비스 영향도: 하/중)

Amazon Linux 서버를 운영하면서 기본적인 보안 설정을 적용하지 않으면 다양한 보안 취약점에 노출될 수 있다.  
본 포스트에서는 서비스 영향도 '하' 및 '중' 수준에서 적용 가능한 보안 스크립트들을 정리하고, 각 항목이 해결하는 취약점과 명령어를 함께 설명한다.

---

## 서비스 영향도: 하

### [U-02] 패스워드 복잡성 설정
- **해결되는 취약점**: 단순한 비밀번호로 인한 계정 탈취 위험
- **스크립트 내용**
```bash
sudo chmod o+w /etc/pam.d/system-auth
sudo cp /etc/pam.d/system-auth /etc/pam.d/system-auth.backup
echo "password    requisite     pam_cracklib.so retry=3 minlen=8 lcredit=-1 ucredit=-1 dcredit=-1 ocredit=-1 minlen=8" >> /etc/pam.d/system-auth
sudo chmod o-w /etc/pam.d/system-auth
```

---

### [U-03] 계정 잠금 임계값 설정
- **해결되는 취약점**: 무차별 대입 공격 방지
```bash
sudo chmod o+w /etc/pam.d/system-auth
echo "auth        required pam_tally2.so deny=5 unlock_time=1800 no_magic_root" >> /etc/pam.d/system-auth
echo "account     required pam_tally2.so no_magic_root reset" >> /etc/pam.d/system-auth
sudo chmod o-w /etc/pam.d/system-auth
```

---

### [U-46] 패스워드 최소 길이 설정
- **해결되는 취약점**: 짧은 비밀번호로 인한 사전공격 위험
```bash
sudo chmod o+w /etc/login.defs
sudo cp /etc/login.defs /etc/login.defs.backup
sed -i 's/PASS_MIN_LEN\t5/PASS_MIN_LEN\t8/g' /etc/login.defs
sudo chmod o-w /etc/login.defs
```

---

### [U-54] Session Timeout 설정
- **해결되는 취약점**: 방치된 세션으로 인한 권한 오용
```bash
sudo chmod o+w /etc/profile
sudo cp /etc/profile /etc/profile.backup
echo "export TMOUT=600" >> /etc/profile
sudo chmod o-w /etc/profile
```

---

### [U-68] 로그온 시 경고 메시지 제공
- **해결되는 취약점**: 무단 접근에 대한 법적 고지 제공
```bash
sudo cp /etc/motd /etc/motd.backup
echo "경고: 이 시스템은 승인된 사용자만 사용할 수 있습니다..." >> /etc/motd
```

---

### [U-58] 홈디렉토리 존재 및 권한 관리
- **해결되는 취약점**: 잘못된 홈디렉토리 권한으로 인한 데이터 유출 방지
```bash
sudo mkdir /var/lib/rngd
sudo chown rngd /var/lib/rngd
sudo chgrp rngd /var/lib/rngd
sudo mkdir /home/ec2-instance-connect
sudo chown ec2-instance-connect /home/ec2-instance-connect
sudo chgrp ec2-instance-connect /home/ec2-instance-connect
```

---

## low 설정 이후 백업파일 정리
```bash
sudo rm /etc/pam.d/system-auth.backup
sudo rm /etc/login.defs.backup
sudo rm /etc/profile.backup
sudo rm /etc/motd.backup
```

---

## 서비스 영향도: 중

### [U-01] root 계정 원격 접속 제한
- **해결되는 취약점**: root 계정에 대한 외부 공격 차단
```bash
sudo chmod o+w /etc/ssh/sshd_config
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
echo "PermitRootLogin no" >> /etc/ssh/sshd_config
sudo chmod o-w /etc/ssh/sshd_config
```

---

### [U-13] SUID, SGID, Sticky Bit 설정 점검
- **해결되는 취약점**: 권한 상승 방지
```bash
sudo chmod -s /usr/sbin/unix_chkpwd
```

---

### [U-45] root 계정 su 제한
- **해결되는 취약점**: 일반 사용자의 root 전환 방지
```bash
sudo groupadd wheel
sudo chgrp wheel /usr/bin/su
sudo chmod 4750 /usr/bin/su
sudo usermod –G wheel ec2-user
```

---

### [U-47/48] 패스워드 최대/최소 사용 기간 설정
- **해결되는 취약점**: 패스워드 노출 위험 및 변경 우회 방지
```bash
sudo chmod o+w /etc/login.defs
sudo cp /etc/login.defs /etc/login.defs.backup
sudo sed -i 's/PASS_MAX_DAYS\t99999/PASS_MAX_DAYS\t90/g' /etc/login.defs
sudo sed -i 's/PASS_MIN_DAYS\t0/PASS_MIN_DAYS\t7/g' /etc/login.defs
sudo chmod o-w /etc/login.defs
```

---

### [U-65] at 서비스 권한 설정
- **해결되는 취약점**: 예약 작업을 통한 악성 명령 실행 방지
```bash
sudo chmod 4750 /usr/bin/at
sudo chown root /etc/at.deny
sudo chmod 640 /etc/at.deny
```

---

## med 설정 이후 정리
```bash
sudo rm ./med_u*
sudo rm /etc/login.defs.backup
sudo rm /etc/ssh/sshd_config.backup
```

---

## 요약

| 항목 | 목적 | 주요 취약점 |
|------|------|-------------|
| U-02, U-46 | 패스워드 정책 강화 | 약한 패스워드, 크래킹 |
| U-03 | 로그인 실패 차단 | brute-force |
| U-54 | 세션 시간 제한 | 세션 방치로 인한 탈취 |
| U-01 | root 원격 접속 차단 | 직접 공격 |
| U-13 | SUID 제거 | 권한 상승 |
| U-45 | su 제한 | 내부자 계정 탈취 |
| U-47/48 | 주기적 패스워드 변경 | 장기 노출 방지 |
| U-65 | at 예약 권한 통제 | 스케줄 악용 방지 |

---

> 적용 전 **백업을 꼭 생성**하고, SSH 설정 변경 시에는 `sshd` 재시작이 필요할 수 있음.
