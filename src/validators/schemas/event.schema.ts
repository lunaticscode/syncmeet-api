import { z, ZodType } from "zod";
import type { IEvent } from "../../db/models/event.model";
import { zDate, zObjectId } from ".";

/**
export interface IEvent {
  calendarId: Types.ObjectId;
  ownerId: Types.ObjectId;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
}
*/

interface IEventCreateInput extends Omit<IEvent, "updatedBy"> {}
export const eventCreateInputSchema: ZodType<IEventCreateInput> = z
  .object({
    calendarId: zObjectId,
    ownerId: zObjectId,
    title: z.string().trim().min(1).max(50),
    description: z.string().trim().max(300).optional(),
    location: z.string().trim().max(75).optional(),
    start: zDate,
    end: zDate,
    createdBy: zObjectId,
  })
  .superRefine((val, ctx) => {
    if (val.start.getTime() >= val.end.getTime()) {
      ctx.addIssue({
        expected: "date",
        code: "custom",
        message: "End_time should be bigger than Start_time",
      });
    }
  });
