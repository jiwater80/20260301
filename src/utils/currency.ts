import type { CurrencyCode } from '@/types'

/**
 * 기준 통화를 KRW로 두고, 입력 통화를 KRW 금액으로 환산.
 * @param amount 입력 금액
 * @param currency 입력 통화 (KRW | CNY)
 * @param rateKrwPerCny 1 CNY = N KRW
 */
export function toBaseKrw(
  amount: number,
  currency: CurrencyCode,
  rateKrwPerCny: number
): number {
  if (currency === 'KRW') return amount
  return amount * rateKrwPerCny
}

/**
 * 기준 통화를 CNY로 두고, 입력 통화를 CNY 금액으로 환산.
 */
export function toBaseCny(
  amount: number,
  currency: CurrencyCode,
  rateKrwPerCny: number
): number {
  if (currency === 'CNY') return amount
  return amount / rateKrwPerCny
}

/**
 * 선택한 기준 통화(baseCurrency)에 맞춰 금액 환산.
 */
export function toBaseAmount(
  amount: number,
  currency: CurrencyCode,
  baseCurrency: CurrencyCode,
  rateKrwPerCny: number
): number {
  if (baseCurrency === 'KRW') return toBaseKrw(amount, currency, rateKrwPerCny)
  return toBaseCny(amount, currency, rateKrwPerCny)
}
