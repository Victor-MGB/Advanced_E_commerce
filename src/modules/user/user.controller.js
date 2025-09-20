import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factors.js"; // or factory.js
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { userModel } from "../../../Database/models/user.model.js";
import bcrypt from "bcryptjs";

/**
 * Add a new user
 */
export const addUser = catchAsyncError(async (req, res) => {
  const user = await userModel.create(req.body);
  res.status(201).json({ message: "success", data: user });
});

/**
 * Get all users with query filters
 */
export const getAllUsers = catchAsyncError(async (req, res) => {
  const apiFeature = new ApiFeatures(userModel.find(), req.query)
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();

  const users = await apiFeature.mongooseQuery;
  const page = Number(req.query.page) || 1;

  res.status(200).json({
    page,
    count: users.length,
    message: "success",
    data: users,
  });
});

/**
 * Update user by ID
 */
export const updateUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ message: "success", data: user });
});

/**
 * Change user password by ID
 */
export const changeUserPassword = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  req.body.passwordChangedAt = Date.now();

  if (req.body.password) {
    req.body.password = await bcrypt.hash(req.body.password, 12);
  }

  const user = await userModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ message: "Password updated successfully", data: user });
});

/**
 * Delete user
 */
export const deleteUser = deleteOne(userModel, "user");
