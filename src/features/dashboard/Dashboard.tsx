import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts'
import { useFamily, useTransactions, useExchangeRate } from '@/hooks'
import { useCurrencyStore } from '@/stores'
import { groupTransactionsByPeriod, getTotals, type PeriodType } from '@/utils/aggregate'

export default function Dashboard() {
  const { data: familyData } = useFamily()
  const familyId = familyData?.family?.id ?? null
  const { data: transactions = [], isLoading } = useTransactions(familyId)
  const { data: rate } = useExchangeRate()
  const { baseCurrency } = useCurrencyStore()

  const [period, setPeriod] = useState<PeriodType>('month')
  const rateKrw = rate?.rateKrwPerCny ?? 192

  const byPeriod = groupTransactionsByPeriod(transactions, period, rateKrw)
  const totals = getTotals(transactions, rateKrw)

  const chartData = byPeriod.map((row) => ({
    name: row.periodLabel,
    소득_원: Math.round(row.incomeBase),
    지출_원: Math.round(row.expenseBase),
    소득_위안: Number(row.incomeCny.toFixed(2)),
    지출_위안: Number(row.expenseCny.toFixed(2)),
  }))

  const formatBase = (v: number) =>
    baseCurrency === 'KRW'
      ? `${v.toLocaleString('ko-KR')} ₩`
      : `${(v / rateKrw).toFixed(2)} ¥`

  if (!familyId) {
    return (
      <div className="p-5">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">대시보드</h2>
        <div className="rounded-2xl bg-slate-100/80 p-6 text-center">
          <p className="text-slate-600 text-sm">가족에 참여한 뒤 대시보드를 이용할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold text-slate-800 px-1">대시보드</h2>

      {/* 기간 선택 */}
      <section>
        <div className="flex gap-2 p-1 rounded-xl bg-slate-100/80">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? 'bg-primary text-white shadow-card'
                  : 'text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {p === 'day' ? '일간' : p === 'week' ? '주간' : '월간'}
            </button>
          ))}
        </div>
      </section>

      {/* 합계 카드 */}
      <section className="grid grid-cols-1 gap-3">
        <h3 className="text-sm font-medium text-slate-500 px-1 col-span-full">전체 소득 · 지출</h3>
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-50/50 border border-emerald-100 p-4 shadow-card">
          <p className="text-xs font-medium text-emerald-600 mb-1">총 소득</p>
          <p className="text-slate-500 text-sm">
            {totals.incomeKrw.toLocaleString('ko-KR')} ₩ / {totals.incomeCny.toFixed(2)} ¥
          </p>
          <p className="text-lg font-semibold text-slate-800 mt-1.5">
            통합: {formatBase(totals.incomeBase)}
          </p>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-rose-50/50 border border-rose-100 p-4 shadow-card">
          <p className="text-xs font-medium text-rose-600 mb-1">총 지출</p>
          <p className="text-slate-500 text-sm">
            {totals.expenseKrw.toLocaleString('ko-KR')} ₩ / {totals.expenseCny.toFixed(2)} ¥
          </p>
          <p className="text-lg font-semibold text-slate-800 mt-1.5">
            통합: {formatBase(totals.expenseBase)}
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100/80 border border-slate-200/60 p-4 shadow-card">
          <p className="text-xs font-medium text-slate-500 mb-1">순계 (기준 통화)</p>
          <p className="text-lg font-semibold text-slate-800">
            {formatBase(totals.incomeBase - totals.expenseBase)}
          </p>
        </div>
      </section>

      {/* 차트 */}
      <section>
        <h3 className="text-sm font-medium text-slate-500 mb-3 px-1">
          기간별 소득·지출 ({period === 'day' ? '일' : period === 'week' ? '주' : '월'} 단위)
        </h3>
        {isLoading ? (
          <div className="rounded-2xl bg-white border border-slate-200/60 p-8 text-center shadow-card">
            <p className="text-slate-500 text-sm">로딩 중…</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200/60 p-8 text-center shadow-card">
            <p className="text-slate-500 text-sm">표시할 데이터가 없습니다.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200/60 p-4 shadow-card overflow-hidden">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
                  <Tooltip
                    formatter={(value: number) => value.toLocaleString('ko-KR')}
                    labelFormatter={(label) => `기간: ${label}`}
                    contentStyle={{ borderRadius: '0.75rem' }}
                  />
                  <Legend />
                  <Bar dataKey="소득_원" fill="#10b981" name="소득 (원)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="지출_원" fill="#f43f5e" name="지출 (원)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
