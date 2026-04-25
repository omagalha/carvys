export const PLAN_LIMITS: Record<string, { maxMembers: number }> = {
  trial:   { maxMembers: 1 },
  starter: { maxMembers: 1 },
  pro:     { maxMembers: 2 },
  elite:   { maxMembers: 3 },
}

export function getPlanLimits(planCode: string) {
  return PLAN_LIMITS[planCode] ?? PLAN_LIMITS.trial
}

export const ROLE_LABELS: Record<string, string> = {
  owner: 'Dono',
  admin: 'Gerente',
  sales: 'Vendedor',
}
