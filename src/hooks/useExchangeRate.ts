import { useQuery } from '@tanstack/react-query'
import {
  fetchKRWCNYRate,
  getCachedRate,
  setCachedRate,
  toExchangeRateState,
  getCachedRateState,
  getFallbackRateState,
} from '@/api/exchangeRate'
import type { ExchangeRateState } from '@/types'

const QUERY_KEY = ['exchangeRate', 'KRW', 'CNY'] as const

export function useExchangeRate(): {
  data: ExchangeRateState
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
} {
  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const cached = getCachedRate()
      if (cached) {
        const state = toExchangeRateState(cached)
        setCachedRate(cached) // TTL 갱신
        return state
      }
      const res = await fetchKRWCNYRate()
      setCachedRate(res)
      return toExchangeRateState(res)
    },
    staleTime: 1000 * 60 * 30, // 30분
    gcTime: 1000 * 60 * 60 * 2, // 2시간
    retry: 2,
    retryDelay: 2000,
    placeholderData: () => {
      const cached = getCachedRateState()
      return cached ?? getFallbackRateState()
    },
  })

  const data: ExchangeRateState =
    query.data ??
    getCachedRateState() ??
    getFallbackRateState()

  return {
    data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as Error | null,
    refetch: () => query.refetch(),
  }
}
