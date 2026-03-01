# 한-중 가계부 (KR–CN Household Budget)

실시간 환율이 반영되고, 한국·중국에서 동시에 데이터를 공유할 수 있는 가계부 웹앱(PWA)입니다.

## 요구사항 요약

- **다중 통화**: KRW(원) · CNY(위안) 지원, 실시간 환율 반영
- **실시간 동기화**: 남편(한국) / 아내(중국)가 각각 입력 시 동시에 조회
- **대시보드**: 일/주/월 소득·지출 리포트
- **플랫폼**: 모바일 친화 PWA

## 기술 스택

| 구분 | 기술 |
|------|------|
| 프론트 | React 18, TypeScript, Vite, Tailwind CSS, PWA |
| DB/백엔드 | Supabase (PostgreSQL + Realtime + Auth) |
| 환율 | Frankfurter API 또는 ExchangeRate-API |
| 차트 | Recharts |

자세한 내용은 [docs/TECH_STACK.md](docs/TECH_STACK.md)를 참고하세요.

## 프로젝트 구조

```
han-cn-budget-app/
├── public/
├── src/
│   ├── api/           # Supabase, 환율 API
│   ├── components/    # 레이아웃, 공통 UI
│   ├── features/      # dashboard, transactions, settings
│   ├── hooks/         # useExchangeRate, 실시간 구독 등
│   ├── stores/        # Zustand (기준 통화 등)
│   ├── types/
│   └── utils/
├── docs/              # TECH_STACK, 2단계 가이드
└── ...
```

## 로컬 실행

```bash
cd han-cn-budget-app
npm install
cp .env.example .env
# .env에 VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY 입력 (2단계 ② 이후)
npm run dev
```

- 빌드: `npm run build`
- 미리보기: `npm run preview`

## 2단계: 핵심 기능 구현 순서

초기 구조를 기준으로, 아래 **프롬프트를 순서대로** 적용해 구현하세요.

### ① 환율 계산 로직

> "KRW와 CNY 간의 실시간 환율을 가져오는 서비스를 만들어줘. 사용자가 위안화로 입력하면 당시 환율 기준으로 원화 가치를 함께 기록하고, 전체 합산 시 기준 통화를 선택할 수 있게 해줘."

### ② 사용자 공유 및 데이터 구조

> "남편(한국)과 아내(중국) 계정을 연결하는 데이터 구조를 설계해줘. 동일한 'Family ID'를 가진 사용자들이 데이터를 공유하고, 누가 어떤 항목을 입력했는지 구분할 수 있어야 해."

### ③ 기간별 리포트 UI (차트 포함)

> "일간, 주간, 월간 소득/지출을 시각화하는 대시보드 페이지를 만들어줘. 통계 데이터는 위안화와 원화 각각의 총합과 통합된 총합을 모두 보여줘야 해."

각 단계를 완료한 뒤 다음 단계 프롬프트를 붙여 넣어 진행하면 됩니다.
