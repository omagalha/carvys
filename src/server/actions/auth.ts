'use server'

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validations/auth'

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

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) {
    console.error('[login error]', error.message, error.code)

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
  const userId = formData.get('user_id') as string
  const phone  = (formData.get('phone') as string)?.trim()

  if (!userId) return { error: 'Sessão inválida.' }
  if (!phone)  return { error: 'Informe seu telefone.' }

  const admin = createAdminClient()
  await admin.from('profiles').update({ phone }).eq('id', userId)

  return { error: '', success: true }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
