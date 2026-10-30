export default function errorHandler(error, _req, res, _next) {
  console.error(error);

  let statusCode = error.statusCode || 500;
  let msg = error.message || 'Something went wrong, try again later';

  if (error.name === 'ValidationError') {
    msg = Object.values(error.errors)
      .map((item) => item.message)
      .join(', ');
    statusCode = 400;
  }

  if (error.code === 11000) {
    msg = `Duplicate value entered for ${Object.keys(error.keyValue)} field, please choose another value`;
    statusCode = 400;
  }

  return res.status(statusCode).json({ msg });
}
