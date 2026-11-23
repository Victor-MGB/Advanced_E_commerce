import express from "express";
import * as User from "./user.controller.js";
import { validate } from "../../middlewares/validate.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";
import {
  addUserValidation,
  changeUserPasswordValidation,
  deleteUserValidation,
  updateUserValidation,
  updateMeValidation,
  changeMyPasswordValidation,
} from "./user.validation.js";

const userRouter = express.Router();

userRouter.use(protectedRoutes);

userRouter
  .route("/me")
  .get(User.getMe)
  .patch(validate(updateMeValidation), User.updateMe);

userRouter.patch(
  "/me/password",
  validate(changeMyPasswordValidation),
  User.changeMyPassword
);

userRouter
  .route("/")
  .post(allowedTo("admin"), validate(addUserValidation), User.addUser)
  .get(allowedTo("admin"), User.getAllUsers);

userRouter
  .route("/:id")
  .put(allowedTo("admin"), validate(updateUserValidation), User.updateUser)
  .delete(allowedTo("admin"), validate(deleteUserValidation), User.deleteUser)
  .patch(
    allowedTo("admin"),
    validate(changeUserPasswordValidation),
    User.changeUserPassword
  );

export default userRouter;
