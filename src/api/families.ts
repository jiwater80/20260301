import { supabase, isSupabaseConfigured } from './supabase'
import { getStoredAppUser } from '@/stores/appUserStore'
import type { Family } from '@/types'

const STORAGE_FAMILY_ID = 'han_cn_family_id'

/** 저장된 가족이 있으면 조회, 없으면 새로 만들고 남편/아내 둘 다 멤버로 등록 후 반환 */
export async function getOrCreateFamily(): Promise<{ family: Family } | null> {
  if (!isSupabaseConfigured) return null

  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_FAMILY_ID) : null
  if (stored) {
    const { data: family, error } = await supabase.from('families').select().eq('id', stored).single()
    if (!error && family) return { family: family as Family }
    // 저장된 ID가 DB에 없으면 아래에서 새로 생성
  }

  const userId = getStoredAppUser()
  if (!userId) return null

  const inviteCode = 'HANCN' + Math.random().toString(36).slice(2, 8).toUpperCase()
  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({ invite_code: inviteCode, name: '우리집' })
    .select()
    .single()

  if (familyError || !family) return null

  const now = new Date().toISOString()
  const members = [
    { family_id: family.id, user_id: 'user1', display_name: '남편', joined_at: now },
    { family_id: family.id, user_id: 'user2', display_name: '아내', joined_at: now },
  ]
  const { error: memberError } = await supabase.from('family_members').insert(members)
  if (memberError) return null

  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_FAMILY_ID, family.id)
  } catch {
    // ignore
  }
  return { family: family as Family }
}
