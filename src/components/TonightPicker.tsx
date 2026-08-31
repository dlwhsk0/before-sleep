import { useEffect, useRef, useState } from 'react'
import type { WatchItem } from '../types'
import { parseWatchItem } from '../lib/watchItem'
import { fetchYoutubeTitle } from '../lib/youtubeTitle'
import { formatHM } from '../lib/time'
import { todayKey } from '../lib/date'
import { Thumbnail } from './Thumbnail'

type Props = {
  items: WatchItem[]
  selectedId?: string
  /** 넘어오면 목록 없이 이 항목을 고치는 화면이 된다 */
  editing?: WatchItem
  onUpdate?: (item: WatchItem) => Promise<void>
  onDelete?: (item: WatchItem) => Promise<void>
  onAdd: (
    text: string,
    note?: string,
    durationMinutes?: number,
    fetchedTitle?: string,
  ) => Promise<WatchItem>
  /** 어느 밤에 붙일지. 날짜를 함께 넘긴다 (지난 밤도 기록할 수 있게) */
  onSelect: (id: string, date: string) => void
  onRemove: (id: string) => void
  onClose: () => void
}

/**
 * 영상 한 줄을 넣거나 고치는 시트.
 *
 * 추가할 때와 고칠 때가 **같은 화면**이다. 고치기가 처음 입력하던 모습과
 * 다르면 다시 배워야 하므로.
 *
 * 대기 목록은 홈에 상시로 깔지 않고 여기 담는다. 고칠 때는 목록을 숨긴다.
 */
export function TonightPicker({
  items,
  selectedId,
  editing,
  onUpdate,
  onDelete,
  onAdd,
  onSelect,
  onRemove,
  onClose,
}: Props) {
  const [text, setText] = useState(editing?.text ?? '')
  const [note, setNote] = useState(editing?.note ?? '')
  // 러닝 타임은 자동으로 알 수 없다(oEmbed가 길이를 주지 않음). 직접 넣는다.
  const [hours, setHours] = useState(
    editing?.durationMinutes ? String(Math.floor(editing.durationMinutes / 60)) : '',
  )
  const [minutes, setMinutes] = useState(
    editing?.durationMinutes ? String(editing.durationMinutes % 60) : '',
  )
  // 유튜브에서 자동으로 받아온 제목. 직접 쓴 제목이 없을 때만 쓰인다.
  const [fetchedTitle, setFetchedTitle] = useState(editing?.fetchedTitle ?? '')
  // 어느 밤 기록인지. 오늘이 기본이고 지난 날짜도 고를 수 있다.
  const [date, setDate] = useState(todayKey())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const trimmed = text.trim()
  const parsedNow = trimmed ? parseWatchItem(trimmed) : null
  const youtubeId = parsedNow?.youtubeId

  // 유튜브 링크를 넣으면 제목을 대신 받아온다. 입력이 멎은 뒤에 한 번만 부른다.
  useEffect(() => {
    if (!youtubeId || !parsedNow?.url) {
      setFetchedTitle('')
      return
    }
    let cancelled = false
    const url = parsedNow.url
    const id = setTimeout(() => {
      void fetchYoutubeTitle(url).then((t) => {
        if (!cancelled) setFetchedTitle(t ?? '')
      })
    }, 400)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
    // parsedNow는 text에서 파생되므로 유튜브 ID만 의존성으로 둔다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youtubeId])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trimmed) return
    const total = (Number(hours) || 0) * 60 + (Number(minutes) || 0)

    if (editing && onUpdate) {
      const next: WatchItem = { ...editing, text: trimmed }
      if (note.trim()) next.note = note.trim()
      else delete next.note
      if (total > 0) next.durationMinutes = total
      else delete next.durationMinutes
      if (fetchedTitle.trim()) next.fetchedTitle = fetchedTitle.trim()
      else delete next.fetchedTitle
      await onUpdate(next)
      onClose()
      return
    }

    const item = await onAdd(trimmed, note, total || undefined, fetchedTitle)
    setText('')
    setNote('')
    setHours('')
    setMinutes('')
    setFetchedTitle('')
    onSelect(item.id, date)
  }

  const preview = trimmed ? parseWatchItem(trimmed, note, fetchedTitle) : null
  const previewDuration = (Number(hours) || 0) * 60 + (Number(minutes) || 0)
  const waiting = items.filter((i) => !i.archived)

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
          <h2 className="text-sm text-ink">{editing ? '수정' : '오늘 밤 뭘 틀까'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[0.8125rem] text-dim transition-colors hover:text-ink"
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
                fallbackClassName="flex aspect-video w-full items-center justify-center rounded-lg bg-surface-2 text-[0.6875rem] text-faint"
              />
              <p className="truncate px-1 text-[0.8125rem] text-ink">
                {preview.title ?? '제목 없음'}
                {previewDuration > 0 && (
                  <span className="tnum ml-2 text-[0.6875rem] text-faint">
                    {formatHM(previewDuration)}
                  </span>
                )}
              </p>
            </div>
          )}

          {!editing && (
            <label className="flex items-center gap-2">
              <span className="text-[0.8125rem] text-dim">어느 밤</span>
              <input
                type="date"
                value={date}
                max={todayKey()}
                onChange={(e) => setDate(e.target.value || todayKey())}
                className="tnum rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-base text-ink"
              />
            </label>
          )}

          <input
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="링크를 붙여넣거나 제목을 쓰세요"
            className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-base text-ink placeholder:text-faint"
          />

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={fetchedTitle ? `제목 (비워두면 "${fetchedTitle}")` : '제목 (선택)'}
            className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-base text-ink placeholder:text-faint"
          />

          <div className="flex items-center gap-2">
            <span className="text-[0.8125rem] text-dim">길이</span>
            <input
              value={hours}
              onChange={(e) => setHours(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              placeholder="0"
              aria-label="러닝 타임 시간"
              className="tnum w-12 rounded-lg border border-line bg-surface-2 px-2 py-2.5 text-center text-base text-ink placeholder:text-faint"
            />
            <span className="text-[0.8125rem] text-dim">시간</span>
            <input
              value={minutes}
              onChange={(e) => setMinutes(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              placeholder="0"
              aria-label="러닝 타임 분"
              className="tnum w-12 rounded-lg border border-line bg-surface-2 px-2 py-2.5 text-center text-base text-ink placeholder:text-faint"
            />
            <span className="text-[0.8125rem] text-dim">분</span>
            <button
              type="submit"
              disabled={!trimmed}
              className="ml-auto shrink-0 rounded-lg bg-accent px-4 py-2.5 text-[0.8125rem] text-bg transition-opacity disabled:opacity-40"
            >
              {editing ? '저장' : '추가'}
            </button>
          </div>

          {editing && onDelete && (
            <button
              type="button"
              onClick={() => void onDelete(editing).then(onClose)}
              className="self-start px-1 py-2 text-[0.8125rem] text-danger transition-opacity hover:opacity-70"
            >
              삭제
            </button>
          )}
        </form>

        <div className={`flex flex-col gap-2 overflow-y-auto ${editing ? 'hidden' : ''}`}>
          {waiting.length === 0 ? (
            <p className="py-8 text-center text-[0.8125rem] text-faint">
              대기 목록이 비어 있어요. 위에 하나 추가해 보세요.
            </p>
          ) : (
            waiting.map((item) => {
              const parsed = parseWatchItem(item.text, item.note, item.fetchedTitle)
              const selected = item.id === selectedId
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item.id, date)
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
                      <span className="block truncate text-[0.8125rem] text-ink">
                        {parsed.label}
                      </span>
                      {item.durationMinutes && (
                        <span className="tnum block text-[0.6875rem] text-faint">
                          {formatHM(item.durationMinutes)}
                        </span>
                      )}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    aria-label={`${parsed.label} 지우기`}
                    className="shrink-0 px-1 text-[0.6875rem] text-faint transition-colors hover:text-danger"
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
