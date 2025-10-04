import "express";
import type { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      // identity?: { token: string };
      /** @description user unique id(= mongodob objectId) */
      id?: Types.ObjectId;
      calendarId?: Types.ObjectId;
    }
  }
  type AppController = (
    req: import("express").Request,
    res: import("express").Response,
    next: import("express").NextFunction
  ) => void;

  type AppMiddleware = (
    req: import("express").Request,
    res: import("express").Response,
    next: import("express").NextFunction
  ) => void;

  type AppErrorMiddleware = (
    err: unknown,
    req: import("express").Request,
    res: import("express").Response,
    next: import("express").NextFunction
  ) => void;
}

export {};
