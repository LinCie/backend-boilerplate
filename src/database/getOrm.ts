import { MikroORM } from "@mikro-orm/mongodb";

export function getOrm() {
  return MikroORM.init({
    dbName: Bun.env.NODE_ENV,
    clientUrl: Bun.env.MONGODB,
    entities: ["./dist/database/entities"],
    entitiesTs: ["./src/database/entities"],
  });
}
