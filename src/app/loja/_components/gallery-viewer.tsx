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

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
        <Car size={48} className="text-white/10" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 min-w-0">
      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-white/5">
        <Image
          src={images[active]}
          alt={vehicleName}
          fill
          className="object-cover transition-opacity duration-200"
          priority
          sizes="(max-width: 1024px) 100vw, 700px"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={[
                'relative h-14 w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all',
                i === active
                  ? 'border-[#C8F135] opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-80',
              ].join(' ')}
            >
              <Image src={src} alt={`Foto ${i + 1}`} fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
