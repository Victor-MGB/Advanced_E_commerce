import QRCode from "qrcode";
import { catchAsyncError } from "../../utils/catchAsyncError.js";
import { AppError } from "../../utils/AppError.js";
import { deleteOne } from "../../handlers/factors.js";
import { ApiFeatures } from "../../utils/ApiFeatures.js";
import { couponModel } from "../../../Database/models/coupon.model.js";

//  Create Coupon
export const createCoupon = catchAsyncError(async (req, res) => {
  const coupon = await couponModel.create(req.body);
  res.status(201).json({ message: "success", data: coupon });
});

//  Get All Coupons with Query Features
export const getAllCoupons = catchAsyncError(async (req, res) => {
  const apiFeatures = new ApiFeatures(couponModel.find(), req.query)
    .pagination()
    .fields()
    .filteration()
    .search()
    .sort();

  const page = apiFeatures.queryString.page * 1 || 1;
  const coupons = await apiFeatures.mongooseQuery;

  res.status(200).json({
    message: "success",
    results: coupons.length,
    page,
    data: coupons,
  });
});

//  Get Specific Coupon + QR Code
export const getSpecificCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await couponModel.findById(id);

  if (!coupon) return next(new AppError("Coupon not found", 404));

  const qrCodeUrl = await QRCode.toDataURL(coupon.code);

  res.status(200).json({ message: "success", data: coupon, qrCodeUrl });
});

// Update Coupon
export const updateCoupon = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await couponModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!coupon) return next(new AppError("Coupon not found", 404));

  res.status(200).json({ message: "success", data: coupon });
});

// Delete Coupon
export const deleteCoupon = deleteOne(couponModel, "Coupon");
