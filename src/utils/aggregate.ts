import type { Transaction } from '@/types'

export type PeriodType = 'day' | 'week' | 'month'

export interface PeriodSummary {
  periodLabel: string
  periodKey: string
  incomeKrw: number
  incomeCny: number
  expenseKrw: number
  expenseCny: number
  incomeBase: number // KRW 기준
  expenseBase: number
}

const rateFallback = 192

function getBaseKrw(tx: Transaction, rateKrwPerCny: number): number {
  if (tx.amountBase != null) return tx.amountBase
  return tx.currency === 'KRW' ? tx.amount : tx.amount * (tx.rateAtTransaction ?? rateKrwPerCny)
}

function getDateKey(date: Date, period: PeriodType): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  if (period === 'day') return `${y}-${m}-${d}`
  if (period === 'month') return `${y}-${m}`
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(start)
  monday.setDate(diff)
  const my = monday.getFullYear()
  const mm = String(monday.getMonth() + 1).padStart(2, '0')
  const md = String(monday.getDate()).padStart(2, '0')
  return `${my}-${mm}-${md}` // 주 시작일
}

function getPeriodLabel(key: string, period: PeriodType): string {
  if (period === 'month') return key
  if (period === 'day') return key
  return `${key} 주`
}

export function groupTransactionsByPeriod(
  transactions: Transaction[],
  period: PeriodType,
  rateKrwPerCny: number = rateFallback
): PeriodSummary[] {
  const rate = rateKrwPerCny
  const map = new Map<
    string,
    { incomeKrw: number; incomeCny: number; expenseKrw: number; expenseCny: number; incomeBase: number; expenseBase: number }
  >()

  for (const tx of transactions) {
    const key = getDateKey(new Date(tx.createdAt), period)
    const base = getBaseKrw(tx, rate)
    if (!map.has(key)) {
      map.set(key, {
        incomeKrw: 0,
        incomeCny: 0,
        expenseKrw: 0,
        expenseCny: 0,
        incomeBase: 0,
        expenseBase: 0,
      })
    }
    const row = map.get(key)!
    if (tx.type === 'income') {
      row.incomeBase += base
      if (tx.currency === 'KRW') row.incomeKrw += tx.amount
      else row.incomeCny += tx.amount
    } else {
      row.expenseBase += base
      if (tx.currency === 'KRW') row.expenseKrw += tx.amount
      else row.expenseCny += tx.amount
    }
  }

  const keys = Array.from(map.keys()).sort()
  return keys.map((periodKey) => {
    const r = map.get(periodKey)!
    return {
      periodLabel: getPeriodLabel(periodKey, period),
      periodKey,
      ...r,
    }
  })
}

/** 전체 기간 합계 (KRW/CNY/통합 KRW 기준) */
export function getTotals(
  transactions: Transaction[],
  rateKrwPerCny: number = rateFallback
): {
  incomeKrw: number
  incomeCny: number
  expenseKrw: number
  expenseCny: number
  incomeBase: number
  expenseBase: number
} {
  let incomeKrw = 0
  let incomeCny = 0
  let expenseKrw = 0
  let expenseCny = 0
  let incomeBase = 0
  let expenseBase = 0
  const rate = rateKrwPerCny
  for (const tx of transactions) {
    const base = getBaseKrw(tx, rate)
    if (tx.type === 'income') {
      incomeBase += base
      if (tx.currency === 'KRW') incomeKrw += tx.amount
      else incomeCny += tx.amount
    } else {
      expenseBase += base
      if (tx.currency === 'KRW') expenseKrw += tx.amount
      else expenseCny += tx.amount
    }
  }
  return {
    incomeKrw,
    incomeCny,
    expenseKrw,
    expenseCny,
    incomeBase,
    expenseBase,
  }
}
