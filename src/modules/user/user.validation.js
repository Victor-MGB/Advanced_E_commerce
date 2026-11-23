import Joi from "joi";

const addUserValidation = Joi.object({
  name: Joi.string().required().trim(),
  email: Joi.string().email().required().trim(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid("user", "admin"),
});

const updateUserValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
  name: Joi.string().trim(),
  email: Joi.string().email().trim(),
  password: Joi.string().min(8),
  role: Joi.string().valid("user", "admin"),
  isActive: Joi.boolean(),
  verified: Joi.boolean(),
  blocked: Joi.boolean(),
});

const changeUserPasswordValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
  password: Joi.string().min(8).required(),
});

const deleteUserValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const updateMeValidation = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email().trim(),
});

const changeMyPasswordValidation = Joi.object({
  currentPassword: Joi.string().required(),
  password: Joi.string().min(8).required(),
});

export {
  addUserValidation,
  updateUserValidation,
  changeUserPasswordValidation,
  deleteUserValidation,
  updateMeValidation,
  changeMyPasswordValidation,
};
