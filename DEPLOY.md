# 한-중 가계부 배포 (아내와 공유용)

웹 주소를 받아서 휴대폰/PC에서 같이 쓰려면 **Vercel**에 한 번 배포하면 됩니다.

---

## 1. Vercel 가입 및 배포

1. **https://vercel.com** 접속 → **Sign Up** (GitHub로 로그인 추천)
2. **Add New… → Project** 선택
3. 이 프로젝트를 **GitHub에 올린 뒤** "Import Git Repository"로 연결하거나,  
   **Vercel CLI**로 배포:
   ```bash
   npm i -g vercel
   cd c:\Users\han_jisoo\han-cn-budget-app
   vercel
   ```
   (처음에는 질문에 Enter만 눌러도 됨)
4. 배포가 끝나면 **https://han-cn-budget-app-xxx.vercel.app** 같은 주소가 생깁니다.  
   → 이 주소를 아내에게 공유하면 됩니다.

---

## 2. 환경 변수 설정 (필수)

Supabase를 쓰고 있으므로, Vercel에서도 같은 값을 넣어야 합니다.

1. Vercel 대시보드 → 해당 프로젝트 → **Settings → Environment Variables**
2. 아래 3개 추가 (로컬 `.env`에 있는 값 그대로 사용):

   | Name | Value |
   |------|--------|
   | `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
   | `VITE_EXCHANGE_RATE_API_KEY` | (환율 API 쓸 때만) API 키 |

3. 저장 후 **Deployments**에서 **Redeploy** 한 번 실행

---

## 3. 공유 방법

- **웹**: 아내에게 배포된 주소(예: `https://han-cn-budget-app-xxx.vercel.app`)를 보내면, 브라우저에서 바로 사용 가능합니다.
- **앱처럼 쓰기 (PWA)**:  
  휴대폰 브라우저(Chrome/Safari)에서 해당 주소 접속 →  
  **메뉴 → "홈 화면에 추가"** 또는 **"앱으로 설치"** 하면 앱처럼 설치됩니다.

같은 가계부 데이터는 Supabase에 있으므로, 둘 다 같은 URL로 접속해 로그인하면 같은 가족 데이터를 함께 볼 수 있습니다.
