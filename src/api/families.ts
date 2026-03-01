import { supabase, isSupabaseConfigured } from './supabase'
import type { Family } from '@/types'

const STORAGE_FAMILY_ID = 'han_cn_family_id'

/** 단일 가족: user1(남편) / user2(아내) 전용. 패스워드 없이 한 가정만 사용 */
export async function getOrCreateFamily(): Promise<{ family: Family } | null> {
  if (!isSupabaseConfigured) return null

  const stored = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_FAMILY_ID) : null
  if (stored) {
    const { data, error } = await supabase.from('families').select().eq('id', stored).single()
    if (!error && data) return { family: data as Family }
  }

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

  try {
    localStorage.setItem(STORAGE_FAMILY_ID, family.id)
  } catch {
    // ignore
  }
  return { family: family as Family }
}
