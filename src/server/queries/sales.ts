import { createClient } from '@/lib/supabase/server'

export type Sale = {
  id: string
  vehicle_id: string
  lead_id: string | null
  sale_price: number
  cost_price: number | null
  notes: string | null
  sold_at: string
  created_at: string
  vehicles: { brand: string; model: string; year_model: number | null; plate: string | null } | null
  leads: { name: string; phone: string } | null
}

export type MonthlySummary = {
  revenue: number
  profit: number
  count: number
  avgTicket: number
}

export async function getMonthlySales(
  tenantId: string,
  year: number,
  month: number
): Promise<Sale[]> {
  const supabase = await createClient()
  const start = new Date(year, month - 1, 1).toISOString()
  const end   = new Date(year, month, 1).toISOString()

  const { data } = await supabase
    .from('sales')
    .select('*, vehicles(brand, model, year_model, plate), leads(name, phone)')
    .eq('tenant_id', tenantId)
    .gte('sold_at', start)
    .lt('sold_at', end)
    .order('sold_at', { ascending: false })

  return (data as Sale[]) ?? []
}

export function calcSummary(sales: Sale[]): MonthlySummary {
  const revenue  = sales.reduce((s, v) => s + v.sale_price, 0)
  const cost     = sales.reduce((s, v) => s + (v.cost_price ?? 0), 0)
  const profit   = revenue - cost
  const avgTicket = sales.length > 0 ? revenue / sales.length : 0
  return { revenue, profit, count: sales.length, avgTicket }
}
