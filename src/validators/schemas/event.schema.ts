import { z, ZodType } from "zod";
import type { IEvent } from "../../db/models/event.model";
import { zDate, zStringObjectId } from ".";

interface ICreateEventBodySchema {
  calendarId: string;
  events: Pick<
    IEvent,
    "title" | "description" | "location" | "start" | "end"
  >[];
}

export const createEventBodySchema: ZodType<ICreateEventBodySchema> = z.object({
  calendarId: zStringObjectId,
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
