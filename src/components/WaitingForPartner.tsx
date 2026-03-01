import { useState } from 'react'
import type { Family } from '@/types'

interface Props {
  family: Family
}

export default function WaitingForPartner({ family }: Props) {
  const [copied, setCopied] = useState(false)
  const code = family.invite_code ?? ''

  const copyCode = () => {
    if (!code) return
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 shadow-card">
      <p className="font-medium text-amber-800 mb-2">상대방이 참여할 때까지 기다려 주세요</p>
      <p className="text-sm text-amber-700 mb-4">
        아래 초대 코드를 <strong>아내/남편</strong>에게 전달하세요. 상대방이 앱에서 이 코드를 입력하면 연동되고, 그때부터 대시보드와 거래내역을 함께 쓸 수 있어요.
      </p>
      <div className="flex items-center gap-2 mb-4">
        <code className="flex-1 rounded-xl bg-white border border-amber-200 px-4 py-3 text-lg font-mono font-bold text-amber-800 tracking-wider">
          {code}
        </code>
        <button
          type="button"
          onClick={copyCode}
          className="py-3 px-4 rounded-xl bg-amber-600 text-white text-sm font-medium whitespace-nowrap"
        >
          {copied ? '복사됨!' : '복사'}
        </button>
      </div>
      <p className="text-xs text-amber-600">
        상대방이 참여하면 자동으로 화면이 바뀝니다. (잠시만 기다려 주세요)
      </p>
    </div>
  )
}
