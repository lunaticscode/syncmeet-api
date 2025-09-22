import { Document, model, Schema, SchemaTypes, Types } from "mongoose";

// import { zObjectId, zTrimmed } from "../../libs/zodSchema";
// import type { ZodType } from "zod";
// import { z } from "zod";
const { String, ObjectId, Date } = SchemaTypes;

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

// const eventCreateApiSchema: ZodType<Omit<IEvent, "updatedBy">> = z.object({
//   calendarId: zObjectId,
//   ownerId: zObjectId,
//   title: z
//     .string()
//     .min(1, "")
//     .max(50, "")
//     .transform((str) => str.trim()),
//   description: z
//     .string()
//     .max(200, "")
//     .transform((v) => v.trim())
//     .optional(),
//   location,
// });

const DIVIDER_MIN = 15 * 1000 * 60;
const isAlignedTo15m = (d: Date) => {
  return d.getTime() % DIVIDER_MIN === 0;
};

export interface EventSchema extends IEvent, Document {}

const eventSchema = new Schema<EventSchema>({
  calendarId: {
    type: ObjectId,
    ref: "Calendar",
    required: true,
    index: true,
  },
  ownerId: {
    type: ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  location: {
    type: String,
    default: "",
    trim: true,
  },
  start: {
    type: Date,
    required: true,
    index: true,
    validate: {
      validator: isAlignedTo15m,
      message: "start must be aligned to 15-minute boundaries",
    },
  },
  end: {
    type: Date,
    required: true,
    index: true,
    validate: [
      {
        validator: isAlignedTo15m,
        message: "end must be aligned to 15-minute boundaries",
      },
      {
        validator(this: any, v: Date) {
          return this.start && v > this.start;
        },
        message: "end must be after start",
      },
    ],
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

const EventModel = model<EventSchema>("Event", eventSchema);
export default EventModel;
