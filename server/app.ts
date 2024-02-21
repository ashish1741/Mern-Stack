require("dotenv").config();
import express, { Response, Request, NextFunction } from "express";
export const app = express();
import cors from "cors";
import coookieParser from "cookie-parser";
import {ErrorMiddleware} from "./middleware/error";
import userRouter from "./routes/User.route"
import courseRouter from "./routes/course.route";

//body

app.use(express.json({ limit: "50mb" }));

//cookie parsser

app.use(coookieParser());

// cors

app.use(
  cors({
    origin: process.env.ORIGIN,
  })
);

//testing our api

app.get("/test", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Api is working ",
  });
});


//route
app.use("/api/v1",   userRouter);
app.use("/api/v1",   courseRouter );

  
//unknown route 

app.all("*", (req: Request ,  res: Response ,  next: NextFunction) => {
    const err =  new Error(`Route ${req.originalUrl} is not define`) as any;

    err.statusCode = 404;
    next(err)
});

app.use(ErrorMiddleware)





