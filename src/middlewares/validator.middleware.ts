import type { NextFunction, Request, Response } from "express"
import type { ZodTypeAny } from "zod"

const validatorMiddleware =
  (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse(req.body)
      req.validated = result
      next()
    } catch (error) {
      next(error)
    }
  }

export { validatorMiddleware }
