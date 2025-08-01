/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test, describe, mock, beforeAll, afterAll } from "bun:test"
import { AuthService } from "../src/modules/auth/auth.service"
import * as argon2 from "argon2"
import * as jwt from "jsonwebtoken"

describe("AuthService", () => {
  let authService: AuthService

  beforeAll(() => {
    authService = new AuthService()
  })

  afterAll(() => {
    mock.restore()
  })

  describe("generateToken", () => {
    test("should generate an access token", async () => {
      const userId = "user123"
      const token = await authService.generateToken(userId, "access")
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
      expect(decoded.sub).toBe(userId)
    })

    test("should generate a refresh token and store it in Redis", async () => {
      const userId = "user123"
      const token = await authService.generateToken(userId, "refresh")
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
      expect(decoded.sub).toBe(userId)
    })
  })

  describe("signup", () => {
    test("should create a new user and return tokens", async () => {
      const userData = { username: "testuser", password: "password" }
      const hashedPassword = await argon2.hash(userData.password)

      // Mock Prisma calls
      ;(authService.prisma.user.findUnique as any).mockResolvedValue(null)
      ;(authService.prisma.user.create as any).mockResolvedValue({
        id: "user123",
        username: userData.username,
        hash: hashedPassword,
      })

      const tokens = await authService.signup(userData)
      expect(tokens).toHaveProperty("accessToken")
      expect(tokens).toHaveProperty("refreshToken")
    })
  })

  describe("signin", () => {
    test("should return tokens for valid credentials", async () => {
      const userData = { username: "testuser", password: "password" }
      const hashedPassword = await argon2.hash(userData.password)

      // Mock Prisma calls
      ;(authService.prisma.user.findUnique as any).mockResolvedValue({
        id: "user123",
        username: userData.username,
        hash: hashedPassword,
      })

      const tokens = await authService.signin(userData)
      expect(tokens).toHaveProperty("accessToken")
      expect(tokens).toHaveProperty("refreshToken")
    })
  })
})
