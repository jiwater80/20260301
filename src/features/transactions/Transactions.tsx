import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth, useFamily, useTransactions, useRealtimeTransactions, useExchangeRate } from '@/hooks'
import { useCurrencyStore } from '@/stores'
import { insertTransaction } from '@/api/transactions'
import { isSupabaseConfigured } from '@/api/supabase'
import FamilyConnect from '@/components/FamilyConnect'
import WaitingForPartner from '@/components/WaitingForPartner'
import { toBaseKrw } from '@/utils/currency'
import type { CurrencyCode, TransactionType } from '@/types'
import { formatAmount, formatDate } from '@/utils/format'

export default function Transactions() {
  const queryClient = useQueryClient()
  const { user, signIn } = useAuth()
  const { data: familyData, isLoading: familyLoading } = useFamily()
  const familyId = familyData?.family?.id ?? null
  const bothConnected = familyData?.bothConnected ?? false
  useRealtimeTransactions(bothConnected ? familyId : null)

  const { data: transactions = [], isLoading: listLoading } = useTransactions(familyId)
  const { data: rate } = useExchangeRate()
  const { baseCurrency } = useCurrencyStore()

  const [type, setType] = useState<TransactionType>('expense')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState<CurrencyCode>('KRW')
  const [memo, setMemo] = useState('')

  const addMutation = useMutation({
    mutationFn: async () => {
      const num = parseFloat(amount.replace(/,/g, ''))
      if (!familyId || Number.isNaN(num) || num <= 0) throw new Error('Invalid amount')
      const rateKrw = rate?.rateKrwPerCny ?? 192
      const amountBase = toBaseKrw(num, currency, rateKrw)
      return insertTransaction(familyId, {
        type,
        amount: num,
        currency,
        amount_base: amountBase,
        rate_at_transaction: currency === 'CNY' ? rateKrw : undefined,
        memo: memo.trim() || undefined,
      })
    },
    onSuccess: () => {
      setAmount('')
      setMemo('')
      queryClient.invalidateQueries({ queryKey: ['transactions', familyId] })
    },
  })

  // user1 / user2 선택 화면 (패스워드 없음)
  if (!user) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">거래내역</h2>
        <p className="text-slate-500 text-sm mb-6">누구로 들어갈까요?</p>
        <div className="flex gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={() => signIn('user1')}
            className="flex-1 py-4 rounded-2xl bg-primary text-white font-medium shadow-card hover:bg-primary-light transition-colors"
          >
            남편
          </button>
          <button
            type="button"
            onClick={() => signIn('user2')}
            className="flex-1 py-4 rounded-2xl bg-primary/90 text-white font-medium shadow-card hover:bg-primary-light transition-colors"
          >
            아내
          </button>
        </div>
      </div>
    )
  }

  if (familyLoading) {
    return (
      <div className="p-4">
        <p className="text-slate-600">로딩 중…</p>
      </div>
    )
  }

  if (familyId && !bothConnected && familyData) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 px-1">거래내역</h2>
        <WaitingForPartner family={familyData.family} />
      </div>
    )
  }

  if (!familyId) {
    return (
      <div className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 px-1">거래내역</h2>
        {!isSupabaseConfigured ? (
          <div className="rounded-2xl bg-amber-50 border border-amber-200/80 p-4 text-sm text-amber-800 space-y-3 shadow-card">
            <p className="font-medium">거래를 저장하려면 Supabase를 연결해 주세요.</p>
            <ol className="list-decimal list-inside space-y-2 text-amber-900">
              <li><a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a> 가입 후 <strong>New Project</strong> 생성</li>
              <li>왼쪽 메뉴 맨 아래 <strong>Project Settings</strong>(톱니바퀴 아이콘) 클릭 → 왼쪽에서 <strong>API</strong> 클릭</li>
              <li>
                <strong>Project URL</strong> 복사하기:
                <span className="block mt-1 text-amber-800">화면에 &quot;Project URL&quot; 이라고 써 있는 줄이 있어요. 그 옆에 <code className="bg-amber-100 px-1 rounded">https://xxxxx.supabase.co</code> 처럼 생긴 주소가 보이면, 그걸 클릭해서 전체 선택한 뒤 복사(Ctrl+C) 하세요. 이게 &quot;프로젝트 URL&quot; 이에요.</span>
              </li>
              <li>
                <strong>anon 키</strong> 복사하기:
                <span className="block mt-1 text-amber-800">같은 API 페이지를 조금 아래로 내리면 &quot;Project API keys&quot; 섹션이 있어요. 그 안에 <strong>anon</strong> / <strong>public</strong> 이라고 적힌 행이 있고, 오른쪽에 아주 긴 영어+숫자 문자열이 보여요. 그 옆 <strong>복사 아이콘</strong>을 누르거나, 긴 문자열을 드래그해서 Ctrl+C로 복사하세요. 이게 anon 키예요.</span>
              </li>
              <li>
                URL·anon 키 넣기:
                <span className="block mt-1 text-amber-800">
                  <strong>지금 이 주소(vercel.app)로 접속 중이라면</strong> → <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline">vercel.com</a> 로그인 → 이 프로젝트 선택 → <strong>Settings → Environment Variables</strong>에서 <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code>, <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> 추가 후 <strong>Deployments</strong>에서 Redeploy 한 번 하세요.
                </span>
                <span className="block mt-1 text-amber-800">
                  <strong>로컬(실행.bat)이라면</strong> → 프로젝트 폴더의 <code className="bg-amber-100 px-1 rounded">.env</code>에 <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL=</code>, <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY=</code> 넣고 저장 후 <strong>실행.bat</strong> 다시 실행하세요.
                </span>
              </li>
              <li>Supabase <strong>SQL Editor</strong>에서 <code className="bg-amber-100 px-1 rounded">docs/SUPABASE_SCHEMA.sql</code> 내용 실행</li>
            </ol>
          </div>
        ) : (
          <FamilyConnect />
        )}
      </div>
    )
  }

  const rateKrw = rate?.rateKrwPerCny ?? 192
  const totalKrw = transactions.reduce(
    (sum, t) =>
      sum +
      (t.amountBase ??
        (t.currency === 'KRW' ? t.amount : t.amount * (t.rateAtTransaction ?? rateKrw))),
    0
  )
  const totalCny = totalKrw / rateKrw

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">거래내역</h2>
        <span className="text-sm text-slate-500">{user.displayName}</span>
      </div>

      <section className="rounded-2xl bg-white border border-slate-200/60 p-4 shadow-card">
        <h3 className="text-sm font-medium text-slate-600 mb-3">내역 추가</h3>
        <div className="space-y-3">
          <div className="flex gap-2 p-1 rounded-xl bg-slate-100/80">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                type === 'expense' ? 'bg-rose-100 text-rose-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              지출
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                type === 'income' ? 'bg-emerald-100 text-emerald-800 shadow-sm' : 'text-slate-600'
              }`}
            >
              소득
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="금액"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition"
            />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 bg-white focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="KRW">₩ KRW</option>
              <option value="CNY">¥ CNY</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="메모 (선택)"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition"
          />
          <button
            type="button"
            onClick={() => addMutation.mutate()}
            disabled={addMutation.isPending || !amount.trim()}
            className="w-full py-2.5 rounded-xl bg-primary text-white font-medium disabled:opacity-50 hover:bg-primary-light transition-colors shadow-card"
          >
            {addMutation.isPending ? '저장 중…' : '추가'}
          </button>
        </div>
      </section>

      <section className="rounded-2xl bg-slate-100/80 border border-slate-200/60 p-4 shadow-card">
        <p className="text-xs text-slate-500 mb-1">현재 기준 통화 합계</p>
        <p className="text-lg font-semibold text-slate-800">
          {baseCurrency === 'KRW'
            ? `${totalKrw.toLocaleString('ko-KR')} ₩`
            : `${totalCny.toFixed(2)} ¥`}
        </p>
      </section>

      <section>
        <h3 className="text-sm font-medium text-slate-500 mb-2 px-1">최근 내역</h3>
        {listLoading ? (
          <p className="text-slate-500 text-sm">로딩 중…</p>
        ) : transactions.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200/60 p-6 text-center shadow-card">
            <p className="text-slate-500 text-sm">아직 내역이 없습니다.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li
                key={tx.id}
                className="flex justify-between items-start rounded-2xl bg-white border border-slate-200/60 p-3 shadow-card"
              >
                <div>
                  <p className={`font-medium ${tx.type === 'income' ? 'text-emerald-700' : 'text-slate-800'}`}>
                    {tx.type === 'income' ? '+' : '-'} {formatAmount(Math.abs(tx.amount), tx.currency)}
                  </p>
                  {tx.memo && <p className="text-xs text-slate-500">{tx.memo}</p>}
                  <p className="text-xs text-slate-400">{tx.userDisplayName} · {formatDate(tx.createdAt)}</p>
                </div>
                {tx.amountBase != null && (
                  <p className="text-xs text-slate-500">≈ {tx.amountBase.toLocaleString('ko-KR')} ₩</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
