import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factors.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { reviewModel } from "../../../Database/models/review.model.js";

/**
 * @desc    Add a review (one review per user per product)
 * @route   POST /api/v1/reviews
 * @access  Private (user)
 */
export const addReview = catchAsyncError(async (req, res, next) => {
  const { productId, rating, comment } = req.body;

  // Prevent multiple reviews by the same user for the same product
  const existingReview = await reviewModel.findOne({
    userId: req.user._id,
    productId,
  });

  if (existingReview) {
    return next(new AppError("You already created a review for this product", 409));
  }

  const review = await reviewModel.create({
    productId,
    rating,
    comment,
    userId: req.user._id,
  });

  res.status(201).json({ message: "success", data: review });
});

/**
 * @desc    Get all reviews
 * @route   GET /api/v1/reviews
 * @access  Public
 */
export const getAllReviews = catchAsyncError(async (req, res) => {
  const apiFeature = new ApiFeatures(reviewModel.find(), req.query)
    .filteration()
    .search()
    .sort()
    .fields()
    .pagination();

  const reviews = await apiFeature.mongooseQuery;

  res.status(200).json({
    message: "success",
    results: reviews.length,
    page: apiFeature.queryString.page * 1 || 1,
    data: reviews,
  });
});

/**
 * @desc    Get a single review by ID
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
export const getReview = catchAsyncError(async (req, res, next) => {
  const review = await reviewModel.findById(req.params.id);

  if (!review) return next(new AppError("Review not found", 404));

  res.status(200).json({ message: "success", data: review });
});

/**
 * @desc    Update a review (only by owner)
 * @route   PATCH /api/v1/reviews/:id
 * @access  Private (user)
 */
export const updateReview = catchAsyncError(async (req, res, next) => {
  const review = await reviewModel.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true }
  );

  if (!review) {
    return next(
      new AppError("Review not found or you are not authorized to update it", 403)
    );
  }

  res.status(200).json({ message: "success", data: review });
});

/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private (user/admin)
 */
export const deleteReview = deleteOne(reviewModel, "Review");
