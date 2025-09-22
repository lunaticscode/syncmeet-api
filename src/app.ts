import "dotenv/config";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import compression from "compression";
import apiRoute from "./routes";
import { APP_PORT } from "./consts/app";
import oauthRoute from "./routes/oauth.route";
import errorMiddleware from "./middlewares/error.middleware";
import { dbConnect } from "./db/client";
import cookieParser from "cookie-parser";

const rateLiimter = rateLimit({
  windowMs: 60 * 1000,
  limit: 30, // each IP to 30 requests per 1 min
});

const app = express();

/****** App Middleware ******/
app.use(helmet());
app.use(cookieParser());
app.use(rateLiimter);
app.use(express.json());
app.use(compression());
/****************************/

app.use("/oauth", oauthRoute);
app.use("/api", apiRoute);

app.use(errorMiddleware);

app.listen(APP_PORT, () => {
  dbConnect();
  console.log("NODE_ENV :: ", process.env.NODE_ENV ?? "development");
  console.log(`✅[express] Express running on ${APP_PORT}.`);
});
