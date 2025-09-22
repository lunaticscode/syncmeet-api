import { model, Schema, SchemaTypes, Types, type Document } from "mongoose";
const { String, ObjectId } = SchemaTypes;

export interface ICalendar {
  ownerId: Types.ObjectId;
  name?: string;
  timezone?: string; // 표시용 타임존(IANA), 저장은 UTC
  members?: Types.ObjectId[];
}

export interface CalendarSchema extends ICalendar, Document {}

const calendarSchema = new Schema<CalendarSchema>(
  {
    ownerId: {
      type: ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      default: "My Calendar",
      trim: true,
    },
    timezone: {
      type: String,
      default: "Asia/Seoul",
      lowercase: true,
      trim: true,
    },
    members: {
      type: [ObjectId],
      default: null,
    },
  },
  { timestamps: true }
);

const CalendarModel = model<CalendarSchema>("Calendar", calendarSchema);
export default CalendarModel;
