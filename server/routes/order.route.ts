import express from "express";
import { authorizeRoles, isAutheticated } from "../middleware/auth";
import { createOrder, getAllOrders } from "../controller/order.controller";

const orderRouter = express.Router();

orderRouter.post("/create-order", isAutheticated, createOrder);
orderRouter.get(
  "/get-all-order",
  isAutheticated,
  authorizeRoles("admin"),
  getAllOrders
);

export default orderRouter;
