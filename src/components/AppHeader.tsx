import { useEffect, useState } from 'react'
import { formatClock } from '../lib/time'
import { minutesOfDay } from '../lib/nightDim'

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

/**
 * 화면 맨 위의 날짜·시각 띠.
 *
 * 탭이 바뀌어도 그대로 있다. 탭이 어디인지는 하단 탭바가 말하므로, 여기는
 * "지금 몇 월 며칠 몇 시인지"만 말한다. 자려고 누워서 여는 앱이라 현재 시각은
 * 장식이 아니라 결정에 쓰이는 정보다 — 지금 자면 몇 시간 잘 수 있는지.
 */
export function AppHeader() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex items-baseline justify-between gap-4 px-5 pt-6 pb-4">
      <h1 className="font-[family-name:var(--font-display)] text-[1.375rem] leading-tight text-ink">
        {dateFormat.format(now)}
      </h1>
      <time
        className="tnum text-sm text-dim"
        dateTime={now.toISOString()}
      >
        {formatClock(minutesOfDay(now))}
      </time>
    </header>
  )
}
