import Link from 'next/link'
import { Plus, Package, AlertTriangle, XCircle } from 'lucide-react'
import { getProducts, getExpiryStatus } from '@/server/queries/products'

const EXPIRY_BADGE: Record<string, { label: string; className: string }> = {
  expired:  { label: 'Vencido',   className: 'bg-red-500/15 text-red-400' },
  expiring: { label: 'Vencendo',  className: 'bg-amber-500/15 text-amber-400' },
  ok:       { label: 'OK',        className: 'bg-green/15 text-green' },
  none:     { label: '—',         className: 'bg-surface text-slate' },
}

export default async function ProdutosPage() {
  const products = await getProducts()

  const expired  = products.filter(p => getExpiryStatus(p.expiry_date) === 'expired')
  const expiring = products.filter(p => getExpiryStatus(p.expiry_date) === 'expiring')
  const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= p.min_quantity)

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-white">Produtos</h1>
          <p className="font-body text-sm text-slate mt-0.5">{products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/app/produtos/novo"
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-green text-void font-body text-sm font-medium hover:bg-green/90 transition-colors"
        >
          <Plus size={16} strokeWidth={2.5} />
          Novo produto
        </Link>
      </div>

      {/* Alertas */}
      {(expired.length > 0 || expiring.length > 0 || lowStock.length > 0) && (
        <div className="space-y-2">
          {expired.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <XCircle size={16} className="text-red-400 shrink-0" />
              <p className="font-body text-sm text-red-300">
                <span className="font-medium">{expired.length} produto{expired.length > 1 ? 's' : ''} vencido{expired.length > 1 ? 's' : ''}</span>
                {' '}— {expired.map(p => p.name).join(', ')}
              </p>
            </div>
          )}
          {expiring.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={16} className="text-amber-400 shrink-0" />
              <p className="font-body text-sm text-amber-300">
                <span className="font-medium">{expiring.length} produto{expiring.length > 1 ? 's' : ''} vencendo em 30 dias</span>
                {' '}— {expiring.map(p => p.name).join(', ')}
              </p>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle size={16} className="text-amber-400 shrink-0" />
              <p className="font-body text-sm text-amber-300">
                <span className="font-medium">{lowStock.length} produto{lowStock.length > 1 ? 's' : ''} com estoque baixo</span>
                {' '}— {lowStock.map(p => p.name).join(', ')}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lista */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Package size={40} className="text-slate mb-3" strokeWidth={1.25} />
          <p className="font-body text-white font-medium">Nenhum produto ainda</p>
          <p className="font-body text-sm text-slate mt-1">Cadastre o primeiro produto da loja</p>
          <Link
            href="/app/produtos/novo"
            className="mt-4 flex items-center gap-2 h-9 px-4 rounded-lg bg-green text-void font-body text-sm font-medium hover:bg-green/90 transition-colors"
          >
            <Plus size={16} strokeWidth={2.5} />
            Novo produto
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-surface overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface bg-surface/30">
                <th className="text-left font-body text-xs text-slate font-medium px-4 py-3">Nome</th>
                <th className="text-left font-body text-xs text-slate font-medium px-4 py-3 hidden md:table-cell">Categoria</th>
                <th className="text-left font-body text-xs text-slate font-medium px-4 py-3 hidden sm:table-cell">Preço</th>
                <th className="text-center font-body text-xs text-slate font-medium px-4 py-3">Qtd</th>
                <th className="text-left font-body text-xs text-slate font-medium px-4 py-3">Validade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface">
              {products.map(product => {
                const status = getExpiryStatus(product.expiry_date)
                const badge  = EXPIRY_BADGE[status]
                return (
                  <tr
                    key={product.id}
                    className="hover:bg-surface/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/app/produtos/${product.id}`} className="block">
                        <span className="font-body text-sm text-white font-medium">{product.name}</span>
                        {product.sku && (
                          <span className="block font-body text-xs text-slate mt-0.5">SKU {product.sku}</span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Link href={`/app/produtos/${product.id}`} className="block font-body text-sm text-slate">
                        {product.category ?? '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Link href={`/app/produtos/${product.id}`} className="block font-body text-sm text-slate">
                        {product.sale_price != null
                          ? `R$ ${product.sale_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                          : '—'}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link href={`/app/produtos/${product.id}`} className="block">
                        <span className={[
                          'font-body text-sm font-medium',
                          product.quantity <= product.min_quantity && product.min_quantity > 0
                            ? 'text-amber-400'
                            : 'text-white',
                        ].join(' ')}>
                          {product.quantity}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/app/produtos/${product.id}`} className="block">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-body text-xs font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                        {product.expiry_date && (
                          <span className="block font-body text-xs text-slate mt-0.5">
                            {new Date(product.expiry_date + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
