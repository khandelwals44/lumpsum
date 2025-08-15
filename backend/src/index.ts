import pino from "pino";
import { Env } from "./env.js";
import { createApp } from "./app.js";

const app = createApp();
const logger = pino();

app.listen(parseInt(Env.PORT, 10), () => {
  logger.info({ port: Env.PORT }, "Backend listening");
});
