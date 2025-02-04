---
title: "[서버관리]EBS 용량 최적화"
excerpt: ""
toc: true
toc_sticky: true
categories:
- Infra
- Server Administration
modified_date: 2025-01-02 08:36:28 +0900
---

### 문제사항
- 배치 서버 EC2 EBS 용량 90% 초과 문제(Storage usage)

### 원인 파악 
- 디스크 용량 확인 시 원인 : docker overlayFS 저장소가 대부분 차지

    ```
    [root@ip-10-50-7-43 /]# df -h
    Filesystem      Size  Used Avail Use% Mounted on
    devtmpfs        1.9G     0  1.9G   0% /dev
    tmpfs           1.9G     0  1.9G   0% /dev/shm
    tmpfs           1.9G  572K  1.9G   1% /run
    tmpfs           1.9G     0  1.9G   0% /sys/fs/cgroup
    /dev/nvme0n1p1   50G   45G  5.2G  90% /
    overlay          50G   45G  5.2G  90% /var/lib/docker/overlay2/fef6b8ebd24342f883952adeb93ea42aa6b00048bfe46a831c90cce9a845fda8/merged
    overlay          50G   45G  5.2G  90% /var/lib/docker/overlay2/bf968e716d17ba876e55bee6ebc55bfbe0a8a8718a2ac35b05b4ba840dc7dc32/merged
    tmpfs           386M     0  386M   0% /run/user/0
    ```

- /var/log/* 용량 확인 시 원인 : /var/log/journal이 대부분차지(3GB)

### 조치사항 
1. 중지된 컨테이너 prune 
2. 사용하지 않는 이미지 prune 
3. journalctl vacuum-time 7일 설정
4. docker 컨테이너 로그 truncate 및 logrotate 7일 설정, prune cron 설정

    ```
    sudo nano /etc/logrotate.d/docker-containers
    ```
    
    ```
    /var/lib/docker/containers/*/*.log {
        daily                
        missingok             
        rotate 7              
        compress              
        delaycompress         
        notifempty            
        create 0640 root root
        dateext
    }
    ```
    
    ```
    sudo crontab -e
    ```
    
    ```
    3 19 1 * * /usr/bin/docker system prune -af
    ```
    

### 1차 결과 
- 아래와 같이 용량 줄임

    ```
    [root@ip-10-50-7-43]# df -h
    Filesystem      Size  Used Avail Use% Mounted on
    devtmpfs        1.9G     0  1.9G   0% /dev
    tmpfs           1.9G     0  1.9G   0% /dev/shm
    tmpfs           1.9G  572K  1.9G   1% /run
    tmpfs           1.9G     0  1.9G   0% /sys/fs/cgroup
    /dev/nvme0n1p1   50G  6.4G   44G  13% /
    overlay          50G  6.4G   44G  13% /var/lib/docker/overlay2/fef6b8ebd24342f883952adeb93ea42aa6b00048bfe46a831c90cce9a845fda8/merged
    overlay          50G  6.4G   44G  13% /var/lib/docker/overlay2/bf968e716d17ba876e55bee6ebc55bfbe0a8a8718a2ac35b05b4ba840dc7dc32/merged
    tmpfs           386M     0  386M   0% /run/user/0
    ```
    
