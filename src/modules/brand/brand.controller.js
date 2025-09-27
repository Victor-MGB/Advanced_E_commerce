import slugify from "slugify";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { brandModel } from "../../../Database/models/brand.model.js";
import { deleteOne } from "../../handlers/factors.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

/**
 * @desc    Create a new brand
 * @route   POST /api/v1/brands
 * @access  Admin
 */
export const addBrand = catchAsyncError(async (req, res, next) => {
  if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true });

  const brand = await brandModel.create(req.body);

  res.status(201).json({
    message: "success",
    data: brand,
  });
});

/**
 * @desc    Get all brands
 * @route   GET /api/v1/brands
 * @access  Public
 */
export const getAllBrands = catchAsyncError(async (req, res, next) => {
  const apiFeature = new ApiFeatures(brandModel.find(), req.query)
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();

  const page = apiFeature.queryString.page * 1 || 1;
  const brands = await apiFeature.mongooseQuery;

  res.status(200).json({
    message: "success",
    results: brands.length,
    page,
    data: brands,
  });
});

/**
 * @desc    Update a brand
 * @route   PATCH /api/v1/brands/:id
 * @access  Admin
 */
export const updateBrand = catchAsyncError(async (req, res, next) => {
  if (req.body.name) req.body.slug = slugify(req.body.name, { lower: true });

  const brand = await brandModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!brand) return next(new AppError("Brand not found", 404));

  res.status(200).json({
    message: "success",
    data: brand,
  });
});

/**
 * @desc    Delete a brand
 * @route   DELETE /api/v1/brands/:id
 * @access  Admin
 */
export const deleteBrand = deleteOne(brandModel, "Brand");
