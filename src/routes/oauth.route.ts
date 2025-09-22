import { Router } from "express";
import {
  googleOauthCallbackController,
  googleOauthController,
} from "../controllers/oauth.controller";

const oauthRoute = Router();
oauthRoute.use("/google", googleOauthController);
oauthRoute.use("/google-callback", googleOauthCallbackController);
export default oauthRoute;
