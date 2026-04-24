'use client'

import { useState, useId } from 'react'
import { ImagePlus, Trash2, Star, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/browser'

interface Props {
  vehicleId: string
  tenantId: string
}

export function PhotoUploadField({ vehicleId, tenantId }: Props) {
  const inputId = useId()
  const [cover, setCover]         = useState<string | null>(null)
  const [gallery, setGallery]     = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')
  const [dragging, setDragging]   = useState(false)
  const supabase = createClient()

  function getPublicUrl(path: string) {
    const { data } = supabase.storage.from('vehicles').getPublicUrl(path)
    return data.publicUrl
  }

  async function handleFiles(files: FileList) {
    if (uploading) return
    setUploading(true)
    setError('')
    const newPaths: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      if (file.size > 10 * 1024 * 1024) { setError('Máximo 10MB por foto.'); continue }

      const ext  = file.name.split('.').pop() ?? 'jpg'
      const path = `${tenantId}/${vehicleId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('vehicles')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (uploadError) setError('Erro ao enviar foto. Tente novamente.')
      else newPaths.push(path)
    }

    if (newPaths.length > 0) {
      setGallery(prev => {
        const next = [...prev, ...newPaths]
        if (!cover) setCover(next[0])
        return next
      })
    }

    setUploading(false)
  }

  async function handleDelete(path: string) {
    await supabase.storage.from('vehicles').remove([path])
    setGallery(prev => {
      const next = prev.filter(p => p !== path)
      if (cover === path) setCover(next[0] ?? null)
      return next
    })
  }

  function handleMove(index: number, direction: 'left' | 'right') {
    setGallery(prev => {
      const next      = [...prev]
      const swapIndex = direction === 'left' ? index - 1 : index + 1
      ;[next[index], next[swapIndex]] = [next[swapIndex], next[index]]
      return next
    })
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-deep border border-surface p-5">
      {/* Hidden inputs enviados com o form */}
      <input type="hidden" name="cover_image_path" value={cover ?? ''} />
      <input type="hidden" name="gallery"           value={JSON.stringify(gallery)} />

      {/* Input file — acionado via label */}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={uploading}
        onChange={e => e.target.files && handleFiles(e.target.files)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-body font-semibold text-white text-sm">
          Fotos {gallery.length > 0 && <span className="text-slate font-normal">({gallery.length})</span>}
        </h2>
        <label
          htmlFor={inputId}
          className={[
            'flex items-center gap-2 h-8 px-3 rounded-lg border border-surface transition-colors cursor-pointer',
            uploading ? 'opacity-50 pointer-events-none' : 'hover:border-slate/40',
          ].join(' ')}
        >
          {uploading
            ? <Loader2 size={14} className="text-slate animate-spin" />
            : <ImagePlus size={14} className="text-slate" />
          }
          <span className="font-body text-xs text-slate">
            {uploading ? 'Enviando...' : 'Adicionar'}
          </span>
        </label>
      </div>

      {error && <p className="font-body text-xs text-alert">{error}</p>}

      {/* Estado vazio — drop zone */}
      {gallery.length === 0 && (
        <label
          htmlFor={inputId}
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          className={[
            'flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-12 transition-colors cursor-pointer',
            uploading  ? 'opacity-50 pointer-events-none border-surface' :
            dragging   ? 'border-green/50 bg-green/5' : 'border-surface hover:border-slate/40',
          ].join(' ')}
        >
          <ImagePlus size={24} className={dragging ? 'text-green' : 'text-slate'} />
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="font-body text-xs text-slate">Clique ou arraste fotos aqui</span>
            <span className="font-body text-[10px] text-slate/50">JPG, PNG, WEBP — máx. 10MB</span>
          </div>
        </label>
      )}

      {/* Grid de fotos */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {gallery.map((path, index) => {
            const isCover = path === cover
            const isFirst = index === 0
            const isLast  = index === gallery.length - 1
            return (
              <div key={path} className="relative group aspect-[4/3] rounded-lg overflow-hidden bg-surface">
                <img src={getPublicUrl(path)} alt="" className="w-full h-full object-cover" />

                {isCover && (
                  <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-green/90 text-void rounded-full px-2 py-0.5">
                    <Star size={9} fill="currentColor" />
                    <span className="font-body text-[9px] font-semibold">Capa</span>
                  </div>
                )}

                {gallery.length > 1 && (
                  <>
                    {!isFirst && (
                      <button type="button" onClick={() => handleMove(index, 'left')}
                        className="absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-black/60 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100">
                        <ChevronLeft size={12} className="text-white" />
                      </button>
                    )}
                    {!isLast && (
                      <button type="button" onClick={() => handleMove(index, 'right')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center justify-center h-6 w-6 rounded-full bg-black/60 hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100">
                        <ChevronRight size={12} className="text-white" />
                      </button>
                    )}
                  </>
                )}

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-1.5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isCover ? (
                    <button type="button" onClick={() => setCover(path)}
                      className="flex items-center gap-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded px-1.5 py-0.5 transition-colors">
                      <Star size={9} className="text-white" />
                      <span className="font-body text-[9px] text-white">Capa</span>
                    </button>
                  ) : <span />}
                  <button type="button" onClick={() => handleDelete(path)}
                    className="flex items-center justify-center bg-alert/80 hover:bg-alert backdrop-blur-sm rounded p-1 transition-colors">
                    <Trash2 size={10} className="text-white" />
                  </button>
                </div>
              </div>
            )
          })}

          {/* Adicionar mais */}
          <label
            htmlFor={inputId}
            className={[
              'aspect-[4/3] flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-surface transition-colors cursor-pointer',
              uploading ? 'opacity-50 pointer-events-none' : 'hover:border-slate/40',
            ].join(' ')}
          >
            {uploading
              ? <Loader2 size={16} className="text-slate animate-spin" />
              : <ImagePlus size={16} className="text-slate" />
            }
            <span className="font-body text-[10px] text-slate">Adicionar</span>
          </label>
        </div>
      )}
    </div>
  )
}
