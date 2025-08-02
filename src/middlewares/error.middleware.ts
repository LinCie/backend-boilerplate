import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { logger } from "@/utilities/logger.utility";
import { NODE_ENV } from "@/configs/env.config";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  UniqueConstraintError,
} from "@/structures/error.structure";

function errorMiddleware(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) {
  // Log all errors. In a production environment, you might want to use
  logger.error(err);

  if (err instanceof ZodError) {
    return res.status(400).send({
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
  }

  const customErrors = [
    { ErrorClass: NotFoundError, statusCode: 404 },
    { ErrorClass: BadRequestError, statusCode: 400 },
    { ErrorClass: UnauthorizedError, statusCode: 401 },
    { ErrorClass: ForbiddenError, statusCode: 403 },
    { ErrorClass: UniqueConstraintError, statusCode: 409 },
  ];

  for (const customError of customErrors) {
    if (err instanceof customError.ErrorClass && err instanceof Error) {
      return res.status(customError.statusCode).send({ message: err.message });
    }
  }

  // For other errors, hide details in production
  if (NODE_ENV === "production") {
    return res.status(500).send({ message: "Internal Server Error" });
  }

  // In development, provide more details
  if (err instanceof Error) {
    return res.status(500).send({ message: err.message, stack: err.stack });
  }

  return res.status(500).send({ message: "An unknown error occurred" });
}

export { errorMiddleware };
