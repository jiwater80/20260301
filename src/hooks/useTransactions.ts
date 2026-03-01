import { useQuery } from '@tanstack/react-query'
import { listTransactions } from '@/api/transactions'

const QUERY_KEY = (familyId: string) => ['transactions', familyId] as const

export function useTransactions(familyId: string | null) {
  return useQuery({
    queryKey: QUERY_KEY(familyId ?? ''),
    queryFn: () => listTransactions(familyId!),
    enabled: !!familyId,
  })
}
