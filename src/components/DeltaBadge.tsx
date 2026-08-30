/**
 * 증감값을 방향(↑/↓)과 색으로 표시한다.
 * 증가는 빨강(↑), 감소는 파랑(↓), 변화 없음은 회색.
 * value가 null(비교 대상 없음)이면 아무것도 렌더링하지 않는다.
 *
 * 크기 표기는 `format`으로 위임한다 (몸무게 "0.4kg", 수면 "15분" 등 단위가 다르므로).
 */
export function DeltaBadge({
  value,
  format,
  label,
}: {
  value: number | null
  format: (abs: number) => string
  label?: string
}) {
  if (value === null) return null

  const prefix = label ? `${label} ` : ''

  if (value === 0) {
    return (
      <span className="text-faint">
        {prefix}±{format(0)}
      </span>
    )
  }

  const up = value > 0
  return (
    <span className={up ? 'text-rise' : 'text-fall'}>
      {prefix}
      {up ? '↑' : '↓'}
      {format(Math.abs(value))}
    </span>
  )
}
