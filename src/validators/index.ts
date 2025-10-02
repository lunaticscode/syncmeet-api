import { ZodType } from "zod";
import { AppError } from "../utils/error";

const TRACE_DIR = "validators.index";
const ENABLE_BODY_METHODS = ["post", "put", "patch"];
const jsonBodyValidator = (schema: ZodType) => {
  const controller: AppController = (req, res, next) => {
    try {
      if (!ENABLE_BODY_METHODS.includes(req.method.toLowerCase())) {
        next();
      }
      const body = req.body ?? null;

      if (!body || !Object.keys(body).length) {
        throw new AppError(
          "Body is empty. Please check body(payload)",
          "BAD_REQUEST",
          `${TRACE_DIR}.bodyValidator > check empty body`
        );
      }

      const validationResult = schema.safeParse(body);
      if (validationResult.error) {
        throw new AppError(
          "Invalid Event data.",
          "BAD_REQUEST",
          `${TRACE_DIR}.validationResult`
        );
      }

      req.body = validationResult.data;
      next();
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(
        "",
        "UNKNOWN_ERROR",
        `${TRACE_DIR}.bodyValidator > catch block`
      );
    }
  };

  return controller;
};
export { jsonBodyValidator };
