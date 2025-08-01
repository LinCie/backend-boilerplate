import express from "express"
import morgan from "morgan"
import helmet from "helmet"
import cors from "cors"

import { FRONTEND_URL } from "@/configs/env.config"
import { errorMiddleware } from "@/middlewares/error.middleware"
import { logger } from "@/utilities/logger.utility"

import { AuthController } from "./modules"

const app = express()

// Before request middlewares
app
  .use(
    morgan("tiny", {
      stream: {
        write: (message) => {
          logger.info(message.trim())
        },
      },
    })
  )
  .use(helmet())
  .use(cors({ origin: FRONTEND_URL }))
  .use(express.json())

// Regular Routes
app
  // Index
  .get("/", (req, res) => {
    res.send("Hello World!")
  })
  .use("/auth", new AuthController().router)

// After request middlewares
app.use(errorMiddleware)

export { app }
