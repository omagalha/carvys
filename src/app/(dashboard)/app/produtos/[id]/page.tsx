import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getProduct, getInventoryMovements, getSalesByProduct, getExpiryStatus } from '@/server/queries/products'
import { ProductForm } from './product-form'
import { MovementForm } from './movement-form'
import { SaleForm } from './sale-form'

const EXPIRY_BADGE: Record<string, { label: string; className: string }> = {
  expired:  { label: 'Vencido',          className: 'bg-red-500/15 text-red-400 border-red-500/30' },
  expiring: { label: 'Vencendo em breve', className: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  ok:       { label: 'Validade OK',       className: 'bg-green/15 text-green border-green/30' },
  none:     { label: 'Sem validade',      className: 'bg-surface text-slate border-surface' },
}

const MOVEMENT_LABELS: Record<string, { label: string; sign: string; color: string }> = {
  in:      { label: 'Entrada',   sign: '+', color: 'text-green' },
  out:     { label: 'Saída',     sign: '−', color: 'text-red-400' },
  return:  { label: 'Devolução', sign: '+', color: 'text-green' },
  discard: { label: 'Descarte',  sign: '−', color: 'text-red-400' },
}

export default async function ProdutoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, movements, sales] = await Promise.all([
    getProduct(id),
    getInventoryMovements(id),
    getSalesByProduct(id),
  ])

  if (!product) notFound()

  const status = getExpiryStatus(product.expiry_date)
  const badge  = EXPIRY_BADGE[status]

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/app/produtos"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-slate hover:text-white hover:bg-surface transition-colors"
        >
          <ArrowLeft size={18} strokeWidth={1.75} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl font-semibold text-white truncate">{product.name}</h1>
          {product.sku && <p className="font-body text-sm text-slate mt-0.5">SKU {product.sku}</p>}
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full border font-body text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-surface bg-deep p-4">
          <p className="font-body text-xs text-slate">Em estoque</p>
          <p className={`font-display text-2xl font-semibold mt-1 ${
            product.quantity <= product.min_quantity && product.min_quantity > 0
              ? 'text-amber-400'
              : 'text-white'
          }`}>{product.quantity}</p>
          {product.min_quantity > 0 && (
            <p className="font-body text-xs text-slate mt-1">Mínimo: {product.min_quantity}</p>
          )}
        </div>
        <div className="rounded-xl border border-surface bg-deep p-4">
          <p className="font-body text-xs text-slate">Preço de venda</p>
          <p className="font-display text-xl font-semibold text-white mt-1">
            {product.sale_price != null
              ? `R$ ${product.sale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
              : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-surface bg-deep p-4 col-span-2 sm:col-span-1">
          <p className="font-body text-xs text-slate">Validade</p>
          <p className="font-body text-sm text-white font-medium mt-1">
            {product.expiry_date
              ? new Date(product.expiry_date + 'T00:00:00').toLocaleDateString('pt-BR')
              : '—'}
          </p>
          {product.manufacture_date && (
            <p className="font-body text-xs text-slate mt-1">
              Fab. {new Date(product.manufacture_date + 'T00:00:00').toLocaleDateString('pt-BR')}
            </p>
          )}
        </div>
      </div>

      {/* Registrar venda */}
      <div className="rounded-xl border border-green/20 bg-green/5 p-4 space-y-4">
        <h2 className="font-body text-sm font-medium text-white">Registrar venda</h2>
        <SaleForm productId={product.id} salePrice={product.sale_price} />
      </div>

      {/* Registrar movimentação */}
      <div className="rounded-xl border border-surface bg-deep p-4 space-y-4">
        <h2 className="font-body text-sm font-medium text-white">Ajuste de estoque</h2>
        <MovementForm productId={product.id} />
      </div>

      {/* Editar produto */}
      <div className="rounded-xl border border-surface bg-deep p-4 space-y-4">
        <h2 className="font-body text-sm font-medium text-white">Dados do produto</h2>
        <ProductForm product={product} />
      </div>

      {/* Histórico de vendas */}
      {sales.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-body text-sm font-medium text-white">Vendas ({sales.length})</h2>
          <div className="rounded-xl border border-surface overflow-hidden">
            <div className="divide-y divide-surface">
              {sales.map(sale => (
                <div key={sale.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-white font-medium">{sale.contact_name}</p>
                    <p className="font-body text-xs text-slate mt-0.5">
                      {sale.quantity} un. × R$ {sale.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      {sale.contact_phone && ` · ${sale.contact_phone}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-body text-sm text-green font-medium">
                      R$ {(sale.quantity * sale.unit_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="font-body text-xs text-slate mt-0.5">
                      {new Date(sale.sold_at + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Histórico de movimentações */}
      {movements.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-body text-sm font-medium text-white">Histórico de movimentações</h2>
          <div className="rounded-xl border border-surface overflow-hidden">
            <div className="divide-y divide-surface">
              {movements.map(mv => {
                const info = MOVEMENT_LABELS[mv.type]
                return (
                  <div key={mv.id} className="flex items-center gap-4 px-4 py-3">
                    <span className={`font-display text-base font-semibold w-6 text-center ${info.color}`}>
                      {info.sign}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm text-white">
                        {info.label} — <span className="font-medium">{mv.quantity} un.</span>
                      </p>
                      {mv.notes && (
                        <p className="font-body text-xs text-slate mt-0.5 truncate">{mv.notes}</p>
                      )}
                    </div>
                    <p className="font-body text-xs text-slate shrink-0">
                      {new Date(mv.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
