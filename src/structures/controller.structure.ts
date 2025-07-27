import express from "express"
import type { RequestHandler } from "express"
import type { ZodTypeAny } from "zod"
import { validatorMiddleware } from "@/middlewares/validator.middleware"

interface RouteDefinition {
  method: "get" | "post" | "put" | "delete" | "patch"
  path: string
  handler: RequestHandler
  schema?: ZodTypeAny
  middlewares?: RequestHandler[]
}

abstract class Controller {
  public readonly router = express.Router({ mergeParams: true })

  protected bindRoutes(routes: RouteDefinition[]): void {
    routes.forEach(({ method, path, handler, middlewares, schema }) => {
      // Middlewares
      const mws = (middlewares ?? []).map((mw) =>
        this.asyncHandler(mw.bind(this))
      )

      // Validators
      const validators = schema ? [validatorMiddleware(schema)] : []

      // Handler
      const finalHandler = this.asyncHandler(handler.bind(this))

      this.router[method](path, ...mws, ...validators, finalHandler)
    })
  }

  private asyncHandler(fn: RequestHandler): RequestHandler {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next)
    }
  }
}

export { Controller }
export type { RouteDefinition }
