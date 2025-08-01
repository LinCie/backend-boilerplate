import * as argon2 from "argon2"
import * as jwt from "jsonwebtoken"
import KSUID from "ksuid"

import { JWT_SECRET } from "@/configs/env.config"
import {
  UnauthorizedError,
  UniqueConstraintError,
} from "@/structures/error.structure"
import { Service } from "@/structures/service.structure"

import type { AuthSchema } from "./auth.schema"

const REFRESH_TOKEN_EXPIRES_IN = "7d"
const ACCESS_TOKEN_EXPIRES_IN = "15m"
const REDIS_REFRESH_TOKEN_PREFIX = "refresh_token:"
const REDIS_REFRESH_TOKEN_EXPIRES_IN_SECONDS = 60 * 60 * 24 * 7

class AuthService extends Service {
  async generateToken(
    id: string,
    type: "access" | "refresh",
    session?: string
  ) {
    const ksuid = await KSUID.random()
    const sessionId = session ?? ksuid.string

    const payload = {
      sub: id,
      jti: sessionId,
    }

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn:
        type === "refresh" ? REFRESH_TOKEN_EXPIRES_IN : ACCESS_TOKEN_EXPIRES_IN,
    })

    if (type === "refresh") {
      const redisId = `${REDIS_REFRESH_TOKEN_PREFIX}${id}:${sessionId}`
      const hashedToken = await argon2.hash(token)
      await this.redis.set(
        redisId,
        hashedToken,
        "EX",
        REDIS_REFRESH_TOKEN_EXPIRES_IN_SECONDS
      )
    }

    return token
  }

  async verifyAccessToken(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
      return payload.sub
    } catch {
      throw new UnauthorizedError()
    }
  }

  async verifyRefreshToken(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
      const identifier = `${REDIS_REFRESH_TOKEN_PREFIX}${payload.sub}:${payload.jti}`

      const refreshToken = await this.redis.get(identifier)

      if (!refreshToken) {
        throw new UnauthorizedError()
      }

      if (await argon2.verify(refreshToken, token)) {
        await this.redis.del(identifier)
        return { sub: payload.sub ?? "", jti: payload.jti ?? "" }
      }
      throw new UnauthorizedError()
    } catch {
      throw new UnauthorizedError()
    }
  }

  async signin(data: AuthSchema) {
    const user = await this.prisma.user.findUnique({
      where: {
        username: data.username,
      },
    })

    if (!user) {
      throw new UnauthorizedError()
    }

    const isValid = await argon2.verify(user.hash, data.password)

    if (!isValid) {
      throw new UnauthorizedError()
    }

    return {
      accessToken: await this.generateToken(user.id, "access"),
      refreshToken: await this.generateToken(user.id, "refresh"),
    }
  }

  async signup(data: AuthSchema) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        username: data.username,
      },
    })

    if (existingUser) {
      throw new UniqueConstraintError()
    }

    const user = await this.prisma.user.create({
      data: {
        username: data.username,
        hash: await argon2.hash(data.password),
      },
    })

    return {
      accessToken: await this.generateToken(user.id, "access"),
      refreshToken: await this.generateToken(user.id, "refresh"),
    }
  }

  async signout(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
      await this.redis.del(
        `${REDIS_REFRESH_TOKEN_PREFIX}${payload.sub}:${payload.jti}`
      )
    } catch {
      throw new UnauthorizedError()
    }
  }

  async refresh(token: string) {
    const payload = await this.verifyRefreshToken(token)

    return {
      accessToken: await this.generateToken(payload.sub, "access", payload.jti),
      refreshToken: await this.generateToken(
        payload.sub,
        "refresh",
        payload.jti
      ),
    }
  }
}

export { AuthService }
