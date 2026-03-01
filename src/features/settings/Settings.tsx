import { useState } from 'react'
import { useAuth, useExchangeRate, useFamily } from '@/hooks'
import { useCurrencyStore } from '@/stores'
import { isSupabaseConfigured, supabase } from '@/api/supabase'
import type { CurrencyCode } from '@/types'

export default function Settings() {
  const { user, signOut } = useAuth()
  const { data: _familyData } = useFamily() // 가족 데이터 로드 (캐시 유지)
  const { data: rate, isLoading, isError } = useExchangeRate()
  const { baseCurrency, setBaseCurrency } = useCurrencyStore()
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)

  const testConnection = async () => {
    setTestResult(null)
    setTesting(true)
    try {
      if (!isSupabaseConfigured) {
        setTestResult('❌ .env에 URL/키가 없어요. .env 저장 후 앱을 완전히 끄고 실행.bat 다시 실행하세요.')
        return
      }
      const { error } = await supabase.from('families').select('id').limit(1)
      if (error) {
        setTestResult(`❌ 연결 실패: ${error.message}. SQL 스키마를 Supabase SQL Editor에서 실행했는지 확인하세요.`)
        return
      }
      setTestResult('✅ 연결 성공! 거래 저장이 가능해요.')
    } catch (e) {
      setTestResult('❌ 오류: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-semibold text-slate-800">설정</h2>

      <section className="rounded-lg bg-slate-100 p-4">
        <h3 className="text-sm font-medium text-slate-700 mb-2">Supabase 연결 확인</h3>
        <p className="text-xs text-slate-600 mb-2">
          .env 로드: {isSupabaseConfigured ? '됨' : '안 됨 (앱 재시작 필요)'}
        </p>
        <button
          type="button"
          onClick={testConnection}
          disabled={testing}
          className="py-2 px-4 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50"
        >
          {testing ? '확인 중…' : '연결 테스트'}
        </button>
        {testResult && (
          <p className="mt-2 text-sm whitespace-pre-wrap break-words">{testResult}</p>
        )}
      </section>

      <section>
        <h3 className="text-sm font-medium text-slate-600 mb-2">기준 통화 (합산 표시)</h3>
        <div className="flex gap-3">
          {(['KRW', 'CNY'] as CurrencyCode[]).map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setBaseCurrency(code)}
              className={`flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-colors ${
                baseCurrency === code
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {code === 'KRW' ? '원화 (₩)' : '위안 (¥)'}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          대시보드·합산 금액을 이 통화로 표시합니다.
        </p>
      </section>

      <section>
        <h3 className="text-sm font-medium text-slate-600 mb-2">현재 환율</h3>
        <div className="rounded-lg bg-slate-100 p-4">
          {isLoading && (
            <p className="text-sm text-slate-500">환율 조회 중…</p>
          )}
          {isError && (
            <p className="text-sm text-amber-700">환율을 불러오지 못했습니다. 기본값을 사용합니다.</p>
          )}
          {!isLoading && (
            <>
              <p className="text-lg font-semibold text-slate-800">
                1 ¥ (CNY) = {rate.rateKrwPerCny.toLocaleString('ko-KR')} ₩ (KRW)
              </p>
              <p className="text-xs text-slate-500 mt-1">
                기준일: {rate.date} · {rate.source === 'api' ? '실시간' : rate.source === 'cache' ? '캐시' : '기본값'}
              </p>
            </>
          )}
        </div>
      </section>

      {user && (
        <section>
          <h3 className="text-sm font-medium text-slate-600 mb-2">들어온 계정</h3>
          <p className="text-slate-800 font-medium mb-2">{user.displayName}</p>
          <button
            type="button"
            onClick={() => signOut()}
            className="py-2 px-4 rounded-lg border border-slate-300 text-slate-700 text-sm"
          >
            나가기 (다른 사람으로 들어가기)
          </button>
        </section>
      )}
    </div>
  )
}
