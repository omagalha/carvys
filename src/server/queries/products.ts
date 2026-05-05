import { createClient } from '@/lib/supabase/server'
import { getUserTenants } from '@/server/queries/tenants'

export type Product = {
  id:               string
  tenant_id:        string
  name:             string
  sku:              string | null
  category:         string | null
  brand:            string | null
  supplier:         string | null
  cost_price:       number | null
  sale_price:       number | null
  photo_path:       string | null
  manufacture_date: string | null
  expiry_date:      string | null
  quantity:         number
  min_quantity:     number
  created_at:       string
  updated_at:       string
}

export type InventoryMovement = {
  id:           string
  tenant_id:    string
  product_id:   string
  type:         'in' | 'out' | 'return' | 'discard'
  quantity:     number
  notes:        string | null
  performed_by: string | null
  created_at:   string
  products:     { name: string } | null
}

export type ExpiryStatus = 'ok' | 'expiring' | 'expired' | 'none'

export function getExpiryStatus(expiryDate: string | null): ExpiryStatus {
  if (!expiryDate) return 'none'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  const days = Math.ceil((expiry.getTime() - today.getTime()) / 86400000)
  if (days < 0) return 'expired'
  if (days <= 30) return 'expiring'
  return 'ok'
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return []

  const tenant = memberships[0].tenants

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('tenant_id', tenant.id)
    .order('name')

  if (error) {
    console.error('[getProducts]', error.code, error.message)
    return []
  }

  return (data ?? []) as Product[]
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return null

  const tenant = memberships[0].tenants

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenant.id)
    .single()

  if (error) return null
  return data as Product
}

export type ProductSale = {
  id:            string
  tenant_id:     string
  product_id:    string
  contact_name:  string
  contact_phone: string | null
  quantity:      number
  unit_price:    number
  notes:         string | null
  sold_at:       string
  created_at:    string
  products:      { name: string } | null
}

export type ClientSummary = {
  contact_name:  string
  contact_phone: string | null
  total_spent:   number
  purchase_count: number
  last_purchase:  string
}

export async function getSalesByProduct(productId: string): Promise<ProductSale[]> {
  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return []

  const tenant = memberships[0].tenants

  const { data, error } = await supabase
    .from('product_sales')
    .select('*, products(name)')
    .eq('tenant_id', tenant.id)
    .eq('product_id', productId)
    .order('sold_at', { ascending: false })

  if (error) return []
  return (data ?? []) as ProductSale[]
}

export async function getClientSummaries(): Promise<ClientSummary[]> {
  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return []

  const tenant = memberships[0].tenants

  const { data, error } = await supabase
    .from('product_sales')
    .select('contact_name, contact_phone, quantity, unit_price, sold_at')
    .eq('tenant_id', tenant.id)
    .order('sold_at', { ascending: false })

  if (error) return []

  const map = new Map<string, ClientSummary>()
  for (const row of data ?? []) {
    const key = row.contact_phone ?? row.contact_name
    const existing = map.get(key)
    const spent = row.quantity * row.unit_price
    if (existing) {
      existing.total_spent    += spent
      existing.purchase_count += 1
    } else {
      map.set(key, {
        contact_name:   row.contact_name,
        contact_phone:  row.contact_phone,
        total_spent:    spent,
        purchase_count: 1,
        last_purchase:  row.sold_at,
      })
    }
  }

  return Array.from(map.values()).sort((a, b) => b.total_spent - a.total_spent)
}

export async function getClientPurchases(phone: string): Promise<ProductSale[]> {
  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return []

  const tenant = memberships[0].tenants

  const { data, error } = await supabase
    .from('product_sales')
    .select('*, products(name)')
    .eq('tenant_id', tenant.id)
    .eq('contact_phone', phone)
    .order('sold_at', { ascending: false })

  if (error) return []
  return (data ?? []) as ProductSale[]
}

export async function getInventoryMovements(productId?: string): Promise<InventoryMovement[]> {
  const supabase = await createClient()
  const memberships = await getUserTenants()
  if (memberships.length === 0) return []

  const tenant = memberships[0].tenants

  let query = supabase
    .from('inventory_movements')
    .select('*, products(name)')
    .eq('tenant_id', tenant.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (productId) query = query.eq('product_id', productId)

  const { data, error } = await query

  if (error) {
    console.error('[getInventoryMovements]', error.code, error.message)
    return []
  }

  return (data ?? []) as InventoryMovement[]
}
