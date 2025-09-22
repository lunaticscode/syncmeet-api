import { Router } from "express";
import authMiddleware from "../middlewares/auth.middleware";
import { getUserController } from "../controllers/user.controller";

const userRoute = Router();

userRoute.get("/", authMiddleware, getUserController);

export default userRoute;
