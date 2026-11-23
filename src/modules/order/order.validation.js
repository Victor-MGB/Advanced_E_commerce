import Joi from "joi";

const shippingAddressValidation = Joi.object({
  street: Joi.string().trim().required(),
  city: Joi.string().trim().required(),
  phone: Joi.string().trim().required(),
});

const createCashOrderValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
  shippingAddress: shippingAddressValidation.required(),
});

const checkoutValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
  shippingAddress: shippingAddressValidation.required(),
});

export { createCashOrderValidation, checkoutValidation };
