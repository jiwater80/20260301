/** 통화 코드 */
export type CurrencyCode = 'KRW' | 'CNY'

/** 거래 유형 */
export type TransactionType = 'income' | 'expense'

/** 단일 거래 (DB 스키마와 맞출 예정) */
export interface Transaction {
  id: string
  familyId: string
  userId: string
  userDisplayName: string
  type: TransactionType
  amount: number
  currency: CurrencyCode
  amountBase?: number // 기준 통화(KRW)로 환산한 값
  rateAtTransaction?: number // 입력 시점 환율 (1 CNY = N KRW)
  memo?: string
  category?: string
  createdAt: string // ISO 8601
  updatedAt: string
}

/** 환율 응답 (API에 따라 조정) */
export interface ExchangeRateResponse {
  base: string
  rates: Record<string, number>
  date?: string
}

/** 1 CNY = rateKrwPerCny KRW */
export interface ExchangeRateState {
  rateKrwPerCny: number
  date: string
  source: 'api' | 'cache' | 'fallback'
}

/** 가족 그룹 (동일 Family ID = 데이터 공유) */
export interface Family {
  id: string
  invite_code: string
  name: string | null
  created_at: string
}

/** 가족 멤버 (누가 입력했는지 구분용) */
export interface FamilyMember {
  id: string
  family_id: string
  user_id: string
  display_name: string
  created_at: string
}

/** DB 삽입용 거래 (id, created_at, updated_at 제외) */
export interface TransactionInsert {
  family_id: string
  user_id: string
  user_display_name: string
  type: TransactionType
  amount: number
  currency: CurrencyCode
  amount_base?: number
  rate_at_transaction?: number
  memo?: string
  category?: string
}
