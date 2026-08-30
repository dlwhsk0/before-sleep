import { useMemo, useState } from 'react'
import type { DailyRecord, WatchItem } from '../types'
import { todayKey } from '../lib/date'
import { nowMinutes } from '../lib/time'
import { NightCard } from './NightCard'
import { TonightPicker } from './TonightPicker'

type Props = {
  records: DailyRecord[]
  items: WatchItem[]
  onSaveRecord: (record: DailyRecord) => Promise<void>
  onAddItem: (
    text: string,
    note?: string,
    durationMinutes?: number,
    fetchedTitle?: string,
  ) => Promise<WatchItem>
  onUpdateItem: (item: WatchItem) => Promise<void>
  onRemoveItem: (id: string) => Promise<void> | void
}

/** 열려 있는 시트. 한 번에 하나만 뜬다. */
type Sheet = { kind: 'pick' } | { kind: 'edit'; item: WatchItem } | null

/**
 * 홈 = 밤마다 무엇을 틀었는지 쌓이는 카드 피드.
 *
 * 맨 위가 오늘 밤 카드고, 그 아래로 지난 밤들이 최신순으로 이어진다.
 * 대기 목록은 여기 깔지 않고 "고르기" 시트에 둔다.
 */
export function HomeFeed({
  records,
  items,
  onSaveRecord,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: Props) {
  const [sheet, setSheet] = useState<Sheet>(null)
  const today = todayKey()

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  const todayRecord = records.find((r) => r.date === today) ?? { date: today }

  // 지난 밤: 오늘 이전에서 "무엇을 틀었는지"가 있는 날만. 카드의 주인공이 영상이므로
  // 영상이 없는 날은 홈에 세우지 않는다(그 날들은 기록 탭에 있다).
  const past = useMemo(
    () =>
      records
        .filter((r) => r.date < today && r.watchItemId)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [records, today],
  )

  /**
   * 오늘 밤 영상을 고른다.
   *
   * 고른 시각을 "틀은 시각"의 기본값으로 함께 넣는다 — 카드를 만드는 때가 곧
   * 영상을 트는 때이므로. 이미 기록돼 있으면 덮어쓰지 않는다(기록 탭에서 고친 값 보존).
   */
  const pick = async (id: string) => {
    await onSaveRecord({
      ...todayRecord,
      watchItemId: id,
      sleepStart: todayRecord.sleepStart ?? nowMinutes(),
    })
  }

  /**
   * 영상을 지운다. 대기 목록에서 빼고, 그것을 가리키던 밤에서도 떼어낸다.
   * 참조만 남으면 카드가 빈 껍데기가 되므로 같이 정리한다.
   * 수면·체중 기록은 건드리지 않는다.
   */
  const deleteItem = async (item: WatchItem) => {
    for (const record of records) {
      if (record.watchItemId !== item.id) continue
      const next = { ...record }
      delete next.watchItemId
      await onSaveRecord(next)
    }
    await onRemoveItem(item.id)
  }

  return (
    <div className="flex flex-col gap-6">
      <NightCard
        record={todayRecord}
        item={todayRecord.watchItemId ? byId.get(todayRecord.watchItemId) : undefined}
        today
        onPick={todayRecord.watchItemId ? undefined : () => setSheet({ kind: 'pick' })}
        onActions={
          todayRecord.watchItemId && byId.get(todayRecord.watchItemId)
            ? () => setSheet({ kind: 'edit', item: byId.get(todayRecord.watchItemId!)! })
            : undefined
        }
      />

      {past.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="px-1 text-sm text-dim">지난 밤</h2>
          {past.map((record) => {
            const item = record.watchItemId ? byId.get(record.watchItemId) : undefined
            return (
              <NightCard
                key={record.date}
                record={record}
                item={item}
                onActions={item ? () => setSheet({ kind: 'edit', item }) : undefined}
              />
            )
          })}
        </section>
      )}

      {sheet && (
        <TonightPicker
          items={items}
          selectedId={todayRecord.watchItemId}
          editing={sheet.kind === 'edit' ? sheet.item : undefined}
          onUpdate={onUpdateItem}
          onDelete={deleteItem}
          onAdd={onAddItem}
          onSelect={pick}
          onRemove={onRemoveItem}
          onClose={() => setSheet(null)}
        />
      )}
    </div>
  )
}
