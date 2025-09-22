import { Types } from "mongoose";
import z, { ZodType } from "zod";

export const zObjectId: ZodType<Types.ObjectId> = z.union([
  z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId.")
    .transform((v) => new Types.ObjectId(v)),
  z.instanceof(Types.ObjectId),
]);

export const zDate: ZodType<Date> = z
  .union([z.string(), z.date()])
  .transform((v) => (v instanceof Date ? v : new Date(v)))
  .refine((d) => !Number.isNaN(d.getTime()), "Invalid Date.");
