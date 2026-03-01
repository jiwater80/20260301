# GitHub에 올릴 때 "100개 파일 초과" 해결

웹에서 드래그로 올리면 **한 번에 100개까지만** 올라갑니다.  
원인은 대부분 **node_modules** 폴더(수천 개 파일)를 포함해서 올리기 때문입니다.

---

## ✅ 방법 1: Git으로 올리기 (제한 없음, 추천)

**node_modules**는 `.gitignore`에 있어서 Git으로 올리면 **자동으로 제외**되고, 파일 개수 제한도 없습니다.

1. **Git 설치** (아직이면): https://git-scm.com/download/win 에서 설치
2. **Cursor를 한 번 종료했다가 다시 실행** (PATH에 Git이 잡히도록)
3. Cursor에서 **터미널** 열고 (Ctrl + `) 아래 순서대로 입력:

```bash
cd c:\Users\han_jisoo\han-cn-budget-app

git init
git add .
git commit -m "한-중 가계부 프로젝트"
git remote add origin https://github.com/jiwater80/20260301.git
git branch -M main
git push -u origin main
```

4. GitHub 로그인 창이 뜨면 로그인하면 됩니다.  
   → 이렇게 하면 **웹 100개 제한 없이** 한 번에 올라갑니다.

---

## ✅ 방법 2: 웹 업로드만 쓸 때 (node_modules 제외하고 올리기)

Git을 쓰지 않으려면, **node_modules 폴더는 절대 선택하지 마세요.**

### 올려야 할 것만 골라서 올리기

- **루트에 있는 파일만**  
  `package.json`, `package-lock.json`, `index.html`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.js`, `postcss.config.js`, `.gitignore`, `.env.example`, `DEPLOY.md` 등  
  (`.env`는 비밀키 있으니 **올리지 마세요**)
- **src 폴더 통째로** (안에 있는 .ts, .tsx, .css 등만 있으면 됨, 보통 30개 미만)
- **public 폴더**가 있으면 그 안에 있는 것만

즉, **"han-cn-budget-app" 안에서 node_modules만 제외**하고 올리면 됩니다.  
그렇게 하면 파일 수가 100개 안쪽이라 웹 업로드도 됩니다.

### 한 번에 다 안 올라가면

- 1차: 루트 파일들만 선택해서 올리기  
- 2차: `src` 폴더만 선택해서 올리기  
- (있으면) 3차: `public` 폴더만 선택해서 올리기  

이렇게 나눠서 올리면 100개 제한을 피할 수 있습니다.

---

정리: **방법 1 (Git)** 쓰는 게 가장 빠르고, 앞으로 수정해서 다시 올릴 때도 편합니다.
