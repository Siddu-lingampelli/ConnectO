// Simple in-memory rate limiter for AI endpoints
const rateLimitMap = new Map();

/**
 * Rate limiter middleware
 * @param {number} maxRequests - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 */
export const rateLimiter = (maxRequests = 10, windowMs = 60000) => {
  return (req, res, next) => {
    const userId = req.user?._id?.toString() || req.ip;
    const now = Date.now();
    
    if (!rateLimitMap.has(userId)) {
      rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const userLimit = rateLimitMap.get(userId);

    // Reset if window has passed
    if (now > userLimit.resetTime) {
      rateLimitMap.set(userId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    // Check if limit exceeded
    if (userLimit.count >= maxRequests) {
      const retryAfter = Math.ceil((userLimit.resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
        retryAfter: retryAfter
      });
    }

    // Increment count
    userLimit.count++;
    rateLimitMap.set(userId, userLimit);
    next();
  };
};

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [userId, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(userId);
    }
  }
}, 5 * 60 * 1000);
