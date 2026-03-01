-- 한-중 가계부: user1(남편) / user2(아내) 전용, 패스워드 없음
-- Supabase 대시보드 → SQL Editor에서 실행

-- Realtime: Database → Publications → supabase_realtime 에 transactions 추가

-- 1) 가족 (한 가정 1개)
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) 가족 멤버 (user_id = 'user1' | 'user2')
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- 3) 거래
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_display_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(18,4) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('KRW', 'CNY')),
  amount_base NUMERIC(18,4),
  rate_at_transaction NUMERIC(18,6),
  memo TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_family_created ON public.transactions(family_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_family_members_family ON public.family_members(family_id);

-- 4) RLS: 앱(anon)만 쓰므로 전부 허용 (남편/아내 둘만 쓰는 가정)
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "families_select_own" ON public.families;
DROP POLICY IF EXISTS "families_insert" ON public.families;
DROP POLICY IF EXISTS "family_members_select_own_family" ON public.family_members;
DROP POLICY IF EXISTS "family_members_insert_own" ON public.family_members;
DROP POLICY IF EXISTS "transactions_select_own_family" ON public.transactions;
DROP POLICY IF EXISTS "transactions_insert_own_family" ON public.transactions;
DROP POLICY IF EXISTS "transactions_update_own_family" ON public.transactions;
DROP POLICY IF EXISTS "transactions_delete_own_family" ON public.transactions;

CREATE POLICY "anon_families_all" ON public.families FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_family_members_all" ON public.family_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon_transactions_all" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

-- 5) updated_at 자동 갱신
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS transactions_updated_at ON public.transactions;
CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();
