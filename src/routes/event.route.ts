import { Router } from "express";
import { createEventController } from "../controllers/event.controller";
import { jsonBodyValidator } from "../validators";
import { z } from "zod";
import { eventCreateInputSchema } from "../validators/schemas/event.schema";

const eventRoute = Router();

eventRoute.post(
  "/",
  jsonBodyValidator(eventCreateInputSchema),
  createEventController
);
export default eventRoute;
