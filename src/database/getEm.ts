import type { EntityManager } from "@mikro-orm/mongodb";
import { getOrm } from "./getOrm";

export async function getEm() {
  const orm = await getOrm();
  return orm.em.fork() as EntityManager;
}
