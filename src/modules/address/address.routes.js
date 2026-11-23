import express from "express";
import { validate } from "../../middlewares/validate.js";

import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import * as address from "../address/address.controller.js";
import {
  addAddressValidation,
  deleteAddressValidation,
} from "./address.validation.js";

const addressRouter = express.Router();

addressRouter
  .route("/")
  .patch(
    protectedRoutes,
    allowedTo("user", "admin"),
    validate(addAddressValidation),
    address.addAddress
  )
  .delete(
    protectedRoutes,
    allowedTo("user", "admin"),
    validate(deleteAddressValidation),
    address.removeAddress
  )
  .get(protectedRoutes, allowedTo("user", "admin"), address.getAllAddresses);

export default addressRouter;
