import { getAllTenants } from '@/server/queries/admin'
import { MensagensForm } from './mensagens-form'

export default async function MensagensPage() {
  const tenants = await getAllTenants()

  return (
    <div className="p-6 flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-white text-2xl">Central de mensagens</h1>
        <p className="font-body text-sm text-slate mt-0.5">
          Envie WhatsApp para clientes via canal oficial da Carvys
        </p>
      </div>

      <MensagensForm tenants={tenants.map(t => ({ id: t.id, name: t.name, status: t.status }))} />
    </div>
  )
}
