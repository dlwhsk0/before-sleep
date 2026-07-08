/**
 * Date 객체를 로컬 기준 "YYYY-MM-DD" 키로 변환한다.
 *
 * toISOString()은 UTC로 변환하기 때문에 자정 근처(예: 한국시간 오전 8시 이전)에
 * 날짜가 하루 밀릴 수 있다. 그래서 로컬 연/월/일 컴포넌트를 직접 조합한다.
 */
export function toDateKey(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 오늘 날짜의 "YYYY-MM-DD" 키. */
export function todayKey(): string {
  return toDateKey(new Date())
}

/**
 * 날짜 키에 days일을 더한 키. 월/년 넘김 처리.
 * 로컬 Date 생성자(new Date(y, m, d))를 쓰므로 UTC 파싱으로 인한 날짜 밀림이 없다.
 */
export function addDaysToKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number)
  return toDateKey(new Date(y, m - 1, d + days))
}

/** startKey부터 endKey까지(포함) 매일의 날짜 키 배열. start > end면 빈 배열. */
export function enumerateDateKeys(startKey: string, endKey: string): string[] {
  const keys: string[] = []
  let cur = startKey
  while (cur <= endKey) {
    keys.push(cur)
    cur = addDaysToKey(cur, 1)
  }
  return keys
}
