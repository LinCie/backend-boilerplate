import { Entity, Property, Unique } from "@mikro-orm/core";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class User extends BaseEntity {
  @Property()
  @Unique()
  username: string;

  @Property({ hidden: true })
  hash: string;

  constructor(username: string, hash: string) {
    super();

    this.username = username;
    this.hash = hash;
  }
}
