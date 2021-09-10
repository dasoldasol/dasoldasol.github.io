## 문제 정의
- 수집 완료한 S3 데이터를 Athena로 조회시, 각 단지서버의 스키마가 일치하지 않아 조회 불가
  ![1.png](/wikis/3008046072730551565/files/3073894069791679578)
- 에러 명칭 : HIVE_PARTITION_SCHEMA_MISMATCH, HIVE_BAD_DATA
- 스키마 미스매치 예시 : double <-> int
- 문제 테이블 갯수 : 총 62개 중 7개

## 문제 원인
- 단지서버 mariadb의 decimal 데이터타입으로 인해 int, double 등으로 데이터타입이 다르게 됨

## 문제 해결 프로세스
1. Athena HIVE 메타 데이터 삭제
2. Glue 크롤러 편집
    * 크롤러 설정 : 테이블에서 메타데이터가 있는 새 파티션과 기존 파티션을 모두 업데이트하도록 설정
3. Glue 스키마 편집(필요시)
4. 새로운 테이블 생성으로 string 형변환 -> msck repair table로 파티션키 추가