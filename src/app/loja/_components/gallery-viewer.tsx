'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Car } from 'lucide-react'

type Props = {
  images: string[]
  vehicleName: string
}

export function GalleryViewer({ images, vehicleName }: Props) {
  const [active, setActive] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-[#0A0A0F] border border-white/5 flex items-center justify-center">
        <Car size={48} className="text-white/10" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      
      {/* Imagem principal */}
      <div className="relative aspect-[16/10] max-h-[520px] rounded-2xl overflow-hidden bg-[#050507] border border-white/10 group">
        <Image
          key={images[active]}
          src={images[active]}
          alt={vehicleName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 700px"
          className="object-contain transition-all duration-500 ease-out group-hover:scale-[1.01]"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={[
                'relative h-16 w-24 shrink-0 rounded-lg overflow-hidden border transition-all duration-200',
                i === active
                  ? 'border-[#C8F135] opacity-100 scale-[1.02]'
                  : 'border-white/10 opacity-50 hover:opacity-80 hover:border-white/20',
              ].join(' ')}
            >
              <Image
                src={src}
                alt={`Foto ${i + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}