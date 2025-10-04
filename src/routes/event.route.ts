import { Router } from "express";
import {
  createEventController,
  getDetailEventsController,
  getMonthlyEventCountsController,
} from "../controllers/event.controller";
import { jsonBodyValidator } from "../validators";
import {
  createEventBodySchema,
  getDetailEventsSchema,
} from "../validators/schemas/event.schema";
import authMiddleware from "../middlewares/auth.middleware";
import injectionCalendarIdBodyMiddleware from "../middlewares/injectionCalendarId.middleware";

const eventRoute = Router();

eventRoute.post(
  "/",
  jsonBodyValidator(createEventBodySchema),
  createEventController
);
eventRoute.get("/", getMonthlyEventCountsController);

eventRoute.post(
  "/detail",
  jsonBodyValidator(getDetailEventsSchema),
  getDetailEventsController
);
export default eventRoute;
