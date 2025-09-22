import { AppError } from "../utils/error";

const errorMiddleware: AppErrorMiddleware = (error, _req, res, _next) => {
  const errorObj =
    error instanceof AppError
      ? error
      : new AppError("Unknown Error", "UNKNOWN_ERROR");
  const { statusCode, ...extenralMessage } = errorObj.toJSON();
  return res.status(statusCode).json(extenralMessage);
};
export default errorMiddleware;
