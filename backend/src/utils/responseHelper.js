export const sendResponse = (res, statusCode, data, message) => {
  res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data
  })
}
