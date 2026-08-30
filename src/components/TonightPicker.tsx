import { useEffect, useRef, useState } from 'react'
import type { WatchItem } from '../types'
import { parseWatchItem } from '../lib/watchItem'
import { formatHM } from '../lib/time'
import { Thumbnail } from './Thumbnail'

type Props = {
  items: WatchItem[]
  selectedId?: string
  onAdd: (text: string, note?: string, durationMinutes?: number) => Promise<WatchItem>
  onSelect: (id: string) => void
  onRemove: (id: string) => void
  onClose: () => void
}

/**
 * "오늘 밤 뭘 틀지" 고르는 시트.
 *
 * 대기 목록을 홈에 상시로 깔지 않고 여기 담는다. 홈은 카드 피드만 보이게 두고,
 * 대기 목록은 고를 때만 필요하기 때문.
 */
export function TonightPicker({
  items,
  selectedId,
  onAdd,
  onSelect,
  onRemove,
  onClose,
}: Props) {
  const [text, setText] = useState('')
  const [note, setNote] = useState('')
  // 러닝 타임은 자동으로 알 수 없다(유튜브 oEmbed가 길이를 주지 않음). 직접 넣는다.
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const total = (Number(hours) || 0) * 60 + (Number(minutes) || 0)
    const item = await onAdd(text, note, total || undefined)
    setText('')
    setNote('')
    setHours('')
    setMinutes('')
    onSelect(item.id)
  }

  const waiting = items.filter((i) => !i.archived)

  // 입력한 한 줄을 그대로 해석해 미리 보여준다. 저장 전에 "이 링크가 맞나"를
  // 확인할 수 있어야 해서. 파싱은 순수 함수라 네트워크 호출이 없다.
  const preview = text.trim() ? parseWatchItem(text, note) : null
  const previewDuration = (Number(hours) || 0) * 60 + (Number(minutes) || 0)

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end">
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative mx-auto flex max-h-[85vh] w-full max-w-md flex-col gap-4 rounded-t-2xl border-t border-line bg-surface p-5 pb-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-base text-ink">오늘 밤 뭘 틀까</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-dim transition-colors hover:text-ink"
          >
            닫기
          </button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-2">
          {preview?.isUrl && (
            <div className="flex flex-col gap-2">
              <Thumbnail
                src={preview.thumbnailUrl}
                fallback={preview.host}
                className="aspect-video w-full rounded-lg bg-surface-2 object-cover"
                fallbackClassName="flex aspect-video w-full items-center justify-center rounded-lg bg-surface-2 text-xs text-faint"
              />
              <p className="truncate px-1 text-sm text-ink">
                {preview.label}
                {previewDuration > 0 && (
                  <span className="tnum ml-2 text-xs text-faint">
                    {formatHM(previewDuration)}
                  </span>
                )}
              </p>
            </div>
          )}

          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="링크를 붙여넣거나 제목을 쓰세요"
            className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink placeholder:text-faint"
          />
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="제목 (링크를 넣었을 때만, 선택)"
            className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-sm text-ink placeholder:text-faint"
          />

          <div className="flex items-center gap-2">
            <span className="text-sm text-dim">길이</span>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              placeholder="0"
              aria-label="러닝 타임 시간"
              className="tnum w-12 rounded-lg border border-line bg-surface-2 px-2 py-2.5 text-center text-sm text-ink placeholder:text-faint"
            />
            <span className="text-sm text-dim">시간</span>
            <input
              value={minutes}
              onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              placeholder="0"
              aria-label="러닝 타임 분"
              className="tnum w-12 rounded-lg border border-line bg-surface-2 px-2 py-2.5 text-center text-sm text-ink placeholder:text-faint"
            />
            <span className="text-sm text-dim">분</span>
            <button
              type="submit"
              disabled={!text.trim()}
              className="ml-auto shrink-0 rounded-lg bg-accent px-4 py-2.5 text-sm text-bg transition-opacity disabled:opacity-40"
            >
              추가
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {waiting.length === 0 ? (
            <p className="py-8 text-center text-sm text-faint">
              대기 목록이 비어 있어요. 위에 하나 추가해 보세요.
            </p>
          ) : (
            waiting.map((item) => {
              const parsed = parseWatchItem(item.text, item.note)
              const selected = item.id === selectedId
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item.id)
                      onClose()
                    }}
                    className={`flex min-w-0 flex-1 items-center gap-3 rounded-lg border p-2 text-left transition-colors ${
                      selected
                        ? 'border-accent-soft bg-surface-2'
                        : 'border-line hover:bg-surface-2'
                    }`}
                  >
                    <Thumbnail
                      src={parsed.thumbnailUrl}
                      fallback={parsed.host ?? '제목'}
                      className="h-12 w-20 shrink-0 rounded bg-surface-2 object-cover"
                      fallbackClassName="flex h-12 w-20 shrink-0 items-center justify-center rounded bg-surface-2 text-[0.625rem] text-faint"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-ink">
                        {parsed.label}
                      </span>
                      {item.durationMinutes && (
                        <span className="tnum block text-xs text-faint">
                          {formatHM(item.durationMinutes)}
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    aria-label={`${parsed.label} 지우기`}
                    className="shrink-0 px-1 text-xs text-faint transition-colors hover:text-danger"
                  >
                    지우기
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
