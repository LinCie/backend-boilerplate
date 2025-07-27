import { PrismaClient } from "../../generated/prisma"

abstract class Service {
  public readonly prisma = new PrismaClient()
}

export { Service }
