-- 기존 프로젝트에 joined_at 추가 (Supabase SQL Editor에서 실행)
-- 한 번만 실행하면 됩니다.

ALTER TABLE public.family_members
ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN public.family_members.joined_at IS '앱에서 초대 코드로 참여한 시점. 둘 다 연결됐는지 판단용';
