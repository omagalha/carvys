'use client'

export type WeekBar = {
  label: string
  income: number
  expenses: number
  prevIncome: number
}

interface Props {
  weeks: WeekBar[]
}

function fmt(v: number) {
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`
  return v.toString()
}

const W = 460
const H = 150
const PT = 14
const PB = 26
const PL = 0
const PR = 0
const DW = W - PL - PR
const DH = H - PT - PB

export function RevenueChart({ weeks }: Props) {
  const allValues = weeks.flatMap(w => [w.income, w.expenses, w.prevIncome])
  const maxVal = Math.max(...allValues, 1)
  const scale = (v: number) => (v / maxVal) * DH

  const n = weeks.length
  const groupW = DW / n
  const barW = Math.min(Math.floor((groupW - 10) / 2), 24)

  const prevPoints = weeks
    .map((w, i) => {
      const cx = PL + i * groupW + groupW / 2
      const y = PT + DH - scale(w.prevIncome)
      return `${cx},${y}`
    })
    .join(' ')

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-deep border border-surface p-4">
      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-green/80" />
          <span className="font-body text-xs text-slate">Entradas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-sm bg-alert/60" />
          <span className="font-body text-xs text-slate">Saídas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="16" height="6" viewBox="0 0 16 6">
            <line x1="0" y1="3" x2="16" y2="3" stroke="#4B5563" strokeWidth="1.5" strokeDasharray="3 2" />
          </svg>
          <span className="font-body text-xs text-slate">Mês anterior</span>
        </div>
      </div>

      {/* Chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: 140 }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75, 1].map(pct => (
          <line
            key={pct}
            x1={PL} y1={PT + DH - pct * DH}
            x2={W - PR} y2={PT + DH - pct * DH}
            stroke="#1C1C28"
            strokeWidth="1"
          />
        ))}

        {/* Baseline */}
        <line
          x1={PL} y1={PT + DH}
          x2={W - PR} y2={PT + DH}
          stroke="#2A2A3C"
          strokeWidth="1"
        />

        {/* Bars */}
        {weeks.map((w, i) => {
          const cx = PL + i * groupW + groupW / 2
          const iH = scale(w.income)
          const eH = scale(w.expenses)

          return (
            <g key={i}>
              {/* Income bar */}
              <rect
                x={cx - barW - 2}
                y={PT + DH - iH}
                width={barW}
                height={Math.max(iH, 0)}
                rx={3}
                fill="#C8F135"
                fillOpacity={0.85}
              />
              {/* Expense bar */}
              <rect
                x={cx + 2}
                y={PT + DH - eH}
                width={barW}
                height={Math.max(eH, 0)}
                rx={3}
                fill="#FF4D4D"
                fillOpacity={0.55}
              />
              {/* Value label above income bar (only if > 0) */}
              {w.income > 0 && iH > 14 && (
                <text
                  x={cx - barW / 2 - 2}
                  y={PT + DH - iH - 4}
                  textAnchor="middle"
                  fontSize={8}
                  fill="#C8F135"
                  fillOpacity={0.7}
                >
                  {fmt(w.income)}
                </text>
              )}
              {/* X label */}
              <text
                x={cx}
                y={H - 6}
                textAnchor="middle"
                fontSize={10}
                fill="#6B7280"
              >
                {w.label}
              </text>
            </g>
          )
        })}

        {/* Previous month line */}
        {maxVal > 1 && (
          <polyline
            points={prevPoints}
            fill="none"
            stroke="#4B5563"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dots on prev line */}
        {weeks.map((w, i) => {
          if (w.prevIncome <= 0) return null
          const cx = PL + i * groupW + groupW / 2
          const y = PT + DH - scale(w.prevIncome)
          return (
            <circle
              key={`dot-${i}`}
              cx={cx}
              cy={y}
              r={2.5}
              fill="#1E2433"
              stroke="#4B5563"
              strokeWidth={1.5}
            />
          )
        })}
      </svg>
    </div>
  )
}
