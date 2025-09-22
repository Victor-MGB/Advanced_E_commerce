import slugify from "slugify";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factors.js"; // ensure this exists!
import { productModel } from "../../../Database/models/product.model.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";

/**
 * @desc    Create a new product
 * @route   POST /api/v1/products
 * @access  Private (Admin)
 */
export const addProduct = catchAsyncError(async (req, res) => {
  // Handle images
  if (req.files?.imgCover) {
    req.body.imgCover = req.files.imgCover[0].filename;
  }
  if (req.files?.images) {
    req.body.images = req.files.images.map((img) => img.filename);
  }

  // Create slug from title
  if (req.body.title) {
    req.body.slug = slugify(req.body.title, { lower: true });
  }

  const product = await productModel.create(req.body);

  res.status(201).json({
    status: "success",
    data: product,
  });
});

/**
 * @desc    Get all products
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getAllProducts = catchAsyncError(async (req, res) => {
  const apiFeature = new ApiFeatures(productModel.find(), req.query)
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();

  const products = await apiFeature.mongooseQuery;
  const page = Number(req.query.page) || 1;

  res.status(200).json({
    status: "success",
    results: products.length,
    page,
    data: products,
  });
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/v1/products/:id
 * @access  Public
 */
export const getSpecificProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const product = await productModel.findById(id);

  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    status: "success",
    data: product,
  });
});

/**
 * @desc    Update product by ID
 * @route   PATCH /api/v1/products/:id
 * @access  Private (Admin)
 */
export const updateProduct = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;

  // Update slug if title changes
  if (req.body.title) {
    req.body.slug = slugify(req.body.title, { lower: true });
  }

  const product = await productModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) return next(new AppError("Product not found", 404));

  res.status(200).json({
    status: "success",
    data: product,
  });
});

/**
 * @desc    Delete product
 * @route   DELETE /api/v1/products/:id
 * @access  Private (Admin)
 */
export const deleteProduct = deleteOne(productModel, "Product");
