import { useEffect, useState } from 'react'
import type { DailyRecord } from '../types'
import { todayKey } from '../lib/date'

/**
 * 오늘 기록 입력 폼. 오늘 날짜로 고정된다.
 * 이미 오늘 기록이 있으면 그 값을 채워 수정 모드로 동작한다.
 */
export function TodayForm({
  existing,
  onSave,
}: {
  existing: DailyRecord | undefined
  onSave: (record: DailyRecord) => Promise<void>
}) {
  const [sleep, setSleep] = useState('')
  const [weight, setWeight] = useState('')
  const [saving, setSaving] = useState(false)

  // 오늘 기록이 로드되면 폼에 채운다.
  useEffect(() => {
    setSleep(existing ? String(existing.sleepHours) : '')
    setWeight(existing ? String(existing.weightKg) : '')
  }, [existing])

  const sleepNum = Number(sleep)
  const weightNum = Number(weight)
  const valid =
    sleep !== '' &&
    weight !== '' &&
    !Number.isNaN(sleepNum) &&
    !Number.isNaN(weightNum) &&
    sleepNum >= 0 &&
    sleepNum <= 24 &&
    weightNum > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || saving) return
    setSaving(true)
    try {
      await onSave({
        date: todayKey(),
        sleepHours: sleepNum,
        weightKg: weightNum,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-50">
          오늘 기록
        </h2>
        <span className="text-xs text-neutral-400">{todayKey()}</span>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-neutral-500">수면 시간 (시간)</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          max="24"
          value={sleep}
          onChange={(e) => setSleep(e.target.value)}
          placeholder="예: 7.5"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-lg outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-100"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-neutral-500">몸무게 (kg)</span>
        <input
          type="number"
          inputMode="decimal"
          step="0.1"
          min="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="예: 68.2"
          className="rounded-lg border border-neutral-300 px-3 py-2 text-lg outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-neutral-100"
        />
      </label>

      <button
        type="submit"
        disabled={!valid || saving}
        className="rounded-lg bg-neutral-900 px-4 py-2.5 font-medium text-white transition-opacity disabled:opacity-40 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {saving ? '저장 중…' : existing ? '오늘 기록 수정' : '오늘 기록 저장'}
      </button>
    </form>
  )
}
