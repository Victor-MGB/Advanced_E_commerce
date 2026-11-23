import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factors.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { userModel } from "../../../Database/models/user.model.js";

export const addUser = catchAsyncError(async (req, res) => {
  const user = await userModel.create(req.body);
  res.status(201).json({ message: "success", data: user });
});

export const getAllUsers = catchAsyncError(async (req, res) => {
  const apiFeature = new ApiFeatures(userModel.find(), req.query)
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();

  const users = await apiFeature.mongooseQuery;

  res.status(200).json({
    page: apiFeature.page,
    message: "success",
    results: users.length,
    data: users,
  });
});

export const getMe = catchAsyncError(async (req, res) => {
  res.status(200).json({ message: "success", data: req.user });
});

export const updateMe = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true }
  );

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ message: "success", data: user });
});

export const changeMyPassword = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).select("+password");
  if (!user) return next(new AppError("User not found", 404));

  const isCorrect = await user.correctPassword(req.body.currentPassword, user.password);
  if (!isCorrect) return next(new AppError("Current password is incorrect", 401));

  user.password = req.body.password;
  user.passwordChangedAt = Date.now() - 1000;
  await user.save();

  res.status(200).json({ message: "Password updated successfully", data: user });
});

export const updateUser = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ message: "success", data: user });
});

export const changeUserPassword = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.params.id,
    { password: req.body.password, passwordChangedAt: Date.now() - 1000 },
    { new: true, runValidators: true }
  );

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({ message: "Password updated successfully", data: user });
});

export const deleteUser = deleteOne(userModel, "User");
