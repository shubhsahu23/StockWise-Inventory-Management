export const notFoundHandler = (req, res) => {
  res.status(404).json({ message: 'Route not found' })
}

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500
  const message = err.message || 'Server error'

  if (process.env.NODE_ENV !== 'production') {
    console.error(err)
  }

  res.status(statusCode).json({
    message
  })
}
