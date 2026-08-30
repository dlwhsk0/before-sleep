import { useState } from 'react'
import type { Memo } from '../types'
import { todayKey } from '../lib/date'

const dateFormat = new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' })

function formatDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return dateFormat.format(new Date(y, m - 1, d))
}

type Props = {
  memos: Memo[]
  onAdd: (text: string, date?: string) => Promise<void>
  onRemove: (id: string) => void
}

/**
 * 메모보드 — 네모난 메모를 2열로 쌓는다.
 *
 * 기본은 날짜 없는 자유 메모고, 원하면 오늘 날짜를 달 수 있다.
 */
export function MemoBoard({ memos, onAdd, onRemove }: Props) {
  const [text, setText] = useState('')
  const [withDate, setWithDate] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    await onAdd(text, withDate ? todayKey() : undefined)
    setText('')
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={submit} className="flex flex-col gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            // 줄바꿈은 그대로 두고, ⌘/Ctrl+Enter로 저장
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void submit(e)
          }}
          rows={2}
          placeholder="떠오른 것을 적어 두세요"
          className="w-full resize-none rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-base text-ink placeholder:text-faint"
        />
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-[0.6875rem] text-dim">
            <input
              type="checkbox"
              checked={withDate}
              onChange={(e) => setWithDate(e.target.checked)}
              className="accent-accent"
            />
            오늘 날짜 달기
          </label>
          <button
            type="submit"
            disabled={!text.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-[0.8125rem] text-bg transition-opacity disabled:opacity-40"
          >
            붙이기
          </button>
        </div>
      </form>

      {memos.length === 0 ? (
        <p className="py-12 text-center text-[0.8125rem] text-faint">
          아직 메모가 없어요. 위에 하나 적어 보세요.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {memos.map((memo) => (
            <div
              key={memo.id}
              className="group flex min-h-24 flex-col justify-between gap-2 rounded-lg border border-line bg-surface p-3"
            >
              <p className="text-[0.8125rem] leading-snug whitespace-pre-wrap text-ink">
                {memo.text}
              </p>
              <div className="flex items-baseline justify-between gap-2">
                <span className="tnum text-[0.6875rem] text-faint">
                  {memo.date ? formatDateKey(memo.date) : ''}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(memo.id)}
                  aria-label="메모 지우기"
                  className="text-[0.6875rem] text-faint transition-colors hover:text-danger"
                >
                  지우기
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
