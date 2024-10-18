import express from "express";
import morgan from "morgan";

import userRoute from "./routes/Users.route";
import helmet from "helmet";

const app = express();

if (Bun.env.NODE_ENV === "production") {
  app.use(morgan("tiny"));
} else if (Bun.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(helmet());
app.use(express.json());

app.use("/users", userRoute);

export default app;
