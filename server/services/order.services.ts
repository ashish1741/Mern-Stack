import { Response, Request, NextFunction } from "express";
import { catchAsyncError } from "../middleware/catchAsyncError";
import OrderModel from "../models/order.model";
import ErrorHandler from "../utils/ErrorHandler";

//create new order

export const newOrder = catchAsyncError(
  async (data: any, res: Response, next: NextFunction) => {
    try {
      const order = await OrderModel.create(data);

      res.status(201).json({
        success: true,
        order,
      });
    } catch (error:any) {
      // Handle order creation error
      return next(new ErrorHandler(error.message, 500));
    }
  }
);


//get All order

export const getAllOrderService = async (res: Response) => {
    const orders = await OrderModel.find().sort({ createdAt: -1 });
  
    res.status(201).json({
      success: true,
      orders,
    });
  };