import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import appRouter from "./routes/index";
import { globalErrorHandler, mongoConnection } from "filemanagement-utils";

mongoConnection().then(() => {
  console.log('Database Connected!!!!')
}).catch(error => {
  console.log('Database Connection Failed: ', error)
})

const app = express();
app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    credentials: true,
  })
);
app.use(express.json({ limit: '10000kb' }));
app.use(express.urlencoded({ extended: true, limit: '10000kb' }));

const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});
app.use(limiter);
app.use(helmet());

app.use("/heirarchyservice/api/v1/", appRouter);

app.use(globalErrorHandler);

export default app;
