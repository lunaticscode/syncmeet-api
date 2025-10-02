import { createEvents } from "../services/event.service";
import { AppError } from "../utils/error";

const createEventController: AppController = async (req, res) => {
  try {
    const body = req.body;
    const { calendarId, events } = body;
    console.log(req.id, req.body);
    if (!req.id || !req.id.trim()) {
      throw new AppError("Invalid user id.", "INVALID_USER_TOKEN");
    }
    await createEvents({ calendarId, ownerId: req.id, events });
    return res.json({ isError: false });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Create event error.", "DB_ERROR");
  }
};

export { createEventController };
