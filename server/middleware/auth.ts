import { Request, Response, NextFunction } from "express";
import { CatchAyncError } from "./catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { redis } from "../config/redis";

// AUTHENTICATED USER 
export const isAuthenticated = CatchAyncError(async (req: Request, res: Response, next: NextFunction) => {
  const access_token = req.cookies.access_token as any;

  if (!access_token) {
    return next(new ErrorHandler("Please login to access the resource", 400))
  }

  const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN as string) as JwtPayload;

  if (!decoded) {
    return next(new ErrorHandler("Access token in not valid ", 400))
  }

  const user = await redis.get(decoded.id)

  if (!user) {
    return next(new ErrorHandler("User Not Found!", 400))
  }

  req.user = JSON.parse(user)

  next();

})


export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || '')) {
      return next(new ErrorHandler(`Roles ${req.user?.role} is not allowed to access the resouce `, 403))
    }
    next();
  }
}