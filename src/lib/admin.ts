export const ADMIN_EMAILS = ['usecarvys@gmail.com']

export function isAdmin(email: string | undefined) {
  return !!email && ADMIN_EMAILS.includes(email.toLowerCase())
}
