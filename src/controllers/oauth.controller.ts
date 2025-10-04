import axios from "axios";
import querystring from "node:querystring";
import {
  GOOGLE_ACCESS_SCOPE,
  GOOGLE_CLIENT_ID,
  GOOGLE_OAUTH_CSRF_TOKEN,
  GOOGLE_OAUTH_ENDPOINT,
  GOOGLE_REDIRECT_URI,
  GOOGLE_TOKEN_ENDPOINT,
  GOOGLE_USERINFO_ENDPOINT,
} from "../consts/oauth";
import { getSignedToken } from "../libs/token";
import { createUser, isExistsUserByEmail } from "../services/user.service";
import { AppError } from "../utils/error";
import type { Types } from "mongoose";

const TRACE_DIR = "controllers.oauth";
const googleOauthController: AppController = (_, res) => {
  const params = querystring.stringify({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: GOOGLE_ACCESS_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state: GOOGLE_OAUTH_CSRF_TOKEN, // CSRF 보호용 state 값
  });
  res.redirect(`${GOOGLE_OAUTH_ENDPOINT}?${params}`);
};

const googleOauthCallbackController: AppController = async (req, res) => {
  const code = req.query.code as string;
  const state = req.query.state as string;
  try {
    if (!code)
      throw new AppError(
        "",
        "INVALID_OAUTH_AUTH_CODE",
        `${TRACE_DIR}.googleOauthCallbackController > code`
      );
    if (state !== GOOGLE_OAUTH_CSRF_TOKEN) {
      throw new AppError(
        "",
        "INVALID_OAUTH_CSRF_TOKEN",
        `${TRACE_DIR}.googleOauthCallbackController > csrf state`
      );
    }

    /**
     * Oauth-Callback steps
     * (1) get access-token
     * (2) get profile
     */

    // (1)
    const tokenRes = await axios.post(
      GOOGLE_TOKEN_ENDPOINT,
      querystring.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
        grant_type: "authorization_code",
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenRes.data;

    // (2)
    const userRes = await axios.get(GOOGLE_USERINFO_ENDPOINT, {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const tokenKey = "__syncmeet_token";
    let tokenValue = "";
    const { email } = userRes.data;

    const isExist = await isExistsUserByEmail(email);
    if (!isExist.exist) {
      const createdUserId = await createUser({
        email,
        oauthProvider: "google",
      });
      if (!createdUserId) {
        throw new AppError("", "DB_ERROR", `${TRACE_DIR}.isExist`);
      }
      if (!createdUserId) {
        throw new AppError(
          "",
          "INVALID_CREATE_USER_DATA",
          `${TRACE_DIR}.isExist`
        );
      }
      tokenValue = await getSignedToken({ id: createdUserId, email });
    } else {
      const userDocumentId = isExist._id;
      const userPlainId = (userDocumentId as Types.ObjectId).toHexString();
      tokenValue = await getSignedToken({ id: userPlainId, email });
    }

    res.cookie(tokenKey, tokenValue, { httpOnly: true, path: "/" });
    return res.redirect("http://localhost:5173/oauth-success");
  } catch (err) {
    return res.redirect("http://localhost:5173/signin");
  }
};

export { googleOauthController, googleOauthCallbackController };
