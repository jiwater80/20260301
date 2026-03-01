import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeTransactions } from '@/api/transactions'
import type { Transaction } from '@/types'

const QUERY_KEY = (familyId: string) => ['transactions', familyId] as const

export function useRealtimeTransactions(familyId: string | null) {
  const queryClient = useQueryClient()
  const [isSubscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (!familyId) return

    const unsubscribe = subscribeTransactions(
      familyId,
      (tx) => {
        queryClient.setQueryData<Transaction[]>(QUERY_KEY(familyId), (prev) =>
          prev ? [tx, ...prev] : [tx]
        )
      },
      (tx) => {
        queryClient.setQueryData<Transaction[]>(QUERY_KEY(familyId), (prev) =>
          prev?.map((p) => (p.id === tx.id ? tx : p)) ?? []
        )
      },
      (id) => {
        queryClient.setQueryData<Transaction[]>(QUERY_KEY(familyId), (prev) =>
          prev?.filter((p) => p.id !== id) ?? []
        )
      }
    )
    setSubscribed(true)
    return () => {
      unsubscribe()
      setSubscribed(false)
    }
  }, [familyId, queryClient])

  return { isSubscribed }
}
