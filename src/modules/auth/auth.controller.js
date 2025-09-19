import { userModel } from "../../../Database/models/user.model.js";
import { AppError } from "../../utils/AppError.js";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const signUpSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

const signInSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const signUp = catchAsyncError(async (req, res, next) => {
  const { error } = signUpSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const isUserExist = await userModel.findOne({ email: req.body.email });
  if (isUserExist) {
    return next(new AppError("Account already exists!", isUserExist, 409));
  }

  const user = await userModel.create(req.body);
  const token = signToken(user);

  res.status(201).json({
    message: "success",
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const signIn = catchAsyncError(async (req, res, next) => {
  const { error } = signInSchema.validate(req.body);
  if (error) return next(new AppError(error.details[0].message, 400));

  const { email, password } = req.body;
  const user = await userModel.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  const token = signToken(user);

  res.status(200).json({
    message: "success",
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

export const protectedRoutes = catchAsyncError(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Token was not provided!", 401));
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await userModel.findById(decoded.id);
  if (!user) return next(new AppError("User no longer exists", 404));

  if (user.passwordChangedAt) {
    let passwordChangedAt = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (passwordChangedAt > decoded.iat) {
      return next(new AppError("Password was changed recently. Please log in again.", 401));
    }
  }

  req.user = user;
  next();
});

export const allowedTo = (...roles) => {
  return catchAsyncError(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `You are not authorized to access this route. Your role: ${req.user.role}`,
          403
        )
      );
    }
    next();
  });
};
