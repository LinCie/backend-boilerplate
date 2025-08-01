import type { Request, Response } from "express"

import { Controller } from "@/structures/controller.structure"

import { authSchema, refreshSchema } from "./auth.schema"
import { AuthService } from "./auth.service"

class AuthController extends Controller {
  private readonly authService = new AuthService()

  constructor() {
    super()
    this.bindRoutes([
      {
        path: "/signup",
        method: "post",
        handler: this.signup,
        schema: authSchema,
      },
      {
        path: "/signin",
        method: "post",
        handler: this.signin,
        schema: authSchema,
      },
      {
        path: "/signout",
        method: "post",
        handler: this.signout,
        schema: refreshSchema,
      },
      {
        path: "/refresh",
        method: "post",
        handler: this.refresh,
        schema: refreshSchema,
      },
    ])
  }

  async signup(req: Request, res: Response) {
    const data = req.validated
    const tokens = await this.authService.signup(data)
    res.send(tokens)
  }

  async signin(req: Request, res: Response) {
    const data = req.validated
    const tokens = await this.authService.signin(data)
    res.send(tokens)
  }

  async signout(req: Request, res: Response) {
    const { refreshToken } = req.validated
    await this.authService.signout(refreshToken)
    res.status(204).send()
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.validated
    const tokens = await this.authService.refresh(refreshToken)
    res.send(tokens)
  }
}

export { AuthController }
