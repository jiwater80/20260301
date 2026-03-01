import { create } from 'zustand'
import type { CurrencyCode } from '@/types'

interface CurrencyStore {
  baseCurrency: CurrencyCode
  setBaseCurrency: (currency: CurrencyCode) => void
}

export const useCurrencyStore = create<CurrencyStore>((set) => ({
  baseCurrency: 'KRW',
  setBaseCurrency: (currency) => set({ baseCurrency: currency }),
}))
