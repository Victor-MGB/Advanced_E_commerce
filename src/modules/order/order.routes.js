import express from "express";
import { validate } from "../../middlewares/validate.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import {
  createCashOrderValidation,
  checkoutValidation,
} from "./order.validation.js";
import * as order from "./order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/webhook", order.handlePaystackWebhook);

orderRouter.get(
  "/",
  protectedRoutes,
  allowedTo("user", "admin"),
  order.getSpecificOrder
);

orderRouter.get(
  "/all",
  protectedRoutes,
  allowedTo("admin"),
  order.getAllOrders
);

orderRouter.get(
  "/verify/:reference",
  protectedRoutes,
  allowedTo("user", "admin"),
  order.verifyPayment
);

orderRouter.post(
  "/checkout/:id",
  protectedRoutes,
  allowedTo("user", "admin"),
  validate(checkoutValidation),
  order.initializePayment
);

orderRouter.post(
  "/:id",
  protectedRoutes,
  allowedTo("user", "admin"),
  validate(createCashOrderValidation),
  order.createCashOrder
);

export default orderRouter;
