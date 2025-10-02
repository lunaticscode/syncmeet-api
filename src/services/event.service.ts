import { startSession, Types, type RootFilterQuery } from "mongoose";
import EventModel, {
  type EventSchema,
  type IEvent,
} from "../db/models/event.model";
import { AppError } from "../utils/error";
import CalendarModel, {
  type CalendarSchema,
} from "../db/models/calendar.model";
import YearAggModel from "../db/models/year-agg.model";

const EVENT_SERVICE_TRACE_DIR = "services.event";

const FIFTEEN_MIN = 15 * 1000 * 60;
const isAlignedTo15m = (d: Date) => d.getTime() % FIFTEEN_MIN === 0;

const _validationCalendarOwner = async (
  calendarId: Types.ObjectId,
  ownerId: Types.ObjectId
) => {
  try {
    console.log(calendarId, ownerId);
    const existFilter: RootFilterQuery<CalendarSchema> = {
      _id: calendarId,
      ownerId,
    };
    const exists = await CalendarModel.exists(existFilter).lean();
    console.log({ exists });
    return !!exists;
  } catch (err) {
    throw new AppError(
      "",
      "DB_ERROR",
      `${EVENT_SERVICE_TRACE_DIR}.validationCalendarOwner`
    );
  }
};

const _validationGridAligned = (dates: { start: Date; end: Date }[]) => {
  try {
    for (const { start, end } of dates) {
      console.log({ start, end });
      if (!isAlignedTo15m(start) || !isAlignedTo15m(end)) {
        return false;
      }
      if (!(start < end)) {
        return false;
      }
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

const _hasInternalOverlap = (dateOfEvents: { start: Date; end: Date }[]) => {
  const events = [...dateOfEvents].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1];
    const curr = events[i];
    if (prev.end > curr.start) return true;
  }
  return false;
};

const _getIntervalMergedDates = (
  dates: Array<{ start: Date; end: Date }>
): { start: Date; end: Date }[] => {
  if (!dates.length) return [];
  const copiedDates = structuredClone(dates);
  const sorted = [...copiedDates].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );
  const merged: Array<{ start: Date; end: Date }> = [];
  let cur = { ...sorted[0] };
  for (let i = 1; i < sorted.length; i++) {
    const nxt = sorted[i];
    if (cur.end > nxt.start) {
      if (nxt.end > cur.end) cur.end = nxt.end;
    } else {
      merged.push(cur);
      cur = { ...nxt };
    }
  }
  merged.push(cur);
  return merged;
};

const _hasOverlapFromDB = async (
  calendarId: Types.ObjectId,
  dates: { start: Date; end: Date }[]
) => {
  try {
    const orClauses = dates.map(({ start, end }) => ({
      $and: [{ start: { $lt: end } }, { end: { $gt: start } }],
    }));
    if (orClauses.length === 0) return false;

    const existFilter: RootFilterQuery<EventSchema> = {
      calendarId: new Types.ObjectId(calendarId),
      $or: orClauses,
    };

    const isExists = await EventModel.exists(existFilter).lean();
    return !!isExists;
  } catch {
    throw new AppError(
      "",
      "DB_ERROR",
      `${EVENT_SERVICE_TRACE_DIR}.hasAnyOverlap`
    );
  }
};

const _getYmdFromDate = (srcDate: Date) => {
  const year = srcDate.getFullYear();
  const month = srcDate.getMonth();
  const date = srcDate.getDate();
  return [year, month, date];
};

const _getIncMapFromDates = (dates: { start: Date; end: Date }[]) => {
  const incMap: Record<number, { inc: Record<string, number> }> = {};
  console.log({ dates });
  for (const { start, end } of dates) {
    const [startYear, startMonth, startDate] = _getYmdFromDate(start);
    const [endYear, endMonth, endDate] = _getYmdFromDate(end);
    incMap[startYear] = startYear in incMap ? incMap[startYear] : { inc: {} };
    incMap[endYear] = endYear in incMap ? incMap[endYear] : { inc: {} };

    const startIncHolder = incMap[startYear];
    startIncHolder.inc[`counts.${startMonth}.${startDate - 1}`] =
      (startIncHolder.inc[`counts.${startMonth}.${startDate - 1}`] ?? 0) + 1;
    startIncHolder.inc[`totalsByMonth.${startMonth}`] =
      (startIncHolder.inc[`totalsByMonth.${startMonth}`] ?? 0) + 1;
    if (
      startYear !== endYear &&
      startMonth !== endMonth &&
      startDate !== endDate
    ) {
      const endIncHolder = incMap[endYear];
      endIncHolder.inc[`counts.${endMonth}.${endDate - 1}`] =
        (endIncHolder.inc[`counts.${endMonth}.${endDate - 1}`] ?? 0) + 1;
      endIncHolder.inc[`totalsByMonth.${endMonth}`] =
        (endIncHolder.inc[`totalsByMonth.${endMonth}`] ?? 0) + 1;
    }
  }
  return incMap;
};

const _getDefaultYearAggCounts = () =>
  Array.from({ length: 12 }, () => Array(31).fill(0));
const _getDefaultYearAggTotals = () => Array(12).fill(0);

const CREATE_EVENT_ERROR_MESSAGES = {
  VALIDATION_CALENDAR_OWNER:
    "Invalid owner. Only calendar owner can create this event.",
  CHECK_OVERLAP_SCHEUDLE:
    "Overlaps with already saved event. Please check 'start', 'end' datetime.",
  VALIDATION_GRID_ALIGNED:
    "Invalid 'start', 'end' datetime. 'start', 'end' must be divided into 15-minute units.",
  INSERT_DATA: "Occurred insert error from DB. Please check log.",
  INTERNAL_OVERLAP:
    "Input events contain overlapping time ranges in the same calendar.",
};

type CreateEventsInput = {
  ownerId: string;
  calendarId: string;
  events: Pick<
    IEvent,
    "title" | "description" | "location" | "start" | "end"
  >[];
};
const createEvents = async (input: CreateEventsInput) => {
  try {
    /**
     * Validation (1) ~ (5)
     * (1) Check Input validation
     * (2) Check Owner
     * (3) Date Overlap.
     * (4) Check Aligned(15minute)
     * (5) Check overlap with merged event dates and db's data.
     */

    // Validation (1)
    if (!input.calendarId.trim() || !input.ownerId.trim()) {
      throw new AppError(
        "",
        "BAD_REQUEST",
        `${EVENT_SERVICE_TRACE_DIR}.createEvents > calendarId, ownerId empty check.`
      );
    }
    if (!Array.isArray(input.events) || input.events.length === 0) {
      throw new AppError(
        "",
        "BAD_REQUEST",
        `${EVENT_SERVICE_TRACE_DIR}.createEvents > events empty check.`
      );
    }

    // Validation (2)
    const isValidOwner = await _validationCalendarOwner(
      new Types.ObjectId(input.calendarId),
      new Types.ObjectId(input.ownerId)
    );
    if (!isValidOwner) {
      throw new AppError(
        "",
        "INVALID_CALENDAR_OWNER",
        `${EVENT_SERVICE_TRACE_DIR}.createEvents > owner validation check.`
      );
    }

    const datesOfEvents = input.events.map(({ start, end }) => ({
      start,
      end,
    }));
    // Validation (3)
    if (_hasInternalOverlap(datesOfEvents)) {
      throw new AppError(
        CREATE_EVENT_ERROR_MESSAGES.INTERNAL_OVERLAP,
        "INVALID_EVENT_TIME",
        `${EVENT_SERVICE_TRACE_DIR}.createEvents > internalOverlap`
      );
    }

    // Validation (4)
    if (!_validationGridAligned(datesOfEvents)) {
      throw new AppError(
        CREATE_EVENT_ERROR_MESSAGES.VALIDATION_GRID_ALIGNED,
        "INVALID_EVENT_TIME",
        `${EVENT_SERVICE_TRACE_DIR}.createEvents > isValidGridAligend`
      );
    }

    // Validation (5)
    const intervalMergedDates = _getIntervalMergedDates(datesOfEvents);
    const exists = await _hasOverlapFromDB(
      new Types.ObjectId(input.calendarId),
      intervalMergedDates
    );
    if (exists) {
      throw new AppError(
        CREATE_EVENT_ERROR_MESSAGES.CHECK_OVERLAP_SCHEUDLE,
        "INVALID_EVENT_TIME",
        `${EVENT_SERVICE_TRACE_DIR}.createEvents > hasAnyOverlap`
      );
    }

    /**
     * Insert into DB
     * (1) EventModel
     * (2) YearAggModel
     */
    const { events } = input;
    const calendarId = new Types.ObjectId(input.calendarId);
    const ownerId = new Types.ObjectId(input.ownerId);
    const datas = events.map((ev) => ({
      ...ev,
      calendarId,
      ownerId,
      createdBy: ownerId,
    }));
    const session = await startSession();
    session.startTransaction();
    // (1)
    await EventModel.insertMany(datas, { session, ordered: true });
    const incMap = _getIncMapFromDates(datesOfEvents);

    // (2)
    for (const year in incMap) {
      const { inc } = incMap[year];
      console.log({ inc });
      const res = await YearAggModel.updateOne(
        {
          calendarId,
          year,
        },
        {
          $inc: inc,
        },
        { session }
      );
      if (res.matchedCount === 0) {
        await YearAggModel.create(
          [
            {
              calendarId,
              year,
              counts: _getDefaultYearAggCounts(),
              totalsByMonth: _getDefaultYearAggTotals(),
            },
          ],
          { session }
        );
        await YearAggModel.updateOne(
          { calendarId, year },
          { $inc: inc },
          { session }
        );
      }
    }
    await session.commitTransaction();
    session.endSession();

    return true;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    console.log(err);
    throw new AppError(
      CREATE_EVENT_ERROR_MESSAGES.INSERT_DATA,
      "DB_ERROR",
      `${EVENT_SERVICE_TRACE_DIR}.createEvents > EventModel.insertMany`
    );
  }
};

export { createEvents };
