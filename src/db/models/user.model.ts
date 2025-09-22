import { model, Schema, SchemaTypes, type Document } from "mongoose";
const { String } = SchemaTypes;

export const PRICING_PLANS = ["free", "pro", "enterprise"] as const;
export const OAUTH_PROVIDERS = ["google", "apple", "ms"] as const;

export interface IUser {
  email: string;
  name?: string;
  oauthProvider: (typeof OAUTH_PROVIDERS)[number];
  pricingPlan?: (typeof PRICING_PLANS)[number];
}

export interface UserSchema extends IUser, Document {}

const userSchema = new Schema<UserSchema>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    oauthProvider: {
      type: String,
      required: true,
      enum: OAUTH_PROVIDERS,
      lowercase: true,
      trim: true,
    },
    pricingPlan: {
      type: String,
      enum: PRICING_PLANS,
      default: "free",
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = model<UserSchema>("User", userSchema);
export default UserModel;
