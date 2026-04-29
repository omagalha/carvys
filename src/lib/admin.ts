const raw = process.env.ADMIN_EMAILS ?? 'usecarvys@gmail.com'
export const ADMIN_EMAILS = raw.split(',').map(e => e.trim().toLowerCase())

export function isAdmin(email: string | undefined) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}
