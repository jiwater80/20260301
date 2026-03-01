import { useQuery } from '@tanstack/react-query'
import { getOrCreateFamily } from '@/api/families'

const QUERY_KEY = ['myFamily'] as const

export function useFamily() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getOrCreateFamily,
    staleTime: 1000 * 60 * 5,
    refetchInterval: (query) => {
      const data = query.state.data
      // 둘 다 연결되기 전에는 2초마다 재조회 (상대방 참여 감지)
      if (data && 'bothConnected' in data && !data.bothConnected) return 2000
      return false
    },
  })
}
