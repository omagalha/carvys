export type Temperature = 'hot' | 'warm' | 'cold'

export type TempConfig = {
  label: string
  emoji: string
  color: string
  bg: string
  border: string
}

export const TEMP_CONFIG: Record<Temperature, TempConfig> = {
  hot:  { label: 'Quente', emoji: '🔥', color: 'text-orange-400',  bg: 'bg-orange-400/10',  border: 'border-orange-400/25' },
  warm: { label: 'Morno',  emoji: '🌡️', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/25' },
  cold: { label: 'Frio',   emoji: '❄️', color: 'text-blue-400',   bg: 'bg-blue-400/10',   border: 'border-blue-400/25'  },
}

export function calcTemperature(
  stage: string,
  lastContactAt: string | null,
  createdAt: string,
): Temperature | null {
  if (stage === 'won' || stage === 'lost') return null

  const ref  = lastContactAt ?? createdAt
  const days = (Date.now() - new Date(ref).getTime()) / (1000 * 60 * 60 * 24)

  if (days < 1)  return 'hot'
  if (days <= 3) return 'warm'
  return 'cold'
}
