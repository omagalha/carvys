import { z } from 'zod'

export const createTenantSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(80),
})
