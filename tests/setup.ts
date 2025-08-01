import { mock } from "bun:test";

mock.module("@/database/prisma", () => ({
  prisma: {
    user: {
      findUnique: mock(() => {}),
      create: mock(() => {}),
    },
  },
}));

mock.module("@/database/redis", () => ({
  redis: {
    set: mock(() => {}),
    get: mock(() => {}),
    del: mock(() => {}),
  },
}));
