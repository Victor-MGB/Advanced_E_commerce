import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { userModel } from "../../../Database/models/user.model.js";

// Add product to wishlist
export const addToWishList = catchAsyncError(async (req, res, next) => {
  const { productId } = req.body;

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { $addToSet: { wishlist: productId } },
    { new: true }
  );

  if (!user) return next(new AppError("Failed to add to wishlist", 400));

  res.status(200).json({
    message: "success",
    wishlist: user.wishlist,
  });
});

// Remove product from wishlist
export const removeFromWishList = catchAsyncError(async (req, res, next) => {
  const { productId } = req.body;

  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { $pull: { wishlist: productId } },
    { new: true }
  );

  if (!user) return next(new AppError("Failed to remove from wishlist", 400));

  res.status(200).json({
    message: "success",
    wishlist: user.wishlist,
  });
});

// Get all user wishlist items
export const getAllUserWishList = catchAsyncError(async (req, res, next) => {
  const user = await userModel
    .findById(req.user._id)
    .populate("wishlist");

  if (!user) return next(new AppError("Failed to get wishlist", 400));

  res.status(200).json({
    message: "success",
    wishlist: user.wishlist,
  });
});

// (Optional) Clear wishlist
// export const clearWishList = catchAsyncError(async (req, res, next) => {
//   const user = await userModel.findByIdAndUpdate(
//     req.user._id,
//     { wishList: [] },
//     { new: true }
//   );
//
//   if (!user) return next(new AppError("Failed to clear wishlist", 400));
//
//   res.status(200).json({
//     message: "success",
//     wishList: user.wishList,
//   });
// });
