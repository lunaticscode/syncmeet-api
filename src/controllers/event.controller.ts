import {
  createEvents,
  getDetailEvents,
  getMonthlyEventCounts,
} from "../services/event.service";
import { AppError } from "../utils/error";

const TRACE_DIR = "controller.event";
const getDetailEventsController: AppController = async (req, res) => {
  try {
    const ownerId = req.id;
    const calendarId = req.calendarId;
    const { date } = req.body;
    if (!ownerId || !calendarId || !date) {
      throw new AppError("", "BAD_REQUEST");
    }
    const events = await getDetailEvents(calendarId, ownerId, date);
    return res.json(events);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("", "UNKNOWN_ERROR");
  }
};

const getMonthlyEventCountsController: AppController = async (req, res) => {
  try {
    const calendarId = req.calendarId;
    const { year } = req.query;
    if (!year || !calendarId) {
      throw new AppError(
        "",
        "BAD_REQUEST",
        `${TRACE_DIR}.getMonthEventsController > invalid request data`
      );
    }
    const counts = await getMonthlyEventCounts(calendarId, Number(year));
    return res.json(counts);
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("", "UNKNOWN_ERROR");
  }
};

const createEventController: AppController = async (req, res) => {
  try {
    const body = req.body;
    const calendarId = req.calendarId;
    const ownerId = req.id;
    const { events } = body; // need to auto-complete by type;
    if (!ownerId) {
      throw new AppError("Invalid user id.", "INVALID_USER_TOKEN");
    }
    if (!calendarId) {
      throw new AppError("Invalid calendarId.", "INVALID_CALENDAR_OWNER");
    }
    await createEvents({
      calendarId,
      ownerId,
      events,
    });
    return res.status(201).json({ isError: false });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Create event error.", "DB_ERROR");
  }
};

export {
  getMonthlyEventCountsController,
  getDetailEventsController,
  createEventController,
};
