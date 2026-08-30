import { useState } from 'react'
import type { Settings, ThemePref } from '../lib/settings'
import { clearSampleData, seedSampleData } from '../lib/sampleData'

const THEMES: { value: ThemePref; label: string }[] = [
  { value: 'dark', label: '어둡게' },
  { value: 'light', label: '밝게' },
  { value: 'system', label: '시스템' },
]

function Row({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="flex min-w-0 flex-col">
        <span className="text-sm text-ink">{label}</span>
        {hint && <span className="text-xs text-faint">{hint}</span>}
      </span>
      {children}
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 shrink-0 rounded-full border transition-colors ${
        checked ? 'border-accent bg-accent' : 'border-line bg-surface-2'
      }`}
    >
      <span
        className={`block h-4 w-4 rounded-full transition-transform ${
          checked ? 'translate-x-6 bg-bg' : 'translate-x-1 bg-faint'
        }`}
      />
    </button>
  )
}

type Props = {
  settings: Settings
  onChange: (patch: Partial<Settings>) => void
  onDataChanged: () => void
}

export function SettingsPanel({ settings, onChange, onDataChanged }: Props) {
  const [busy, setBusy] = useState(false)

  const runSample = async (fn: () => Promise<void>) => {
    setBusy(true)
    try {
      await fn()
      onDataChanged()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col divide-y divide-line">
        <Row label="테마">
          <div className="flex shrink-0 gap-1 rounded-lg bg-surface-2 p-1">
            {THEMES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => onChange({ theme: t.value })}
                aria-pressed={settings.theme === t.value}
                className={`rounded px-3 py-1.5 text-xs transition-colors ${
                  settings.theme === t.value
                    ? 'bg-accent text-bg'
                    : 'text-dim hover:text-ink'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </Row>

        <Row label="밤에 화면 어둡게" hint="21시부터 서서히, 새벽 3시에 가장 어둡게">
          <Toggle
            label="밤에 화면 어둡게"
            checked={settings.dimAtNight}
            onChange={(v) => onChange({ dimAtNight: v })}
          />
        </Row>

        <Row label="체중 기록" hint="끄면 기록 탭에서 체중 입력이 사라집니다">
          <Toggle
            label="체중 기록"
            checked={settings.trackWeight}
            onChange={(v) => onChange({ trackWeight: v })}
          />
        </Row>
      </section>

      {import.meta.env.DEV && (
        <section className="flex flex-col gap-3 rounded-lg border border-dashed border-line p-4">
          <p className="text-xs text-faint">
            개발용 — 빌드에는 포함되지 않습니다. 예시 데이터는 직접 쓴 기록을 덮어쓰지
            않고, 지우기는 예시로 넣은 것만 지웁니다.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => runSample(seedSampleData)}
              className="flex-1 rounded-lg border border-line px-3 py-2 text-sm text-ink transition-colors hover:bg-surface-2 disabled:opacity-40"
            >
              예시 데이터 채우기
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => runSample(clearSampleData)}
              className="flex-1 rounded-lg border border-line px-3 py-2 text-sm text-dim transition-colors hover:bg-surface-2 disabled:opacity-40"
            >
              예시 데이터 지우기
            </button>
          </div>
        </section>
      )}

      <div className="flex items-center justify-center gap-4 text-xs text-faint">
        <a
          href="https://github.com/dlwhsk0/before-sleep"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-dim"
        >
          소스 코드
        </a>
        <span aria-hidden="true">·</span>
        <a
          href="https://github.com/dlwhsk0/before-sleep/issues/new"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-dim"
        >
          의견 보내기
        </a>
      </div>
    </div>
  )
}
