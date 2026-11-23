import Joi from "joi";

const addReviewValidation = Joi.object({
  comment: Joi.string().trim().required(),
  productId: Joi.string().hex().length(24).required(),
  rating: Joi.number().integer().min(1).max(5).default(1),
});

const getSpecificReviewValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateReviewValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
  comment: Joi.string().trim(),
  rating: Joi.number().integer().min(1).max(5),
});

const deleteReviewValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export {
  addReviewValidation,
  getSpecificReviewValidation,
  updateReviewValidation,
  deleteReviewValidation,
};
