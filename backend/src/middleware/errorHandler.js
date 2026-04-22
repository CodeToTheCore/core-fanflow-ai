function errorHandler(err, req, res, next) {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  })
 
  // Postgres errors
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Resource already exists', detail: err.detail })
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced resource not found' })
  }
 
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' })
  }
 
  // OpenAI errors
  if (err.status === 429 && err.type === 'requests') {
    return res.status(429).json({ error: 'AI rate limit reached. Please try again in a moment.' })
  }
 
  const status = err.status || err.statusCode || 500
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}
 
module.exports = errorHandler
 