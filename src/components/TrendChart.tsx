import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ChartRow } from '../lib/chartData'
import { WINDOW_DAYS } from '../lib/chartData'

/**
 * 한 시리즈의 추이를 보여주는 반응형 라인 차트.
 * ResponsiveContainer는 부모에 실제 높이가 있어야 하므로 고정 높이 래퍼로 감싼다(Recharts v3).
 * 선/격자/축 색은 CSS 변수로 전달해 라이트·다크 모두 대응한다.
 */
export function TrendChart({
  title,
  data,
  dataKey,
  color,
  unit,
}: {
  title: string
  data: ChartRow[]
  dataKey: keyof ChartRow
  color: string
  unit: string
}) {
  // 기본 창: 최근 WINDOW_DAYS개. 그보다 많을 때만 드래그용 Brush를 띄운다.
  const showBrush = data.length > WINDOW_DAYS
  const startIndex = showBrush ? data.length - WINDOW_DAYS : 0
  const endIndex = data.length - 1

  return (
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-medium text-dim">{title}</h3>
      <div className={`${showBrush ? 'h-52' : 'h-44'} w-full`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
              stroke="var(--chart-axis)"
            />
            <YAxis
              type="number"
              domain={['auto', 'auto']}
              width={44}
              tick={{ fontSize: 11, fill: 'var(--chart-axis)' }}
              stroke="var(--chart-axis)"
            />
            <Tooltip
              formatter={(value) => [`${value}${unit}`, title]}
              labelFormatter={(label) => `${label}`}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3 }}
              connectNulls
              isAnimationActive={false}
            />
            {showBrush && (
              <Brush
                dataKey="label"
                height={18}
                travellerWidth={8}
                stroke="var(--chart-axis)"
                startIndex={startIndex}
                endIndex={endIndex}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
