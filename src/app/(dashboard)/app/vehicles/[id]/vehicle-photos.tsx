'use client'

import { useState, useRef } from 'react'
import { ImagePlus, Trash2, Star, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'
import { updateVehiclePhotos } from '@/server/actions/vehicles'

interface Props {
  vehicleId: string
  tenantId: string
  initialCover: string | null
  initialGallery: string[]
}

export function VehiclePhotos({ vehicleId, tenantId, initialCover, initialGallery }: Props) {
  const [cover, setCover] = useState(initialCover)
  const [gallery, setGallery] = useState(initialGallery)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  function getPublicUrl(path: string) {
    const { data } = supabase.storage.from('vehicles').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleFiles(files: FileList) {
    setUploading(true)
    setError('')
    const newPaths: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 10 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo 10MB por foto.')
        continue
      }

      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${tenantId}/${vehicleId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('vehicles')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (uploadError) {
        console.warn('[upload]', uploadError.message)
        setError('Erro ao enviar foto. Tente novamente.')
      } else {
        newPaths.push(path)
      }
    }

    if (newPaths.length > 0) {
      const newGallery = [...gallery, ...newPaths]
      const newCover = cover ?? newPaths[0]
      await updateVehiclePhotos(vehicleId, newCover, newGallery)
      setGallery(newGallery)
      setCover(newCover)
    }

    setUploading(false)
  }

  async function handleDelete(path: string) {
    await supabase.storage.from('vehicles').remove([path])
    const newGallery = gallery.filter(p => p !== path)
    const newCover = cover === path ? (newGallery[0] ?? null) : cover
    await updateVehiclePhotos(vehicleId, newCover, newGallery)
    setGallery(newGallery)
    setCover(newCover)
  }

  async function handleSetCover(path: string) {
    await updateVehiclePhotos(vehicleId, path, gallery)
    setCover(path)
  }

  async function handleMove(index: number, direction: 'left' | 'right') {
    const newGallery = [...gallery]
    const swapIndex = direction === 'left' ? index - 1 : index + 1
    ;[newGallery[index], newGallery[swapIndex]] = [newGallery[swapIndex], newGallery[index]]
    await updateVehiclePhotos(vehicleId, cover, newGallery)
    setGallery(newGallery)
  }

  return (
    <section className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-body font-semibold text-white text-sm">
          Fotos ({gallery.length})
        </h2>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 h-8 px-3 rounded-lg border border-surface hover:border-slate/40 transition-colors disabled:opacity-50"
        >
          {uploading
            ? <Loader2 size={14} className="text-slate animate-spin" />
            : <ImagePlus size={14} className="text-slate" />
          }
          <span className="font-body text-xs text-slate">
            {uploading ? 'Enviando...' : 'Adicionar fotos'}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="font-body text-xs text-alert">{error}</p>
      )}

      {gallery.length === 0 ? (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-surface py-10 hover:border-slate/40 transition-colors disabled:opacity-50"
        >
          <ImagePlus size={24} className="text-slate" />
          <span className="font-body text-xs text-slate">Clique para adicionar fotos</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {gallery.map((path, index) => {
            const isCover = path === cover
            const isFirst = index === 0
            const isLast = index === gallery.length - 1
            return (
              <div key={path} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-surface">
                <img
                  src={getPublicUrl(path)}
                  alt=""
                  className="w-full h-full object-cover"
                />

                {isCover && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-green/90 text-void rounded-full px-2 py-0.5">
                    <Star size={10} fill="currentColor" />
                    <span className="font-body text-[10px] font-semibold">Capa</span>
                  </div>
                )}

                {/* Setas de reordenação — sempre visíveis se houver mais de 1 foto */}
                {gallery.length > 1 && (
                  <>
                    {!isFirst && (
                      <button
                        onClick={() => handleMove(index, 'left')}
                        className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                        title="Mover para esquerda"
                      >
                        <ChevronLeft size={14} className="text-white" />
                      </button>
                    )}
                    {!isLast && (
                      <button
                        onClick={() => handleMove(index, 'right')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center h-7 w-7 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
                        title="Mover para direita"
                      >
                        <ChevronRight size={14} className="text-white" />
                      </button>
                    )}
                  </>
                )}

                {/* Ações: capa + excluir */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isCover ? (
                    <button
                      onClick={() => handleSetCover(path)}
                      className="flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-md px-2 py-1 transition-colors"
                      title="Definir como capa"
                    >
                      <Star size={10} className="text-white" />
                      <span className="font-body text-[10px] text-white">Capa</span>
                    </button>
                  ) : (
                    <span />
                  )}
                  <button
                    onClick={() => handleDelete(path)}
                    className="flex items-center justify-center bg-alert/80 hover:bg-alert backdrop-blur-sm rounded-md p-1 transition-colors"
                    title="Excluir foto"
                  >
                    <Trash2 size={11} className="text-white" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Botão de adicionar mais */}
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-[4/3] flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-surface hover:border-slate/40 transition-colors disabled:opacity-50"
          >
            {uploading
              ? <Loader2 size={18} className="text-slate animate-spin" />
              : <ImagePlus size={18} className="text-slate" />
            }
            <span className="font-body text-[10px] text-slate">Adicionar</span>
          </button>
        </div>
      )}
    </section>
  )
}
