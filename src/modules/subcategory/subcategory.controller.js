import slugify from "slugify";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { subCategoryModel } from "../../../Database/models/subcategory.model.js";
import { deleteOne } from "../../handlers/factors.js"; // make sure this exists!
import { ApiFeatures } from "../../utils/ApiFeatures.js";

/**
 * @desc    Create a new SubCategory
 * @route   POST /api/v1/subcategories
 * @access  Private (admin)
 */
export const addSubCategory = catchAsyncError(async (req, res) => {
  const { name, category } = req.body;

  const subCategory = await subCategoryModel.create({
    name,
    slug: slugify(name),
    category,
  });

  res.status(201).json({ message: "success", data: subCategory });
});

/**
 * @desc    Get all SubCategories (optionally filtered by Category)
 * @route   GET /api/v1/subcategories
 * @access  Public
 */
export const getAllSubCategories = catchAsyncError(async (req, res) => {
  const filter = req.params.categoryId ? { category: req.params.categoryId } : {};

  const apiFeatures = new ApiFeatures(subCategoryModel.find(filter), req.query)
    .filteration()
    .sort()
    .fields()
    .pagination();

  const subCategories = await apiFeatures.mongooseQuery;

  res.status(200).json({
    message: "success",
    results: subCategories.length,
    page: apiFeatures.queryString.page * 1 || 1,
    data: subCategories,
  });
});

/**
 * @desc    Get single SubCategory by ID
 * @route   GET /api/v1/subcategories/:id
 * @access  Public
 */
export const getSubCategory = catchAsyncError(async (req, res, next) => {
  const subCategory = await subCategoryModel.findById(req.params.id);

  if (!subCategory) return next(new AppError("Subcategory not found", 404));

  res.status(200).json({ message: "success", data: subCategory });
});

/**
 * @desc    Update a SubCategory
 * @route   PATCH /api/v1/subcategories/:id
 * @access  Private (admin)
 */
export const updateSubCategory = catchAsyncError(async (req, res, next) => {
  if (req.body.name) req.body.slug = slugify(req.body.name);

  const subCategory = await subCategoryModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!subCategory) return next(new AppError("Subcategory not found", 404));

  res.status(200).json({ message: "success", data: subCategory });
});

/**
 * @desc    Delete a SubCategory
 * @route   DELETE /api/v1/subcategories/:id
 * @access  Private (admin)
 */
export const deleteSubCategory = deleteOne(subCategoryModel, "Subcategory");
