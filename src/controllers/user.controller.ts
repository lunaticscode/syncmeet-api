import { getUser } from "../services/user.service";
import { AppError } from "../utils/error";
import { userGetOutputSchem } from "../validators/schemas/user.schema";

const TRACE_DIR = "controllers.user";
const getUserController: AppController = async (req, res) => {
  try {
    const userId = req.id ?? null;
    if (!userId) {
      throw new AppError(
        "Invalid user id.",
        "BAD_REQUEST",
        `${TRACE_DIR}.getUserController`
      );
    }

    const user = await getUser(userId);
    if (!user) {
      throw new AppError(
        "",
        "NOT_FOUND_USER",
        `${TRACE_DIR}.getUserController > user(not-found)`
      );
    }

    const parsedUser = userGetOutputSchem.safeParse(user);
    if (parsedUser.error) {
      throw new AppError(
        "",
        "CONTROLLER_OUTPUT_PARSE_ERROR",
        `${TRACE_DIR}.getUserController > parsedUser`
      );
    }

    return res.json(parsedUser.data);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      "",
      "UNKNOWN_ERROR",
      `${TRACE_DIR}.getUserController > catch block`
    );
  }
};

export { getUserController };
