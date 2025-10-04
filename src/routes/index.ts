import { Router } from "express";
import authRoute from "./auth.route";
import eventRoute from "./event.route";
import userRoute from "./user.route";
import authMiddleware from "../middlewares/auth.middleware";
import injectionCalendarIdMiddleware from "../middlewares/injectionCalendarId.middleware";

const apiRoute = Router();

apiRoute.use("/auth", authRoute);
apiRoute.use(
  "/event",
  authMiddleware,
  injectionCalendarIdMiddleware,
  eventRoute
);
apiRoute.use("/user", userRoute);

export default apiRoute;
