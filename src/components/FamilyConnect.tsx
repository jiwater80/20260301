import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createFamily, joinFamily, setStoredFamilyId } from '@/api/families'
import { useAuth } from '@/hooks/useAuth'

const FAMILY_QUERY_KEY = ['myFamily'] as const

type Step = 'choose' | 'created' | 'join'

export default function FamilyConnect() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('choose')
  const [inviteCode, setInviteCode] = useState('')
  const [createdFamilyId, setCreatedFamilyId] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCreate = async () => {
    setCreating(true)
    setJoinError(null)
    try {
      const result = await createFamily()
      if (result) {
        setInviteCode(result.inviteCode)
        setCreatedFamilyId(result.family.id)
        setStep('created')
      } else {
        setJoinError('가족 만들기에 실패했어요. 다시 시도해 주세요.')
      }
    } finally {
      setCreating(false)
    }
  }

  const handleJoin = async () => {
    const code = joinCode.trim()
    if (!code) {
      setJoinError('초대 코드를 입력해 주세요.')
      return
    }
    setJoining(true)
    setJoinError(null)
    try {
      const result = await joinFamily(code)
      if (result) {
        await queryClient.invalidateQueries({ queryKey: FAMILY_QUERY_KEY })
      } else {
        setJoinError('초대 코드가 맞지 않아요. 코드를 확인해 주세요.')
      }
    } finally {
      setJoining(false)
    }
  }

  const copyCode = () => {
    if (!inviteCode) return
    navigator.clipboard.writeText(inviteCode).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!user) return null

  if (step === 'created') {
    return (
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 shadow-card">
        <p className="font-medium text-emerald-800 mb-2">가족이 만들어졌어요</p>
        <p className="text-sm text-emerald-700 mb-3">
          아래 초대 코드를 <strong>아내/남편</strong>에게 알려주세요. 상대방이 앱에서 이 코드를 입력하면 같은 가계부를 함께 쓸 수 있어요.
        </p>
        <div className="flex items-center gap-2 mb-3">
          <code className="flex-1 rounded-xl bg-white border border-emerald-200 px-4 py-3 text-lg font-mono font-bold text-emerald-800 tracking-wider">
            {inviteCode}
          </code>
          <button
            type="button"
            onClick={copyCode}
            className="py-3 px-4 rounded-xl bg-emerald-600 text-white text-sm font-medium whitespace-nowrap"
          >
            {copied ? '복사됨!' : '복사'}
          </button>
        </div>
        <p className="text-xs text-emerald-600 mb-4">
          상대방이 참여하면 자동으로 연동됩니다.
        </p>
        <button
          type="button"
          onClick={() => {
            if (createdFamilyId) {
              setStoredFamilyId(createdFamilyId)
              queryClient.invalidateQueries({ queryKey: FAMILY_QUERY_KEY })
            }
          }}
          className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-medium"
        >
          시작하기
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200/60 p-5 shadow-card space-y-5">
      <div>
        <h3 className="font-semibold text-slate-800 mb-1">둘이 함께 쓰려면</h3>
        <p className="text-sm text-slate-600">
          한 명이 <strong>가족 만들기</strong> 후 초대 코드를 전달하고, 다른 한 명이 <strong>초대 코드로 참여</strong>하면 같은 가계부가 연동돼요.
        </p>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="flex-1 py-3 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
        >
          {creating ? '만드는 중…' : '가족 만들기'}
        </button>
        <button
          type="button"
          onClick={() => setStep('join')}
          className="flex-1 py-3 rounded-xl border-2 border-primary text-primary font-medium"
        >
          초대 코드로 참여
        </button>
      </div>

      {step === 'join' && (
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <label className="text-sm font-medium text-slate-700">초대 코드 입력</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase())
                setJoinError(null)
              }}
              placeholder="예: HANCN1A2B3C"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 font-mono uppercase"
              maxLength={14}
            />
            <button
              type="button"
              onClick={handleJoin}
              disabled={joining || !joinCode.trim()}
              className="py-2.5 px-4 rounded-xl bg-primary text-white font-medium disabled:opacity-50"
            >
              {joining ? '참여 중…' : '참여하기'}
            </button>
          </div>
          {joinError && <p className="text-sm text-rose-600">{joinError}</p>}
        </div>
      )}
    </div>
  )
}
