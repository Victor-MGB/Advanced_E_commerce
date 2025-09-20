export const globalErrorHandling = (err, req, res, next) => {
    //must be last middleware
    let error = err.message;
    let code = err.statusCode || 500;
    process.env.NODE_ENV === "dev"
    ? res.status(code).json({
        message: error,
        stack: err.stack})
    : res.status(code).json({ message: error });
  }