import "express"
import type { z } from "zod"

declare module "express" {
  interface Request {
    validated?: z.infer<z.ZodTypeAny>
  }
}
