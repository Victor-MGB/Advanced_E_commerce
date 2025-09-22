import slugify from "slugify";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { categoryModel } from "../../../Database/models/category.model.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { deleteOne } from "../../handlers/factors.js"; // make sure this exists!

/**
 * @desc    Create a new category
 * @route   POST /api/v1/categories
 * @access  Private (Admin)
 */
export const addCategory = catchAsyncError(async (req, res, next) => {
  if (req.file?.filename) {
    req.body.image = req.file.filename; // use lowercase `image` for consistency
  }

  if (req.body.name) {
    req.body.slug = slugify(req.body.name, { lower: true });
  }

  const category = await categoryModel.create(req.body);

  res.status(201).json({
    status: "success",
    data: category,
  });
});

/**
 * @desc    Get all categories
 * @route   GET /api/v1/categories
 * @access  Public
 */
export const getAllCategories = catchAsyncError(async (req, res) => {
  const apiFeature = new ApiFeatures(categoryModel.find(), req.query)
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();

  const categories = await apiFeature.mongooseQuery;
  const page = Number(req.query.page) || 1;

  res.status(200).json({
    status: "success",
    results: categories.length,
    page,
    data: categories,
  });
});

/**
 * @desc    Update category by ID
 * @route   PATCH /api/v1/categories/:id
 * @access  Private (Admin)
 */
export const updateCategory = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  if (req.body.name) {
    req.body.slug = slugify(req.body.name, { lower: true });
  }
  if (req.file?.filename) {
    req.body.image = req.file.filename;
  }

  const category = await categoryModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) return next(new AppError("Category not found", 404));

  res.status(200).json({
    status: "success",
    data: category,
  });
});

/**
 * @desc    Delete category
 * @route   DELETE /api/v1/categories/:id
 * @access  Private (Admin)
 */
export const deleteCategory = deleteOne(categoryModel, "Category");
