import { prisma } from "@/database/prisma"
import { redis } from "@/database/redis"

abstract class Service {
  public readonly prisma = prisma
  public readonly redis = redis
}

export { Service }
