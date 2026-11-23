import express from "express";
import { validate } from "../../middlewares/validate.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import {
  addProductToCartValidation,
  removeProductFromCart,
  updateProductQuantityValidation,
  applyCouponValidation,
} from "./cart.validation.js";
import * as cart from "./cart.controller.js";

const cartRouter = express.Router();

const userOnly = [protectedRoutes, allowedTo("user", "admin")];

cartRouter
  .route("/")
  .post(...userOnly, validate(addProductToCartValidation), cart.addProductToCart)
  .get(...userOnly, cart.getLoggedUserCart)
  .delete(...userOnly, cart.clearCart);

cartRouter
  .route("/apply-coupon")
  .post(...userOnly, validate(applyCouponValidation), cart.applyCoupon);

cartRouter
  .route("/:id")
  .delete(...userOnly, validate(removeProductFromCart), cart.removeProductFromCart)
  .put(...userOnly, validate(updateProductQuantityValidation), cart.updateProductQuantity)
  .patch(...userOnly, validate(updateProductQuantityValidation), cart.updateProductQuantity);

export default cartRouter;
