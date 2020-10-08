---
title: "Tableau SSO 토큰 발급 API 만들기"
excerpt: 'Tableau SSO 토큰을 발급하는 API를 springboot 기반으로 만든다'
toc: true
toc_sticky: true
categories:
  - Tableau
modified_date: 2020-08-26 09:36:28 +0900
---

## 목적 
Tableau의 대시보드를 신뢰할 수 있는 인증을 거친 사용만 볼 수 있도록 SSO 토큰을 발급한다. 여기서는 spring boot로 GET 요청시 SSO 토큰을 발급하는 api를 개발한다.     
/tableau/v1/dashboards/tableau 로 GET 요청 시 SSO 토큰을 발급한다.

## 소스 
### Config
Tableau 서버의 HOST와 USERNAME을 config로 등록한다. 외부 유출을 막기 위해 env 파일은 따로 둔다.     
    
**application.yml**
```yaml
env:
    tableau:
        host: ${TABLEAU_HOST} # 테스트를 위해 이곳에 직접 HOST, USERNAME을 넣는다. 나중에는 env파일을 따로 관리한다. 
        username: ${TABLEAU_USERNAME}
```
    
Controller에서 쓸 config 정보를 component로 만든다.     
    
**ReportConfiguration.java**
```java
package com.dsseo.tableau.api.report.configuration;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@Getter @Setter
@ConfigurationProperties(prefix = "env.tableau")
public class ReportConfiguration {

    private String host;
    private String username;
}
```
### Controller
/tableau/v1/dashboards/tableau 로 GET 요청 시 SSO 토큰을 발급하는 TableauController를 작성한다.    
    
**TableauController.java**
```java
package com.dsseo.tableau.api.report.domain.controller;

import com.dsseo.tableau.api.report.configuration.ReportConfiguration;
import com.dsseo.tableau.api.report.domain.service.TableauService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

@RestController
@Component
@RequestMapping(path="/report/v1/reports")
@RequiredArgsConstructor
@Slf4j
public class TableauController {
    private final TableauService tableauService;
    private final ReportConfiguration reportConfig;
    
    //태블로 리포트 토큰 생성
    @GetMapping(path = "tableau")
    public ResponseEntity<Map<String, String>> getTableauToken() throws IOException {

        String TABLEAU_SSO_HOST = reportConfig.getHost();
        String TABLEAU_SSO_USERNAME = reportConfig.getUsername();

        Map<String, String> token = tableauService.getTableauToken(TABLEAU_SSO_HOST, TABLEAU_SSO_USERNAME);
        return ResponseEntity.ok().body(token);
    }
}
``` 
### Service
SSO 토큰을 발급하는 비즈니스 로직이 담긴 TableauService를 작성한다.    
    
**TableauService.java**
```java
package com.dsseo.tableau.api.report.domain.service;

import java.io.IOException;
import java.util.Map;

public interface TableauService  {
    
    Map<String, String> getTableauToken(String TABLEAU_SSO_HOST, String TABLEAU_SSO_USERNAME) throws IOException;

}
```
**TableauServiceImpl.java**
```java
package com.dsseo.tableau.api.report.domain.service;

import okhttp3.FormBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

public class TableauServiceImpl implements TableauService{
    @Override
    public Map<String, String> getTableauToken(String TABLEAU_SSO_HOST, String TABLEAU_SSO_USERNAME) throws IOException {
        OkHttpClient client = new OkHttpClient();
        okhttp3.RequestBody body = new FormBody.Builder().add("username", TABLEAU_SSO_USERNAME).build();

        Request request = new Request.Builder().url(TABLEAU_SSO_HOST).post(body).build();

        Response response = client.newCall(request).execute();
        String token = Objects.requireNonNull(response.body()).string();
        response.close();

        return tokenResponse(token);
    }

    private Map<String, String> tokenResponse(String tokenResponse) {
        Map<String, String> map = new HashMap<>();
        map.put("token", tokenResponse);
        return map;
    }
}
```
    
## 결과 확인
postman에서 /tableau/v1/dashboards/tableau 로 GET 요청을 해서, token이 발급되는지 확인한다.     
이 token은 frontend에서 신뢰할 수 있는 인증을 받은 사용자만 View 페이지를 보여주도록 설정할 수 있게 한다. 
    
![postman-image](https://dasoldasol.github.io/assets/images/image/2020-08-26-09-33-42.png)