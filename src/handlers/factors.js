import { AppError } from "../utils/AppError.js";
import { catchAsyncError } from "../utils/catchAsyncError.js";

export const deleteOne = (model, name) =>
  catchAsyncError(async (req, res, next) => {
    const { id } = req.params;

    const document = await model.findByIdAndDelete(id).lean();

    if (!document) {
      return next(new AppError(`No ${name} found with id: ${id}`, 404));
    }

    res.status(200).json({
      status: "success",
      data: { [name]: document },
    });
  });
