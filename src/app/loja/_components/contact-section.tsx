import { Mail, Phone, MapPin, Clock } from 'lucide-react'

type Props = {
  tenantName: string
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  businessHours: string | null
}

export function ContactSection({ tenantName, contactEmail, contactPhone, address, businessHours }: Props) {
  if (!contactEmail && !contactPhone && !address && !businessHours) return null

  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-white/5" />
        <span className="font-body text-xs text-white/30 font-semibold uppercase tracking-widest">Contato &amp; Localização</span>
        <span className="h-px flex-1 bg-white/5" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col rounded-2xl border border-white/5 overflow-hidden">
          {contactEmail && (
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
              <Mail size={14} className="text-white/25 shrink-0" />
              <span className="font-body text-xs text-white/40 w-20 shrink-0">E-mail</span>
              <a href={`mailto:${contactEmail}`} className="font-body text-sm text-white/70 hover:text-white transition-colors truncate">
                {contactEmail}
              </a>
            </div>
          )}
          {contactPhone && (
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
              <Phone size={14} className="text-white/25 shrink-0" />
              <span className="font-body text-xs text-white/40 w-20 shrink-0">Telefone</span>
              <a href={`tel:${contactPhone.replace(/\D/g, '')}`} className="font-body text-sm text-white/70 hover:text-white transition-colors">
                {contactPhone}
              </a>
            </div>
          )}
          {address && (
            <div className="flex items-start gap-3 px-4 py-3.5 border-b border-white/5">
              <MapPin size={14} className="text-white/25 shrink-0 mt-0.5" />
              <span className="font-body text-xs text-white/40 w-20 shrink-0">Endereço</span>
              <span className="font-body text-sm text-white/70 leading-relaxed">{address}</span>
            </div>
          )}
          {businessHours && (
            <div className="flex items-center gap-3 px-4 py-3.5">
              <Clock size={14} className="text-white/25 shrink-0" />
              <span className="font-body text-xs text-white/40 w-20 shrink-0">Horário</span>
              <span className="font-body text-sm text-white/70">{businessHours}</span>
            </div>
          )}
        </div>

        {address && (
          <div className="rounded-2xl overflow-hidden border border-white/5 min-h-[220px]">
            <iframe
              src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0, display: 'block', minHeight: '220px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Localização ${tenantName}`}
            />
          </div>
        )}
      </div>
    </section>
  )
}
