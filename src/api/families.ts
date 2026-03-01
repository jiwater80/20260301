import { supabase, isSupabaseConfigured } from './supabase'
import { getStoredAppUser } from '@/stores/appUserStore'
import type { Family } from '@/types'

const STORAGE_FAMILY_ID = 'han_cn_family_id'

export type FamilyWithStatus = { family: Family; bothConnected: boolean }

/** 저장된 가족 ID로 가족 정보 + 둘 다 연결됐는지 조회 */
export async function getFamilyWithStatus(): Promise<FamilyWithStatus | null> {
  if (!isSupabaseConfigured) return null

  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_FAMILY_ID) : null
  if (!stored) return null

  const { data: family, error: famError } = await supabase.from('families').select().eq('id', stored).single()
  if (famError || !family) return null

  const { count, error: countError } = await supabase
    .from('family_members')
    .select('*', { count: 'exact', head: true })
    .eq('family_id', stored)
    .not('joined_at', 'is', null)

  if (countError) return { family: family as Family, bothConnected: false }
  const bothConnected = (count ?? 0) >= 2

  return { family: family as Family, bothConnected }
}

/** 저장된 가족 ID로 가족 정보만 조회 (없으면 null) */
export async function getFamily(): Promise<{ family: Family } | null> {
  const result = await getFamilyWithStatus()
  return result ? { family: result.family } : null
}

/** 가족 만들기: 만든 사람만 멤버로 추가하고 joined_at 기록. localStorage는 저장 안 함. */
export async function createFamily(): Promise<{ family: Family; inviteCode: string } | null> {
  if (!isSupabaseConfigured) return null

  const userId = getStoredAppUser()
  if (!userId) return null

  const inviteCode = 'HANCN' + Math.random().toString(36).slice(2, 8).toUpperCase()
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({ invite_code: inviteCode, name: '우리집' })
    .select()
    .single()

  if (familyError || !family) return null

  const displayName = userId === 'user1' ? '남편' : '아내'
  const { error: memberError } = await supabase.from('family_members').insert({
    family_id: family.id,
    user_id: userId,
    display_name: displayName,
    joined_at: new Date().toISOString(),
  })
  if (memberError) return null

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

/** 초대 코드로 가족 참여. joined_at 기록 후 localStorage 저장. */
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
  const now = new Date().toISOString()
  const { error: upsertError } = await supabase.from('family_members').upsert(
    { family_id: family.id, user_id: userId, display_name: displayName, joined_at: now },
    { onConflict: 'family_id, user_id' }
  )
  if (upsertError) return null

  try {
    localStorage.setItem(STORAGE_FAMILY_ID, family.id)
  } catch {
    // ignore
  }
  return { family: family as Family }
}

/** 기존 호환: 가족 + 둘 다 연결 여부 반환 */
export async function getOrCreateFamily(): Promise<FamilyWithStatus | null> {
  return getFamilyWithStatus()
}
