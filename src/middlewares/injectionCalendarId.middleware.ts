import { Types } from "mongoose";
import CalendarModel from "../db/models/calendar.model";
import { AppError } from "../utils/error";

const TRACE_DIR = "middleware.injectionCalendarId";
// (!) temp middleware, injection calendarId to req(=> req.calendarId).
const injectionCalendarIdMiddleware: AppMiddleware = async (req, _, next) => {
  try {
    if (req.body && req.body.calendarId) {
      next();
      return;
    }
    const ownerId = req.id;
    const calendarDoc = await CalendarModel.findOne({
      ownerId,
    })
      .lean()
      .select("_id");
    if (!calendarDoc) {
      throw new AppError(
        "",
        "INVALID_CALENDAR_OWNER",
        `${TRACE_DIR} > check empty calendarDoc`
      );
    }
    const calendarId = calendarDoc._id as string;
    req.calendarId = new Types.ObjectId(calendarId);
    next();
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("", "UNKNOWN_ERROR");
  }
};
export default injectionCalendarIdMiddleware;
