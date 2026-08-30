import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { DailyRecord, Memo, WatchItem } from '../types'
import { addMinutes } from './time'

interface HealthDB extends DBSchema {
  records: {
    key: string // date "YYYY-MM-DD"
    value: DailyRecord
  }
  watchlist: {
    key: string // WatchItem.id
    value: WatchItem
  }
  memos: {
    key: string // Memo.id
    value: Memo
  }
}

// 앱 이름이 '자기 전에'로 바뀌었어도 DB 이름은 그대로 둔다.
// 바꾸면 기존 사용자의 IndexedDB가 새 DB로 갈려서 기록이 전부 사라진다.
const DB_NAME = 'health-tracker'
const DB_VERSION = 3
const STORE = 'records'
const WATCHLIST = 'watchlist'
const MEMOS = 'memos'

// v1 레거시 레코드 형태 (마이그레이션용)
type LegacyRecord = {
  date: string
  sleepHours: number
  weightKg: number
}

const DEFAULT_SLEEP_START = 23 * 60 // 23:00, 레거시 데이터에 취침 시각이 없을 때 기본값

let dbPromise: Promise<IDBPDatabase<HealthDB>> | null = null

function getDb(): Promise<IDBPDatabase<HealthDB>> {
  if (!dbPromise) {
    dbPromise = openDB<HealthDB>(DB_NAME, DB_VERSION, {
      async upgrade(db, oldVersion, _newVersion, tx) {
        // v1: 스토어 생성 (date를 keyPath로 → 하루 한 개)
        if (oldVersion < 1) {
          db.createObjectStore(STORE, { keyPath: 'date' })
        }

        // v2: 수면을 sleepHours → sleepStart/sleepEnd 로 마이그레이션.
        // 취침 시각 정보가 없으므로 기본 취침 23:00을 두고 소요 시간을 보존한다.
        if (oldVersion >= 1 && oldVersion < 2) {
          const store = tx.objectStore(STORE)
          let cursor = await store.openCursor()
          while (cursor) {
            const value = cursor.value as unknown as LegacyRecord | DailyRecord
            if ('sleepHours' in value) {
              const migrated: DailyRecord = {
                date: value.date,
                sleepStart: DEFAULT_SLEEP_START,
                sleepEnd: addMinutes(
                  DEFAULT_SLEEP_START,
                  Math.round(value.sleepHours * 60),
                ),
                weightKg: value.weightKg,
              }
              await cursor.update(migrated)
            }
            cursor = await cursor.continue()
          }
        }

        // v3: 대기 목록·메모 스토어 추가. records는 손대지 않는다 —
        // 필드가 optional로 넓어졌을 뿐이라 데이터 변환이 필요 없다.
        if (oldVersion < 3) {
          db.createObjectStore(WATCHLIST, { keyPath: 'id' })
          db.createObjectStore(MEMOS, { keyPath: 'id' })
        }
      },
    })
  }
  return dbPromise
}

/** 하루 기록을 저장한다. 같은 날짜가 있으면 덮어쓴다. */
export async function putRecord(record: DailyRecord): Promise<void> {
  const db = await getDb()
  await db.put(STORE, record)
}

/** 특정 날짜의 기록을 가져온다. 없으면 undefined. */
export async function getRecord(date: string): Promise<DailyRecord | undefined> {
  const db = await getDb()
  return db.get(STORE, date)
}

/** 모든 기록을 날짜 오름차순으로 가져온다. */
export async function getAllRecords(): Promise<DailyRecord[]> {
  const db = await getDb()
  const all = await db.getAll(STORE)
  return all.sort((a, b) => a.date.localeCompare(b.date))
}

/** 특정 날짜의 기록을 삭제한다. */
export async function deleteRecord(date: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE, date)
}

// ---- 대기 목록 (WatchItem) ----

/** 대기 목록 전체를 추가한 순서의 역순(최신 먼저)으로. */
export async function getAllWatchItems(): Promise<WatchItem[]> {
  const db = await getDb()
  const all = await db.getAll(WATCHLIST)
  return all.sort((a, b) => b.addedAt.localeCompare(a.addedAt))
}

export async function putWatchItem(item: WatchItem): Promise<void> {
  const db = await getDb()
  await db.put(WATCHLIST, item)
}

export async function deleteWatchItem(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(WATCHLIST, id)
}

// ---- 메모 ----

/** 메모 전체를 최신 먼저. */
export async function getAllMemos(): Promise<Memo[]> {
  const db = await getDb()
  const all = await db.getAll(MEMOS)
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function putMemo(memo: Memo): Promise<void> {
  const db = await getDb()
  await db.put(MEMOS, memo)
}

export async function deleteMemo(id: string): Promise<void> {
  const db = await getDb()
  await db.delete(MEMOS, id)
}
