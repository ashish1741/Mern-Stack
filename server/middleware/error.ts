import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";

export const ErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal Server Error";

  if (err.name === "MongoError" && err.code === 11000) {
    statusCode = 400;
    message = "Duplicate Key Error";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid Token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token Expired";
  } else if (err.name === "RedisError") {
    statusCode = 500;
    message = "Redis Error";
  }

  const errorHandler = new ErrorHandler(message, statusCode);

  console.error(err.message);

  res.status(err.statusCode).json({
    success: false,
    error: err.message,
  });
};
