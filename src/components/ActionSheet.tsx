import { useEffect } from 'react'

export type Action = {
  label: string
  onSelect: () => void
  /** 되돌리기 어려운 동작은 경고색으로 */
  danger?: boolean
}

type Props = {
  title: string
  actions: Action[]
  onClose: () => void
}

/** 카드를 길게 눌렀을 때 올라오는 동작 목록. */
export function ActionSheet({ title, actions, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

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
        aria-label={title}
        className="relative mx-auto w-full max-w-md rounded-t-2xl border-t border-line bg-surface p-3 pb-8"
      >
        <p className="px-3 py-2 text-xs text-faint">{title}</p>
        <div className="flex flex-col">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                a.onSelect()
                onClose()
              }}
              className={`rounded-lg px-3 py-3 text-left text-sm transition-colors hover:bg-surface-2 ${
                a.danger ? 'text-danger' : 'text-ink'
              }`}
            >
              {a.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onClose}
            className="mt-1 rounded-lg px-3 py-3 text-left text-sm text-dim transition-colors hover:bg-surface-2"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}
