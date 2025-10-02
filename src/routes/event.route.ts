import { Router } from "express";
import { createEventController } from "../controllers/event.controller";
import { jsonBodyValidator } from "../validators";
import { createEventBodySchema } from "../validators/schemas/event.schema";
import authMiddleware from "../middlewares/auth.middleware";

const eventRoute = Router();

eventRoute.post(
  "/",
  authMiddleware,
  jsonBodyValidator(createEventBodySchema),
  createEventController
);
export default eventRoute;
