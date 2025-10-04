import { z, ZodType } from "zod";
import type { IEvent } from "../../db/models/event.model";
import { zDate, zObjectId } from ".";
import type { Types } from "mongoose";

interface ICreateEventBodySchema {
  calendarId: Types.ObjectId;
  events: Pick<
    IEvent,
    "title" | "description" | "location" | "start" | "end"
  >[];
}

export const createEventBodySchema: ZodType<ICreateEventBodySchema> = z.object({
  calendarId: zObjectId,
  events: z.array(
    z.object({
      title: z.string().trim().min(1).max(50),
      description: z.string().trim().max(300).optional(),
      location: z.string().trim().max(75).optional(),
      start: zDate,
      end: zDate,
    })
  ),
});

interface IGetDetailEventsBodySchema {
  // calendarId: z.infer<typeof zObjectId>;
  date: Date;
}

export const getDetailEventsSchema: ZodType<IGetDetailEventsBodySchema> =
  z.object({
    // calendarId: zObjectId,
    date: zDate,
  });
