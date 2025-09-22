import { Router } from "express";
import { testAuthController } from "../controllers/auth.controller";

const authRoute = Router();
authRoute.get("/", testAuthController);

export default authRoute;
