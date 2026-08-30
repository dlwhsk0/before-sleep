/**
 * 화면을 채워 보기 위한 예시 데이터. **개발 중에만** 쓴다.
 *
 * 빈 화면으로는 카드 간격·썸네일 비율·2열 메모보드가 어떻게 보이는지 판단할 수
 * 없어서 넣었다. 넣은 것만 정확히 지울 수 있도록 id에 접두어를 붙인다.
 * 이미 기록이 있는 날짜는 건드리지 않는다.
 */
import type { DailyRecord, Memo, WatchItem } from '../types'
import {
  deleteMemo,
  deleteWatchItem,
  getAllMemos,
  getAllRecords,
  getAllWatchItems,
  putMemo,
  putRecord,
  putWatchItem,
  deleteRecord,
} from './db'
import { addDaysToKey, todayKey } from './date'

const PREFIX = 'sample-'

const WATCH_ITEMS: { id: string; text: string; note?: string; durationMinutes?: number }[] = [
  {
    id: `${PREFIX}lofi`,
    text: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    note: 'lofi 라디오 — 끝이 없어서 좋음',
  },
  {
    id: `${PREFIX}rain`,
    text: 'https://youtu.be/mPZkdNFkNps',
    note: '빗소리 10시간',
    durationMinutes: 600,
  },
  {
    id: `${PREFIX}doc`,
    text: '넷플릭스 우주 다큐 3화',
    durationMinutes: 52,
  },
  {
    id: `${PREFIX}radio`,
    text: 'https://www.netflix.com/watch/80100172',
    note: '보다 자다 반복하는 시트콤',
  },
  {
    id: `${PREFIX}piano`,
    text: 'https://youtu.be/4Tr0otuiQuU',
    note: '잔잔한 피아노 3시간',
    durationMinutes: 180,
  },
]

const MEMOS: { id: string; text: string; dayOffset?: number }[] = [
  { id: `${PREFIX}m1`, text: '빗소리 틀면 확실히 빨리 잠' },
  { id: `${PREFIX}m2`, text: '자막 있는 건 계속 보게 돼서 별로', dayOffset: -1 },
  { id: `${PREFIX}m3`, text: '다음에 볼 것: 고양이 카페 라이브' },
  { id: `${PREFIX}m4`, text: '새벽 2시 넘어가면 뭘 틀어도 소용없다', dayOffset: -3 },
  { id: `${PREFIX}m5`, text: '이어폰 말고 스피커가 나음' },
]

/** 최근 6일치 밤 + 대기 목록 + 메모를 채운다. */
export async function seedSampleData(): Promise<void> {
  for (const w of WATCH_ITEMS) {
    const item: WatchItem = {
      id: w.id,
      text: w.text,
      addedAt: new Date(2026, 7, 20).toISOString(),
    }
    if (w.note) item.note = w.note
    if (w.durationMinutes) item.durationMinutes = w.durationMinutes
    await putWatchItem(item)
  }

  for (const m of MEMOS) {
    const memo: Memo = {
      id: m.id,
      text: m.text,
      createdAt: new Date(2026, 7, 24).toISOString(),
    }
    if (m.dayOffset !== undefined) memo.date = addDaysToKey(todayKey(), m.dayOffset)
    await putMemo(memo)
  }

  // 밤: 취침 시각은 조금씩 늦어지고, 틀어둔 것은 돌아가며 바뀐다.
  // 취침 시각(자정 기준 분): 23:40, 00:20, 01:05, 23:15, 00:40, 23:55
  const nights: Omit<DailyRecord, 'date'>[] = [
    { sleepStart: 1420, sleepEnd: 430, weightKg: 68.4, watchItemId: `${PREFIX}lofi` },
    { sleepStart: 20, sleepEnd: 450, weightKg: 68.2, watchItemId: `${PREFIX}rain` },
    { sleepStart: 65, sleepEnd: 480, weightKg: 68.6, watchItemId: `${PREFIX}doc` },
    { sleepStart: 1395, sleepEnd: 410, weightKg: 68.1, watchItemId: `${PREFIX}piano` },
    { sleepStart: 40, sleepEnd: 465, weightKg: 68.3, watchItemId: `${PREFIX}radio` },
    { sleepStart: 1435, sleepEnd: 440, weightKg: 68.0, watchItemId: `${PREFIX}rain` },
  ]

  const existing = new Set((await getAllRecords()).map((r) => r.date))
  for (let i = 0; i < nights.length; i++) {
    const date = addDaysToKey(todayKey(), -(i + 1))
    // 이미 있는 날은 건드리지 않는다 — 진짜 기록을 덮어쓰면 안 되므로.
    if (existing.has(date)) continue
    await putRecord({ date, ...nights[i] })
  }
}

/** seedSampleData가 넣은 것만 지운다. 직접 쓴 기록은 남는다. */
export async function clearSampleData(): Promise<void> {
  for (const item of await getAllWatchItems()) {
    if (item.id.startsWith(PREFIX)) await deleteWatchItem(item.id)
  }
  for (const memo of await getAllMemos()) {
    if (memo.id.startsWith(PREFIX)) await deleteMemo(memo.id)
  }
  for (const record of await getAllRecords()) {
    if (record.watchItemId?.startsWith(PREFIX)) await deleteRecord(record.date)
  }
}
