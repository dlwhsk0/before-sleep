/** 영상 파일이 아니라 "볼 것 한 줄"을 담는다. 저장되는 건 전부 텍스트. */
export type WatchItem = {
  id: string
  /** 사용자가 직접 쓴 한 줄. URL이거나 그냥 제목. 여기서 나머지를 전부 파생한다. */
  text: string
  /** 선택. text에 URL을 넣었을 때 붙이는 제목·메모 */
  note?: string
  /** 선택. 분 단위 길이 */
  durationMinutes?: number
  addedAt: string // ISO 8601
  /** true면 대기 목록에서 숨긴다 (다 봤음) */
  archived?: boolean
}

export type Memo = {
  id: string
  text: string
  /** 선택. "YYYY-MM-DD" — 없으면 날짜 무관 자유 메모 */
  date?: string
  createdAt: string // ISO 8601
}

/**
 * 하루 기록. 필드가 전부 optional인 이유:
 * 영상은 자기 전에 정하고 수면·체중은 아침에 기록하므로,
 * 한 레코드가 부분적으로만 채워진 중간 상태가 정상이다.
 */
export type DailyRecord = {
  date: string // "YYYY-MM-DD" (기본 키)
  sleepStart?: number // 잠들기를 시도한 시각, 자정 기준 분 (0–1439)
  sleepEnd?: number // 기상 시각, 자정 기준 분 (0–1439)
  weightKg?: number
  watchItemId?: string // 그날 밤 틀은 것 (WatchItem.id 참조)
}

export type RecordStats = DailyRecord & {
  /** 파생 소요 시간(분). 취침·기상이 다 있을 때만. */
  sleepMinutes: number | null
  /** 직전에 수면이 기록된 날 대비 소요 증감(분) */
  sleepDeltaMinutes: number | null
  /** 직전에 체중이 기록된 날 대비 증감 */
  weightDelta: number | null
  /** 체중이 기록된 가장 오래된 날 대비 증감 */
  weightDeltaFromStart: number | null
}
