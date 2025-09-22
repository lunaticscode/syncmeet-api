import { USER_TOKEN_KEY } from "../consts/app";
import { getDecodedPayload } from "../libs/token";
import { AppError } from "../utils/error";

const TRACE_DIR = "middlewares.auth";
const authMiddleware: AppMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies[USER_TOKEN_KEY];
    if (!token) {
      throw new AppError(
        "",
        "INVALID_USER_TOKEN",
        `${TRACE_DIR}.authMiddleware > token`
      );
    }
    const tokenValidationResult = await getDecodedPayload(token);
    if (!tokenValidationResult) {
      throw new AppError(
        "",
        "INVALID_USER_TOKEN",
        `${TRACE_DIR}.authMiddleware > tokenValidationResult`
      );
    }
    const userId = tokenValidationResult.payload.id as string;
    req.id = userId;
    next();
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
  }
};
export default authMiddleware;
