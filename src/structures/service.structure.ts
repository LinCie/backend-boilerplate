import { prisma } from "@/database/prisma"
import { redis } from "@/database/redis"

abstract class Service {
  protected readonly prisma = prisma
  protected readonly redis = redis
}

export { Service }
