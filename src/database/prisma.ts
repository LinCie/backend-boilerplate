import KSUID from "ksuid"
import { PrismaClient, Prisma } from "@generated/prisma"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const idGeneratorExtension = Prisma.defineExtension({
  name: "idGenerator",
  query: {
    async $allOperations({ args, query, operation }) {
      // Do nothing if it's not create
      if (operation !== "create") {
        return query(args)
      }

      const ksuid = await KSUID.random()
      return query({ ...args, data: { ...args.data, id: ksuid.string } })
    },
  },
})

if (globalForPrisma.prisma === undefined) {
  globalForPrisma.prisma = new PrismaClient({
    log: ["query", "error", "warn"],
  }).$extends(idGeneratorExtension) as PrismaClient
}

export const prisma = globalForPrisma.prisma
