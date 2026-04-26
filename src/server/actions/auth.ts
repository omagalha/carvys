'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validations/auth'

const MAX_ATTEMPTS   = 5
const BLOCK_MINUTES  = 15

function hashEmail(email: string) {
  return createHash('sha256').update(email.toLowerCase().trim()).digest('hex')
}

async function checkRateLimit(email: string): Promise<string | null> {
  const admin = createAdminClient()
  const key   = hashEmail(email)
  const now   = new Date()

  const { data } = await admin
    .from('login_attempts')
    .select('count, blocked_until')
    .eq('email_hash', key)
    .single()

  if (data?.blocked_until && new Date(data.blocked_until) > now) {
    const minutes = Math.ceil((new Date(data.blocked_until).getTime() - now.getTime()) / 60000)
    return `Conta temporariamente bloqueada. Tente novamente em ${minutes} min.`
  }

  return null
}

async function recordFailedAttempt(email: string) {
  const admin = createAdminClient()
  const key   = hashEmail(email)
  const now   = new Date()

  const { data } = await admin
    .from('login_attempts')
    .select('count')
    .eq('email_hash', key)
    .single()

  const count       = (data?.count ?? 0) + 1
  const blockedUntil = count >= MAX_ATTEMPTS
    ? new Date(now.getTime() + BLOCK_MINUTES * 60 * 1000).toISOString()
    : null

  await admin.from('login_attempts').upsert({
    email_hash:    key,
    count,
    blocked_until: blockedUntil,
    last_attempt:  now.toISOString(),
  })
}

async function clearAttempts(email: string) {
  const admin = createAdminClient()
  await admin.from('login_attempts').delete().eq('email_hash', hashEmail(email))
}

export type AuthState = { error: string; success?: boolean; userId?: string }

async function upsertProfile(userId: string, fullName?: string | null) {
  const admin = createAdminClient()

  const { error } = await admin
    .from('profiles')
    .upsert(
      {
        id: userId,
        full_name: fullName ?? null,
      },
      { onConflict: 'id' }
    )

  if (error) {
    console.error('[upsertProfile error]', error.code, error.message)
  }
}

export async function login(
  _state: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }
  }

  const blocked = await checkRateLimit(parsed.data.email)
  if (blocked) return { error: blocked }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    console.error('[login error]', error.message, error.code)

    await recordFailedAttempt(parsed.data.email)

    if (
      error.message.toLowerCase().includes('email') &&
      error.message.toLowerCase().includes('confirm')
    ) {
      return {
        error: 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.',
      }
    }

    return { error: 'E-mail ou senha incorretos.' }
  }

  await clearAttempts(parsed.data.email)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await upsertProfile(
      user.id,
      typeof user.user_metadata?.full_name === 'string'
        ? user.user_metadata.full_name
        : null
    )
  }

  const cookieStore = await cookies()
  const returnTo = cookieStore.get('invite_return')?.value
  if (returnTo) {
    cookieStore.delete('invite_return')
    redirect(returnTo)
  }

  if (user?.email === 'usecarvys@gmail.com') redirect('/admin')

  redirect('/app/dashboard')
}

export async function signup(
  _state: AuthState,
  formData: FormData
): Promise<AuthState> {
  const raw = {
    full_name:        formData.get('full_name') as string,
    email:            formData.get('email') as string,
    password:         formData.get('password') as string,
    confirm_password: formData.get('confirm_password') as string,
  }

  if (raw.password !== raw.confirm_password) {
    return { error: 'As senhas não coincidem.' }
  }

  const parsed = signupSchema.safeParse(raw)

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Dados invalidos.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
    },
  })

  if (error) {
    console.error('[signup error]', error.message, error.code)
    return { error: error.message }
  }

  if (data.user) {
    await upsertProfile(data.user.id, parsed.data.full_name)
  }

  if (data.session) {
    redirect('/app/dashboard')
  }

  return { error: '', success: true, userId: data.user?.id }
}

export async function saveSignupPhone(
  _state: AuthState,
  formData: FormData
): Promise<AuthState> {
  const phone = (formData.get('phone') as string)?.trim()
  if (!phone) return { error: 'Informe seu telefone.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão inválida.' }

  const admin = createAdminClient()
  await admin.from('profiles').update({ phone }).eq('id', user.id)

  return { error: '', success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
