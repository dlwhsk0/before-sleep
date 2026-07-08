import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { DailyRecord } from '../types'

interface HealthDB extends DBSchema {
  records: {
    key: string // date "YYYY-MM-DD"
    value: DailyRecord
  }
}

const DB_NAME = 'health-tracker'
const DB_VERSION = 1
const STORE = 'records'

let dbPromise: Promise<IDBPDatabase<HealthDB>> | null = null

function getDb(): Promise<IDBPDatabase<HealthDB>> {
  if (!dbPromise) {
    dbPromise = openDB<HealthDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // date를 keyPath로 쓰므로 하루에 한 개만 저장된다 (같은 날짜 put 시 덮어씀).
        db.createObjectStore(STORE, { keyPath: 'date' })
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
  // getAll은 keyPath(date) 오름차순으로 반환하지만, 명시적으로 정렬해 안전하게 보장한다.
  const all = await db.getAll(STORE)
  return all.sort((a, b) => a.date.localeCompare(b.date))
}

/** 특정 날짜의 기록을 삭제한다. */
export async function deleteRecord(date: string): Promise<void> {
  const db = await getDb()
  await db.delete(STORE, date)
}
