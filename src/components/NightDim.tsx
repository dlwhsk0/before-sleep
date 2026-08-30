import { useEffect, useState } from 'react'
import { minutesOfDay, nightDimOpacity } from '../lib/nightDim'

/**
 * 밤이 깊을수록 화면 전체를 조금씩 어둡게 덮는 레이어.
 *
 * 색 토큰을 시각마다 다시 계산하는 대신 검은 오버레이 한 장을 씌운다.
 * 썸네일까지 같이 가라앉아서 화면 전체가 고르게 물러나고, 레이아웃에는
 * 아무 영향이 없다. 클릭은 통과시킨다.
 */
export function NightDim({ enabled }: { enabled: boolean }) {
  const [opacity, setOpacity] = useState(() =>
    nightDimOpacity(minutesOfDay(new Date())),
  )

  useEffect(() => {
    if (!enabled) return
    // 1분마다 다시 계산한다. 6시간에 걸쳐 0.12까지 오르므로 변화는 눈에 띄지 않는다.
    const id = setInterval(() => {
      setOpacity(nightDimOpacity(minutesOfDay(new Date())))
    }, 60_000)
    return () => clearInterval(id)
  }, [enabled])

  if (!enabled || opacity === 0) return null

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-1000"
      style={{ opacity, background: '#0a0806' }}
    />
  )
}
