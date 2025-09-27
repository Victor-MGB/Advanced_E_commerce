import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { userModel } from "../../../Database/models/user.model.js";

/**
 * @desc    Add a new address to the logged-in user's profile
 * @route   POST /api/v1/addresses
 * @access  Protected (user)
 */
export const addAddress = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { addresses: req.body } },
    { new: true, runValidators: true }
  );

  if (!user) return next(new AppError("User not found", 404));

  res.status(201).json({
    message: "success",
    data: user.addresses,
  });
});

/**
 * @desc    Remove an address from the logged-in user's profile
 * @route   DELETE /api/v1/addresses
 * @access  Protected (user)
 */
export const removeAddress = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { addresses: { _id: req.body.addressId } } },
    { new: true, runValidators: true }
  );

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    message: "success",
    data: user.addresses,
  });
});

/**
 * @desc    Get all addresses for the logged-in user
 * @route   GET /api/v1/addresses
 * @access  Protected (user)
 */
export const getAllAddresses = catchAsyncError(async (req, res, next) => {
  const user = await userModel.findById(req.user._id).select("addresses");

  if (!user) return next(new AppError("User not found", 404));

  res.status(200).json({
    message: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});
