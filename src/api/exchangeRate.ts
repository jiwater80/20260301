/**
 * KRW–CNY 환율 API (무료 엔드포인트 + 캐시)
 * - 전날 기준 환율을 하루 1회 적용 (24시간 캐시)
 * - open.er-api.com (CNY 기준 → KRW 환산), 실패 시 폴백 상수
 */
import type { ExchangeRateResponse, ExchangeRateState } from '@/types'

const CACHE_KEY = 'exchange_rate_krw_cny'
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24시간 (하루 1회 갱신)
const FALLBACK_KRW_PER_CNY = 192 // API 실패 시 사용 (대략적 시세)

const OPEN_ER_API = 'https://open.er-api.com/v6/latest/CNY'

export async function fetchKRWCNYRate(): Promise<ExchangeRateResponse> {
  const res = await fetch(OPEN_ER_API)
  if (!res.ok) throw new Error(`Exchange rate API error: ${res.status}`)
  const data = await res.json()
  // open.er-api.com v6: { base_code: "CNY", conversion_rates: { KRW: 192.xx, ... } }
  const rates = data.conversion_rates ?? data.rates
  const base = data.base_code ?? data.base ?? 'CNY'
  if (!rates?.KRW) throw new Error('KRW rate not in response')
  return {
    base,
    rates: { KRW: Number(rates.KRW), CNY: 1 },
    date: data.time_last_update_utc ?? data.date,
  }
}

/** API 응답에서 1 CNY = ? KRW 값과 메타 반환 */
export function toExchangeRateState(data: ExchangeRateResponse): ExchangeRateState {
  const rateKrwPerCny = data.rates?.KRW ?? data.rates?.CNY ? 1 / data.rates.CNY : FALLBACK_KRW_PER_CNY
  return {
    rateKrwPerCny: Number(rateKrwPerCny),
    date: data.date ?? new Date().toISOString().slice(0, 10),
    source: 'api',
  }
}

export function getCachedRate(): ExchangeRateResponse | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, expiresAt } = JSON.parse(raw)
    if (Date.now() > expiresAt) return null
    return data as ExchangeRateResponse
  } catch {
    return null
  }
}

export function setCachedRate(data: ExchangeRateResponse): void {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ data, expiresAt: Date.now() + CACHE_TTL_MS })
  )
}

/** 캐시된 환율 상태 반환 (캐시만, API 호출 없음) */
export function getCachedRateState(): ExchangeRateState | null {
  const cached = getCachedRate()
  if (!cached) return null
  return { ...toExchangeRateState(cached), source: 'cache' }
}

/** 폴백 환율 (API/캐시 모두 없을 때) */
export function getFallbackRateState(): ExchangeRateState {
  return {
    rateKrwPerCny: FALLBACK_KRW_PER_CNY,
    date: new Date().toISOString().slice(0, 10),
    source: 'fallback',
  }
}
