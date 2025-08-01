import { RedisClient } from "bun"
import { REDIS_URL } from "@/configs/env.config"

const globalForRedis = globalThis as unknown as {
  redis: RedisClient | undefined
}

if (globalForRedis.redis === undefined) {
  globalForRedis.redis = new RedisClient(REDIS_URL)
}

export const redis = globalForRedis.redis
