# 한-중 가계부 앱 기술 스택

## 요구사항 매핑

| 요구사항 | 선택 기술 | 비고 |
|----------|-----------|------|
| 다중 통화 (KRW/CNY) + 실시간 환율 | Exchange Rate API + 로컬 캐시 | API 키 없이 사용 가능한 옵션 포함 |
| 실시간 동기화 (한국↔중국) | **Supabase** | Realtime 구독, Row Level Security, 무료 티어 |
| 일/주/월 리포트 대시보드 | Recharts + Supabase 집계 | 서버/클라이언트 집계 병행 |
| 모바일 친화 웹앱 | **React + Vite + PWA** | 오프라인·홈화면 설치 지원 |

---

## 추천 스택 상세

### 1. 프론트엔드
- **React 18** + **TypeScript**
- **Vite** – 빠른 개발 서버 및 빌드
- **React Router** – 라우팅
- **Tailwind CSS** – 모바일 퍼스트 스타일링
- **Vite PWA Plugin** – 서비스 워커, 매니페스트, 오프라인 지원

### 2. 실시간 DB 및 백엔드
- **Supabase**
  - PostgreSQL + Realtime 구독(한국/중국 동시 접속 시 실시간 반영)
  - Auth(이메일/소셜)로 남편/아내 계정 분리
  - Row Level Security로 Family 단위 데이터 공유
  - 무료 티어로 소규모 가족 사용에 적합

### 3. 환율 API
- **1순위: Frankfurter** (`api.frankfurter.dev`) – API 키 불필요, 일 단위 갱신
- **2순위: ExchangeRate-API** – 무료 키 발급 시 월 1,500 요청, 1시간 단위 갱신
- 클라이언트에서 **캐시(예: 1시간)** 후 재요청해 호출 수 절감

### 4. 대시보드/차트
- **Recharts** – React 친화적, 반응형, 일/주/월 막대·라인 차트에 적합

### 5. 상태 관리
- **TanStack Query (React Query)** – 서버 상태(거래 목록, 환율, 집계)
- **Zustand** (선택) – 클라이언트 UI 상태(기준 통화, 필터)

---

## 디렉터리 구조 (초기)

```
han-cn-budget-app/
├── public/
├── src/
│   ├── api/           # 환율 API, Supabase 클라이언트
│   ├── components/    # 공통 UI, 차트, 폼
│   ├── features/      # 가계부, 대시보드, 설정 등 기능 단위
│   ├── hooks/         # useExchangeRate, useRealtimeTransactions
│   ├── stores/        # Zustand (기준 통화 등)
│   ├── types/         # 공통 타입
│   ├── utils/         # 날짜, 금액 포맷, 환율 계산
│   ├── App.tsx
│   └── main.tsx
├── docs/              # TECH_STACK, 2단계 구현 가이드
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 2단계 구현 순서 (프롬프트 활용)

구체적인 코드 작성 시 아래 순서로 진행하면 의존성이 맞습니다.

1. **① 환율 계산 로직**  
   `"KRW와 CNY 간의 실시간 환율을 가져오는 서비스를 만들어줘. 사용자가 위안화로 입력하면 당시 환율 기준으로 원화 가치를 함께 기록하고, 전체 합산 시 기준 통화를 선택할 수 있게 해줘."`

2. **② 사용자 공유 및 데이터 구조**  
   `"남편(한국)과 아내(중국) 계정을 연결하는 데이터 구조를 설계해줘. 동일한 'Family ID'를 가진 사용자들이 데이터를 공유하고, 누가 어떤 항목을 입력했는지 구분할 수 있어야 해."`

3. **③ 기간별 리포트 UI (차트 포함)**  
   `"일간, 주간, 월간 소득/지출을 시각화하는 대시보드 페이지를 만들어줘. 통계 데이터는 위안화와 원화 각각의 총합과 통합된 총합을 모두 보여줘야 해."`

각 단계 완료 후 다음 단계 프롬프트를 붙여 넣어 구현을 이어가면 됩니다.
