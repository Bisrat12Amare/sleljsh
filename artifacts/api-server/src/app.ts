import express from 'express';
import cors from "cors";
import { pinoHttp } from 'pino-http';
import router from "./routes";
import { logger as baseLogger } from "./lib/logger"; // 1. Rename this to baseLogger

const app = express();

// 2. Initialize the middleware and fix the "not callable" error
const httpLogger = pinoHttp({
  logger: baseLogger,
  serializers: {
    req(req: any) { // 3. Added : any
      return {
        id: req.id,
        method: req.method,
        url: req.url?.split("?")[0],
      };
    },
    res(res: any) { // 4. Added : any
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

app.use(httpLogger);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
