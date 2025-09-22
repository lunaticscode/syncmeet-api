import { z } from "zod";
import type { ZodType } from "zod";
import {
  OAUTH_PROVIDERS,
  PRICING_PLANS,
  type IUser,
} from "../../db/models/user.model";

const _emailSchema = z.email().trim().max(100);
const _nameSchema = z.string().trim().max(50).optional().default("");
const _oauthProviderSchema = z
  .enum(OAUTH_PROVIDERS)
  .optional()
  .default("google");
const _pricingPlanSchema = z.enum(PRICING_PLANS).optional().default("free");

export type IUserCreateInput = IUser;
export const userCreateInputSchema: ZodType<IUserCreateInput> = z.object({
  email: _emailSchema,
  name: _nameSchema,
  oauthProvider: _oauthProviderSchema,
  pricingPlan: _pricingPlanSchema,
});

export const userGetOutputSchem: ZodType<IUserCreateInput> =
  userCreateInputSchema;
