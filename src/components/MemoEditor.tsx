import { useEffect, useRef, useState } from 'react'
import type { Memo } from '../types'

type Props = {
  memo: Memo
  onSave: (memo: Memo) => Promise<void>
  onDelete: (id: string) => Promise<void> | void
  onClose: () => void
}

/**
 * 메모 하나를 고치는 시트.
 *
 * 붙일 때와 같은 모양(여러 줄 입력 + 버튼)이다. 삭제는 여기 안에만 둔다 —
 * 보드에 지우기 버튼을 박아 두면 실수로 눌러 날린다.
 */
export function MemoEditor({ memo, onSave, onDelete, onClose }: Props) {
  const [text, setText] = useState(memo.text)
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const save = async () => {
    if (!text.trim()) return
    await onSave({ ...memo, text: text.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-label="메모 수정"
        className="relative mx-auto flex w-full max-w-md flex-col gap-3 rounded-t-2xl border-t border-line bg-surface p-5 pb-8"
      >
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm text-ink">메모 수정</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[0.8125rem] text-dim transition-colors hover:text-ink"
          >
            닫기
          </button>
        </div>

        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void save()
          }}
          rows={5}
          className="w-full resize-none rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-base text-ink placeholder:text-faint"
        />

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => void Promise.resolve(onDelete(memo.id)).then(onClose)}
            className="px-1 py-2 text-[0.8125rem] text-danger transition-opacity hover:opacity-70"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={() => void save()}
            disabled={!text.trim()}
            className="rounded-lg bg-accent px-4 py-2 text-[0.8125rem] text-bg transition-opacity disabled:opacity-40"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  )
}
