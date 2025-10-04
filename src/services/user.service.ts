import type { RootFilterQuery, Types } from "mongoose";
import UserModel, {
  type IUser,
  type UserSchema,
} from "../db/models/user.model";
import { AppError } from "../utils/error";
import { userCreateInputSchema } from "../validators/schemas/user.schema";
import mongoose from "mongoose";
import CalendarModel from "../db/models/calendar.model";

const DEFAULT_CREATED_CALENDAR_NAME = "My Calendar";
const TRACE_DIR = "services.user";
export const isExistsUserByEmail = async (email: string) => {
  try {
    if (!email || !email.trim()) {
      throw new AppError(
        "Invalid email value.",
        "BAD_REQUEST",
        `${TRACE_DIR}.existUserByEmail`
      );
    }
    const existFilter: RootFilterQuery<UserSchema> = {
      email,
    };
    const isExist = await UserModel.exists(existFilter).lean();
    return { exist: !!isExist, _id: isExist?._id };
  } catch (err) {
    throw new AppError("", "DB_ERROR", `${TRACE_DIR}.existUserByEmail`);
  }
};

export const createUser = async (inputUser: IUser) => {
  try {
    const validationResult = userCreateInputSchema.safeParse(inputUser);
    if (validationResult.error) {
      throw new AppError(
        "Invalid user data.",
        "INVALID_CREATE_USER_DATA",
        `${TRACE_DIR}.createUser > validationResult`
      );
    }
    const session = await mongoose.startSession();
    const { user, calendar } = await session.withTransaction(async () => {
      const [user] = await UserModel.create([validationResult.data], {
        session,
      });
      const [calendar] = await CalendarModel.create(
        [{ ownerId: user._id, name: DEFAULT_CREATED_CALENDAR_NAME }],
        { session }
      );
      return { user, calendar };
    });
    if (!user || !calendar) {
      throw new AppError(
        "",
        "DB_ERROR",
        `${TRACE_DIR}.createUser > transaction`
      );
    }
    return (user._id as Types.ObjectId).toHexString();
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      "",
      "DB_ERROR",
      `${TRACE_DIR}.createUser > catch block.`
    );
  }
};

export const getUser = async (id: Types.ObjectId) => {
  try {
    const user = await UserModel.findById(id).lean();
    return user;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("", "DB_ERROR", `${TRACE_DIR}.getUser`);
  }
};
