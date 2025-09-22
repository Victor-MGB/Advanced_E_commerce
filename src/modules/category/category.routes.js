import express from "express";
import * as category from "./category.controller.js";
import subCategoryRouter from "../subcategory/subcategory.routes.js";
import {
  addCategoryValidation,
  deleteCategoryValidation,
  updateCategoryValidation,
} from "./category.validation.js";
import { validate } from "../../middlewares/validate.js";
import { uploadSingleFile } from "../../../multer/multer.js";
import { allowedTo, protectedRoutes } from "../auth/auth.controller.js";

const router = express.Router();

// Nested routes for subcategories
router.use("/:categoryId/subcategories", subCategoryRouter);

/**
 * @route   /api/v1/categories
 */
router
  .route("/")
  .post(
    protectedRoutes,
    allowedTo("admin"),
    uploadSingleFile("image", "category"), // lowercase field
    validate(addCategoryValidation),
    category.addCategory
  )
  .get(category.getAllCategories);

/**
 * @route   /api/v1/categories/:id
 */
router
  .route("/:id")
  .patch( //  switched to PATCH (better for partial updates)
    protectedRoutes,
    allowedTo("admin"),
    validate(updateCategoryValidation),
    category.updateCategory
  )
  .delete(
    protectedRoutes,
    allowedTo("admin"),
    validate(deleteCategoryValidation),
    category.deleteCategory
  );

export default router;
