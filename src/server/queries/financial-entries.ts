import { createClient } from '@/lib/supabase/server'

export type FinancialEntry = {
  id: string
  type: 'expense' | 'income'
  category: string
  description: string
  amount: number
  date: string
  vehicle_id: string | null
  vehicles: { brand: string; model: string; year_model: number | null } | null
}

export type VehicleExpenseSummary = {
  vehicle_id: string
  brand: string
  model: string
  year_model: number | null
  expenses: number
  entries: { category: string; description: string; amount: number }[]
}

export async function getMonthlyEntries(
  tenantId: string,
  year: number,
  month: number
): Promise<FinancialEntry[]> {
  const supabase = await createClient()
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end   = month === 12
    ? `${year + 1}-01-01`
    : `${year}-${String(month + 1).padStart(2, '0')}-01`

  const { data } = await supabase
    .from('financial_entries')
    .select('id, type, category, description, amount, date, vehicle_id, vehicles(brand, model, year_model)')
    .eq('tenant_id', tenantId)
    .gte('date', start)
    .lt('date', end)
    .order('date', { ascending: false })

  return (data as unknown as FinancialEntry[]) ?? []
}

export async function getVehicleExpenseSummaries(
  tenantId: string
): Promise<VehicleExpenseSummary[]> {
  const supabase = await createClient()

  const { data } = await supabase
    .from('financial_entries')
    .select('vehicle_id, category, description, amount, vehicles(id, brand, model, year_model)')
    .eq('tenant_id', tenantId)
    .eq('type', 'expense')
    .not('vehicle_id', 'is', null)

  if (!data) return []

  const grouped = new Map<string, VehicleExpenseSummary>()

  type RawEntry = { vehicle_id: string | null; category: string; description: string; amount: number; vehicles: { id: string; brand: string; model: string; year_model: number | null } | null }
  for (const entry of data as unknown as RawEntry[]) {
    if (!entry.vehicle_id || !entry.vehicles) continue
    const existing = grouped.get(entry.vehicle_id)
    if (existing) {
      existing.expenses += Number(entry.amount)
      existing.entries.push({ category: entry.category, description: entry.description, amount: Number(entry.amount) })
    } else {
      grouped.set(entry.vehicle_id, {
        vehicle_id: entry.vehicle_id,
        brand: entry.vehicles.brand,
        model: entry.vehicles.model,
        year_model: entry.vehicles.year_model,
        expenses: Number(entry.amount),
        entries: [{ category: entry.category, description: entry.description, amount: Number(entry.amount) }],
      })
    }
  }

  return Array.from(grouped.values()).sort((a, b) => b.expenses - a.expenses)
}
