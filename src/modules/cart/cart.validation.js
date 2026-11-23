import Joi from "joi";

const addProductToCartValidation = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).default(1),
});

const removeProductFromCart = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateProductQuantityValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
});

const applyCouponValidation = Joi.object({
  code: Joi.string().trim().required(),
});

export {
  addProductToCartValidation,
  removeProductFromCart,
  updateProductQuantityValidation,
  applyCouponValidation,
};
