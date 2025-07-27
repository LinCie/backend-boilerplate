import type { NextFunction, Request, Response } from "express"
import { ZodError } from "zod"
import { logger } from "@/utilities/logger.utility"
import { NODE_ENV } from "@/configs/env.config"

function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  if (NODE_ENV === "development") {
    logger.error(err)
  }

  if (!(err instanceof Error)) {
    res.status(500).send({ message: "Unknown error occurred" })
    return
  }

  if (err instanceof ZodError) {
    res
      .status(400)
      .send({ message: err.message, errors: err.errors, cause: err.cause })
    return
  }

  switch (err.constructor.name) {
    case "NotFoundError":
      res.status(404).send({ message: err.message })
      return

    case "BadRequestError":
      res.status(400).send({ message: err.message })
      return

    case "UnauthorizedError":
      res.status(401).send({ message: err.message })
      return

    case "ForbiddenError":
      res.status(403).send({ message: err.message })
      return

    case "UniqueConstraintError":
      res.status(409).send({ message: err.message })
      return

    default:
      res.status(500).send({ message: "Internal Server Error" })
      return
  }
}

export { errorMiddleware }
