import type { RecordStats } from '../types'
import { toChartRows } from '../lib/chartData'
import { MonthCalendar } from './MonthCalendar'
import { TrendChart } from './TrendChart'

/**
 * 통계 화면: 맨 위에 월별 기록 캘린더(며칠 기록했는지), 그 아래로
 * 몸무게 / 수면 시간 / 첫날 대비 몸무게 추이를 라인 차트로.
 * 추이는 점이 2개 이상일 때 의미가 있으므로 기록이 1개 이하면 캘린더만 보여준다.
 */
export function StatsSection({ stats }: { stats: RecordStats[] }) {
  // stats는 날짜 오름차순이라 캘린더의 "최근 달" 판단에 그대로 쓸 수 있다.
  const recordedDates = stats.map((s) => s.date)
  const rows = stats.length >= 2 ? toChartRows(stats) : []

  return (
    <div className="flex flex-col gap-6">
      <MonthCalendar recordedDates={recordedDates} />

      {stats.length < 2 ? (
        <p className="py-4 text-center text-sm text-faint">
          기록이 2개 이상 쌓이면 추이가 보여요.
        </p>
      ) : (
        <>
          <TrendChart
            title="몸무게 (kg)"
            data={rows}
            dataKey="weightKg"
            color="var(--chart-weight)"
            unit="kg"
          />
          <TrendChart
            title="수면 시간 (시간)"
            data={rows}
            dataKey="sleepHours"
            color="var(--chart-sleep)"
            unit="시간"
          />
          <TrendChart
            title="첫날 대비 몸무게 (kg)"
            data={rows}
            dataKey="weightFromStart"
            color="var(--chart-cum)"
            unit="kg"
          />
        </>
      )}
    </div>
  )
}
