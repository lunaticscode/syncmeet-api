import { Document, model, Schema, SchemaTypes, Types } from "mongoose";
const { ObjectId, Number } = SchemaTypes;

export interface IYearAgg {
  calendarId: Types.ObjectId;
  ownerId: Types.ObjectId;
  year: number;
  counts: number[][]; // [month][day]
  totalsByMonth: number[];
}

export interface YearAggSchema extends IYearAgg, Document {}

const yearAggSchema = new Schema<YearAggSchema>(
  {
    calendarId: {
      type: ObjectId,
      ref: "Calendar",
      required: true,
      index: true,
    },
    year: { type: Number, required: true },
    counts: {
      type: [[Number]],
      required: true,
      default: () => Array.from({ length: 12 }, () => Array(31).fill(0)),
    },
    totalsByMonth: {
      type: [Number],
      default: () => Array(12).fill(0),
    },
  },
  { timestamps: true }
);

yearAggSchema.index({ calendarId: 1, year: 1 }, { unique: true });

const YearAggModel = model<YearAggSchema>("YearAgg", yearAggSchema);
export default YearAggModel;
YearAggModel.createSearchIndex;
