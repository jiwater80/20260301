# Vercel로 한-중 가계부 배포하기

웹 주소를 받아서 휴대폰/PC에서 쓰려면 **Vercel**에 배포하면 됩니다.

---

## 방법 1: GitHub 연결해서 배포 (추천, 가장 쉬움)

이미 GitHub에 코드를 올렸다면 이 방법이 제일 쉽습니다.

### 1단계: Vercel 가입

1. 브라우저에서 **https://vercel.com** 접속
2. **Sign Up** 클릭
3. **Continue with GitHub** 선택해서 GitHub 계정으로 로그인
4. 권한 요청이 나오면 **Authorize** 등으로 허용

### 2단계: 프로젝트 가져오기

1. Vercel 대시보드에서 **Add New…** → **Project** 클릭
2. **Import Git Repository** 목록에서 **jiwater80/20260301** (또는 올려둔 저장소 이름) 찾기
3. **Import** 클릭

### 3단계: 설정 (그대로 두고 진행)

- **Framework Preset**: Vite (자동 감지됨)
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `dist` (기본값)
- **Root Directory**: 비워 두기

→ **Deploy** 버튼 클릭

### 4단계: 환경 변수 넣기 (필수)

첫 배포가 끝나면 **빨간 에러**로 안 열릴 수 있어요. Supabase 설정이 없어서 그래요.

1. 프로젝트 페이지에서 **Settings** 탭 클릭
2. 왼쪽에서 **Environment Variables** 클릭
3. 아래 3개 추가 (로컬 컴퓨터의 `.env` 파일에 있는 값 복사해서 넣기):

   | Name | Value | 비고 |
   |------|--------|------|
   | `VITE_SUPABASE_URL` | Supabase 대시보드의 Project URL | 필수 |
   | `VITE_SUPABASE_ANON_KEY` | Supabase의 anon public key | 필수 |
   | `VITE_EXCHANGE_RATE_API_KEY` | 환율 API 키 | 쓰면 넣기 |

4. **Save** 한 뒤, 위쪽 **Deployments** 탭으로 가서  
   맨 위 배포 오른쪽 **⋯** → **Redeploy** 클릭

### 5단계: 주소 확인

- **Deployments** 탭에서 맨 위 배포 클릭 → **Visit** 또는 주소 클릭
- 또는 프로젝트 대시보드 맨 위 **Domains**에 나오는  
  **`https://20260301-xxx.vercel.app`** 같은 주소가 **인터넷 주소**입니다.  
  → 이 주소를 아내에게 공유하면 됩니다.

---

## 방법 2: 터미널/스크립트로 배포

프로젝트 폴더에서 한 번에 빌드 + 배포할 때 쓰세요.

### 1단계: Vercel 로그인 (처음 한 번만)

1. 터미널(PowerShell 또는 Cursor 터미널)에서:
   ```bash
   cd c:\Users\han_jisoo\han-cn-budget-app
   npx vercel login
   ```
2. 브라우저가 열리면 이메일 입력 후 받은 링크 클릭해서 로그인

### 2단계: 배포 실행

**방법 A – npm 스크립트**

```bash
npm run deploy
```

(프리뷰만 하려면: `npm run deploy:preview`)

**방법 B – 배치 파일**

- 프로젝트 폴더의 **deploy.bat** 더블클릭

**방법 C – PowerShell**

```powershell
.\deploy.ps1
```

### 3단계: 환경 변수 (처음 한 번만)

- 첫 배포 후 Vercel 대시보드(**https://vercel.com** → 해당 프로젝트)에 들어가서  
  **Settings → Environment Variables**에  
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (필요 시 `VITE_EXCHANGE_RATE_API_KEY`) 추가
- 저장 후 **Deployments**에서 **Redeploy** 한 번 실행

### 4단계: 주소 확인

- 터미널에 나온 **Production: https://xxx.vercel.app** 주소
- 또는 Vercel 대시보드 → 프로젝트 → **Domains**에 있는 주소

---

## 배포 후 공유

- **웹**: 위에서 확인한 **https://xxx.vercel.app** 주소를 보내면 됩니다.
- **앱처럼 쓰기 (PWA)**: 휴대폰 브라우저에서 그 주소 접속 → 메뉴 → **홈 화면에 추가** / **앱으로 설치** 하면 됩니다.

같은 Supabase를 쓰므로, 둘 다 같은 URL로 접속해 로그인하면 같은 가족 데이터를 볼 수 있습니다.
