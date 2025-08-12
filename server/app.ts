import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ErrorMiddleware } from "./middleware/error"
require('dotenv').config();
export const app = express();
import userRouter from "./routes/user.route"

// body parser 
app.use(express.json({ limit: "50mb" }));

// cookie parser
app.use(cookieParser());

// cors 
app.use(cors({
  origin: process.env.ORIGIN
}));

// testing route 
app.get("/test", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is working Fine !",
  });
});

// user Registration Routes 
app.use("/api/v1", userRouter)


// unknown route — safer version for Express v5
app.use((req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});


// Errorhandler middleware 
app.use(ErrorMiddleware)