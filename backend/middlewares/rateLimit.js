// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

// Configure the rate limiter
 export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { success: false, error: 'Too many requests, please try again after 15 minutes' },
  headers: true, // Include rate limit headers (e.g., X-RateLimit-Limit, X-RateLimit-Remaining)
});

