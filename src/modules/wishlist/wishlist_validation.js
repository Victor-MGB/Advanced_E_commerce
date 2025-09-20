import joi from "joi";

const addToWishListValidation = joi.object({
    productId: joi.string().hex().length(24).required(),
});

const deleteFromWishListValidation = joi.object({
    productId: joi.string().hex().length(24).required(),
});

export { addToWishListValidation, deleteFromWishListValidation };