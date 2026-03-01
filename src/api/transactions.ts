import { supabase } from './supabase'
import type { Transaction, TransactionInsert } from '@/types'
import { getStoredAppUser, APP_USER_DISPLAY_NAMES } from '@/stores/appUserStore'

/** 가족별 거래 목록 (최신순) */
export async function listTransactions(familyId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('family_id', familyId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map(rowToTransaction)
}

/** 거래 추가 (user1/user2 기준, 패스워드 없음) */
export async function insertTransaction(
  familyId: string,
  payload: Omit<TransactionInsert, 'family_id' | 'user_id' | 'user_display_name'>
): Promise<Transaction | null> {
  const userId = getStoredAppUser()
  if (!userId) return null
  const displayName = APP_USER_DISPLAY_NAMES[userId]

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      family_id: familyId,
      user_id: userId,
      user_display_name: displayName,
      type: payload.type,
      amount: payload.amount,
      currency: payload.currency,
      amount_base: payload.amount_base ?? null,
      rate_at_transaction: payload.rate_at_transaction ?? null,
      memo: payload.memo ?? null,
      category: payload.category ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data ? rowToTransaction(data) : null
}

/** 실시간 구독 */
export function subscribeTransactions(
  familyId: string,
  onInsert: (tx: Transaction) => void,
  onUpdate?: (tx: Transaction) => void,
  onDelete?: (id: string) => void
) {
  const channel = supabase
    .channel(`transactions:${familyId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `family_id=eq.${familyId}`,
      },
      (payload) => onInsert(rowToTransaction(payload.new as Record<string, unknown>))
    )
  if (onUpdate) {
    channel.on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'transactions',
        filter: `family_id=eq.${familyId}`,
      },
      (payload) => onUpdate(rowToTransaction(payload.new as Record<string, unknown>))
    )
  }
  if (onDelete) {
    channel.on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'transactions',
        filter: `family_id=eq.${familyId}`,
      },
      (payload) => onDelete((payload.old as { id: string }).id)
    )
  }
  channel.subscribe()
  return () => {
    supabase.removeChannel(channel)
  }
}

function rowToTransaction(row: Record<string, unknown>): Transaction {
  return {
    id: String(row.id),
    familyId: String(row.family_id),
    userId: String(row.user_id),
    userDisplayName: String(row.user_display_name),
    type: row.type as Transaction['type'],
    amount: Number(row.amount),
    currency: row.currency as Transaction['currency'],
    amountBase: row.amount_base != null ? Number(row.amount_base) : undefined,
    rateAtTransaction: row.rate_at_transaction != null ? Number(row.rate_at_transaction) : undefined,
    memo: row.memo != null ? String(row.memo) : undefined,
    category: row.category != null ? String(row.category) : undefined,
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}
