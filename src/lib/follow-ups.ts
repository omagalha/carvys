export function isOverdue(due_at: string, status: string) {
  return status === 'pending' && new Date(due_at) < new Date()
}

export function formatDue(due_at: string) {
  const date = new Date(due_at)
  const now = new Date()
  const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 86400000)
  const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (dateOnly.getTime() === today.getTime())    return `Hoje às ${time}`
  if (dateOnly.getTime() === tomorrow.getTime()) return `Amanhã às ${time}`
  if (dateOnly < today) {
    const days = Math.round((today.getTime() - dateOnly.getTime()) / 86400000)
    return `Há ${days} dia${days > 1 ? 's' : ''}`
  }
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ` às ${time}`
}
