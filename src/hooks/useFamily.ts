import { useQuery } from '@tanstack/react-query'
import { getOrCreateFamily } from '@/api/families'

const QUERY_KEY = ['myFamily'] as const

export function useFamily() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: getOrCreateFamily,
    staleTime: 1000 * 60 * 5,
  })
}
