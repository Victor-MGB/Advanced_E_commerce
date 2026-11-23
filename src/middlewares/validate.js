export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(
      {
        ...req.body,
        ...req.params,
        ...req.query,
      },
      { abortEarly: false, allowUnknown: true }
    );

    if (error) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.details.map((detail) => ({
          message: detail.message,
          field: detail.path[0],
        })),
      });
    }

    req.body = value;
    next();
  };
};