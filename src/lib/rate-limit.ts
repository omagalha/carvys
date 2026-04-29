import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

function makeRedis() {
  const url   = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

export function makeRateLimiter(requests: number, windowSeconds: number) {
  const redis = makeRedis()
  if (!redis) return null

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, `${windowSeconds}s`),
    analytics: false,
  })
}

export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<boolean> {
  if (!limiter) return true // sem Redis configurado, deixa passar
  const { success } = await limiter.limit(identifier)
  return success
}
