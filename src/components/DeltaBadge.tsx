/**
 * 증감값을 방향(↑/↓)과 색으로 표시한다.
 * 증가는 빨강(↑), 감소는 파랑(↓), 변화 없음은 회색.
 * value가 null(비교 대상 없음)이면 아무것도 렌더링하지 않는다.
 */
export function DeltaBadge({
  value,
  unit,
  label,
}: {
  value: number | null
  unit: string
  label?: string
}) {
  if (value === null) return null

  const prefix = label ? `${label} ` : ''

  if (value === 0) {
    return (
      <span className="text-neutral-400">
        {prefix}±0{unit}
      </span>
    )
  }

  const up = value > 0
  return (
    <span className={up ? 'text-red-500' : 'text-blue-500'}>
      {prefix}
      {up ? '↑' : '↓'}
      {Math.abs(value)}
      {unit}
    </span>
  )
}
