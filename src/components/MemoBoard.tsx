import { useState } from 'react'
import type { Memo } from '../types'
import { todayKey } from '../lib/date'
import { useLongPress } from '../hooks/useLongPress'
import { MemoEditor } from './MemoEditor'

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

function formatDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return dateFormat.format(new Date(y, m - 1, d))
}

/**
 * 메모 한 장.
 *
 * 높이는 글자 길이에 그대로 따라가지 않는다. 짧아도 최소 높이를 지키고,
 * 길면 여덟 줄에서 자른다 — 한 장이 화면을 다 먹으면 보드가 아니게 된다.
 * 전문은 길게 눌러 수정 화면에서 본다.
 */
function MemoCard({ memo, onEdit }: { memo: Memo; onEdit: () => void }) {
  const press = useLongPress(onEdit)

  return (
    <div
      // columns 레이아웃에서 한 장이 두 열에 걸쳐 쪼개지지 않게 한다.
      className="mb-3 flex min-h-22 break-inside-avoid flex-col justify-between gap-2 rounded-xl border border-line bg-surface p-3"
      aria-label={`${memo.text.slice(0, 30)} — 수정`}
      {...press.handlers}
    >
      <p className="line-clamp-8 text-[0.8125rem] leading-snug whitespace-pre-wrap text-ink">
        {memo.text}
      </p>
      {memo.date && (
        <span className="tnum text-[0.6875rem] text-faint">
          {formatDateKey(memo.date)}
        </span>
      )}
    </div>
  )
}

type Props = {
  memos: Memo[]
  onAdd: (text: string, date: string) => Promise<void>
  onUpdate: (memo: Memo) => Promise<void>
  onRemove: (id: string) => Promise<void> | void
}

/**
 * 메모보드 — 네모난 메모를 2열로 쌓는다.
 *
 * grid가 아니라 CSS columns를 쓴다. grid는 한 행의 높이를 서로 맞춰 버려서
 * 짧은 메모 옆에 빈 공간이 생기는데, columns는 위에서 아래로 흘려 담아
 * 두 열이 자연스럽게 엇갈린다.
 *
 * 날짜는 항상 붙는다(연도까지). 고를 일이 아니라 기록의 일부다.
 */
export function MemoBoard({ memos, onAdd, onUpdate, onRemove }: Props) {
  const [text, setText] = useState('')
  const [editing, setEditing] = useState<Memo | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    await onAdd(text, todayKey())
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
        <button
          type="submit"
          disabled={!text.trim()}
          className="self-end rounded-lg bg-accent px-4 py-2 text-[0.8125rem] text-bg transition-opacity disabled:opacity-40"
        >
          붙이기
        </button>
      </form>

      {memos.length === 0 ? (
        <p className="py-12 text-center text-[0.8125rem] text-faint">
          아직 메모가 없어요. 위에 하나 적어 보세요.
        </p>
      ) : (
        <div className="columns-2 gap-3">
          {memos.map((memo) => (
            <MemoCard key={memo.id} memo={memo} onEdit={() => setEditing(memo)} />
          ))}
        </div>
      )}

      {editing && (
        <MemoEditor
          memo={editing}
          onSave={onUpdate}
          onDelete={onRemove}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
