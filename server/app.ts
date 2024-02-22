require("dotenv").config();
import express, { Response, Request, NextFunction } from "express";
export const app = express();
import cors from "cors";
import coookieParser from "cookie-parser";
import {ErrorMiddleware} from "./middleware/error";
import userRouter from "./routes/User.route"
import courseRouter from "./routes/course.route";
import orderRouter from "./routes/order.route";

//body

app.use(express.json({ limit: "50mb" }));

//cookie parsser

app.use(coookieParser());



var corsOptions = {
  origin: 'http://localhost:5173',
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};


// cors

app.use(
  cors(corsOptions)
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
app.use("/api/v1",   orderRouter);

  
//unknown route 

app.all("*", (req: Request ,  res: Response ,  next: NextFunction) => {
    const err =  new Error(`Route ${req.originalUrl} is not define`) as any;

    err.statusCode = 404;
    next(err)
});

app.use(ErrorMiddleware)





