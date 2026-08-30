import { useEffect, useState } from 'react'

const dateFormat = new Intl.DateTimeFormat('ko-KR', {
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

/** "03:08:42" */
function formatClockSeconds(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
}

/**
 * 화면 맨 위의 날짜·시각 띠.
 *
 * 탭이 바뀌어도 그대로 있다. 탭이 어디인지는 하단 탭바가 말하므로, 여기는
 * "지금 몇 월 며칠 몇 시인지"만 말한다. 자려고 누워서 여는 앱이라 현재 시각은
 * 장식이 아니라 결정에 쓰이는 정보다 — 지금 자면 몇 시간 잘 수 있는지.
 *
 * 초까지 보여주므로 1초마다 갱신한다.
 */
export function AppHeader() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-5 pt-6 pb-4">
      <h1 className="font-[family-name:var(--font-display)] text-[1.375rem] leading-tight text-ink">
        {dateFormat.format(now)}
      </h1>
      <time
        // 날짜와 같은 글꼴. 굴림은 고정폭이 아니라 초 자리에서 폭이 조금 흔들린다.
        // tabular-nums를 요청해 두되(지원하면 적용) 정렬은 좌측 기준이라 문제되지 않는다.
        className="font-[family-name:var(--font-display)] text-[1.375rem] leading-tight text-dim [font-variant-numeric:tabular-nums]"
        dateTime={now.toISOString()}
      >
        {formatClockSeconds(now)}
      </time>
    </header>
  )
}
