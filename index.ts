import { app } from "@/server"
import { PORT } from "@/configs/env.config"
import { logger } from "@/utilities/logger.utility"

app.listen(PORT, () => {
  logger.info(`Server is listening to port ${PORT} 🦊`)
})
