import { Types, type RootFilterQuery } from "mongoose";
import EventModel, {
  type EventSchema,
  type IEvent,
} from "../db/models/event.model";
import { AppError } from "../utils/error";
import CalendarModel, {
  type CalendarSchema,
} from "../db/models/calendar.model";

const EVENT_SERVICE_TRACE_DIR = "services.event";

const FIFTEEN_MIN = 15 * 1000 * 60;
const isAlignedTo15m = (d: Date) => d.getTime() % FIFTEEN_MIN === 0;

const hasOverlap = async (
  calendarId: Types.ObjectId,
  start: Date,
  end: Date
) => {
  try {
    const existFilter: RootFilterQuery<EventSchema> = {
      calendarId: new Types.ObjectId(calendarId),
      $or: [{ start: { $lt: end }, end: { $gt: start } }],
    };
    const isExists = await EventModel.exists(existFilter).lean();
    return !!isExists;
  } catch (err) {
    throw new AppError("", "DB_ERROR", `${EVENT_SERVICE_TRACE_DIR}.hasOverlap`);
  }
};

const validationCalendarOwner = async (
  calendarId: Types.ObjectId,
  ownerId: Types.ObjectId
) => {
  try {
    const existFilter: RootFilterQuery<CalendarSchema> = {
      _id: calendarId,
      ownerId,
    };
    const exists = await CalendarModel.exists(existFilter).lean();
    return !!exists;
  } catch (err) {
    throw new AppError(
      "",
      "DB_ERROR",
      `${EVENT_SERVICE_TRACE_DIR}.validationCalendarOwner`
    );
  }
};

const validationGridAligned = (start: Date, end: Date) => {
  try {
    if (!isAlignedTo15m(start) || !isAlignedTo15m(end)) {
      return false;
    }
    if (!(start < end)) {
      return false;
    }
    return true;
  } catch (err) {
    throw new AppError(
      "",
      "UNKNOWN_ERROR",
      `${EVENT_SERVICE_TRACE_DIR}.validationGridAligned`
    );
  }
};

const CREATE_EVENT_ERROR_MESSAGES = {
  VALIDATION_CALENDAR_OWNER:
    "Invalid owner. Only calendar owner can create this event.",
  CHECK_OVERLAP_SCHEUDLE:
    "Overlaps with already saved event. Please check 'start', 'end' datetime.",
  VALIDATION_GRID_ALIGNED:
    "Invalid 'start', 'end' datetime. 'start', 'end' must be divided into 15-minute units.",
  INSERT_DATA: "Occurred insert error from DB. Please check log.",
};

type CreateEventInput = Omit<IEvent, "updatedBy">;
const createEvent = async (input: CreateEventInput) => {
  try {
    const { calendarId, ownerId, start, end } = input;

    // owner check
    const isValidCalendarOwner = await validationCalendarOwner(
      calendarId,
      ownerId
    );
    if (!isValidCalendarOwner) {
      throw new AppError(
        CREATE_EVENT_ERROR_MESSAGES.VALIDATION_CALENDAR_OWNER,
        "INVALID_CALENDAR_OWNER",
        `${EVENT_SERVICE_TRACE_DIR}.createEvent > isValidCalendarOwner`
      );
    }

    // datetime overlap check
    const isOverlapSchedule = await hasOverlap(calendarId, start, end);
    if (isOverlapSchedule) {
      throw new AppError(
        CREATE_EVENT_ERROR_MESSAGES.CHECK_OVERLAP_SCHEUDLE,
        "INVALID_EVENT_TIME",
        `${EVENT_SERVICE_TRACE_DIR}.createEvent > isOverlapSchedule`
      );
    }

    // datetime grid align check(15 minute)
    const isValidGridAligend = validationGridAligned(start, end);
    if (!isValidGridAligend) {
      throw new AppError(
        CREATE_EVENT_ERROR_MESSAGES.VALIDATION_GRID_ALIGNED,
        "INVALID_EVENT_TIME",
        `${EVENT_SERVICE_TRACE_DIR}.createEvent > isValidGridAligend`
      );
    }
    const createdEvent = await EventModel.create(input);
    console.log({ createdEvent });
    return true;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(
      CREATE_EVENT_ERROR_MESSAGES.INSERT_DATA,
      "DB_ERROR",
      `${EVENT_SERVICE_TRACE_DIR}.createEvent > EventModel.create`
    );
  }
};

export { createEvent };
