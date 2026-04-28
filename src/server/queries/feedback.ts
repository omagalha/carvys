import { createAdminClient } from '@/lib/supabase/admin'

export type FeedbackSuggestion = {
  id: string
  tenant_name: string
  submitter_name: string | null
  submitter_email: string | null
  title: string
  description: string
  status: 'pending' | 'reviewing' | 'planned' | 'done'
  created_at: string
}

export async function getAllFeedback(): Promise<FeedbackSuggestion[]> {
  const admin = createAdminClient()
  const { data } = await admin
    .from('feedback_suggestions')
    .select('id, tenant_name, submitter_name, submitter_email, title, description, status, created_at')
    .order('created_at', { ascending: false })
  return (data ?? []) as FeedbackSuggestion[]
}
