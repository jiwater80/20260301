import { supabase, isSupabaseConfigured } from './supabase'
import { getStoredAppUser } from '@/stores/appUserStore'
import type { Family } from '@/types'

const STORAGE_FAMILY_ID = 'han_cn_family_id'

/** 저장된 가족 ID로 가족 정보만 조회 (없으면 null, 새로 만들지 않음) */
export async function getFamily(): Promise<{ family: Family } | null> {
  if (!isSupabaseConfigured) return null

  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_FAMILY_ID) : null
  if (!stored) return null

  const { data, error } = await supabase.from('families').select().eq('id', stored).single()
  if (error || !data) return null
  return { family: data as Family }
}

/** 가족 만들기 (처음 쓰는 사람용). 초대 코드 화면에서 "시작하기" 누를 때만 저장하므로 여기서는 localStorage에 넣지 않음. */
export async function createFamily(): Promise<{ family: Family; inviteCode: string } | null> {
  if (!isSupabaseConfigured) return null

  const inviteCode = 'HANCN' + Math.random().toString(36).slice(2, 8).toUpperCase()
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({ invite_code: inviteCode, name: '우리집' })
    .select()
    .single()

  if (familyError || !family) return null

  const { error: membersError } = await supabase.from('family_members').insert([
    { family_id: family.id, user_id: 'user1', display_name: '남편' },
    { family_id: family.id, user_id: 'user2', display_name: '아내' },
  ])
  if (membersError) return null

  return { family: family as Family, inviteCode }
}

/** 가족 ID를 저장 (초대 코드 화면에서 "시작하기" 눌렀을 때 호출) */
export function setStoredFamilyId(familyId: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_FAMILY_ID, familyId)
  } catch {
    // ignore
  }
}

/** 초대 코드로 가족 참여 (둘째 사람용) */
export async function joinFamily(inviteCode: string): Promise<{ family: Family } | null> {
  if (!isSupabaseConfigured) return null

  const code = inviteCode.trim().toUpperCase()
  if (!code) return null

  const { data: family, error: fetchError } = await supabase
    .from('families')
    .select()
    .eq('invite_code', code)
    .single()

  if (fetchError || !family) return null

  const userId = getStoredAppUser()
  if (!userId) return null

  const displayName = userId === 'user1' ? '남편' : '아내'
  const { error: insertError } = await supabase.from('family_members').upsert(
    { family_id: family.id, user_id: userId, display_name: displayName },
    { onConflict: 'family_id, user_id', ignoreDuplicates: false }
  )
  if (insertError) return null

  try {
    localStorage.setItem(STORAGE_FAMILY_ID, family.id)
  } catch {
    // ignore
  }
  return { family: family as Family }
}

/** 기존 동작 호환: 저장된 가족 있으면 반환, 없으면 null (자동 생성 안 함) */
export async function getOrCreateFamily(): Promise<{ family: Family } | null> {
  return getFamily()
}
