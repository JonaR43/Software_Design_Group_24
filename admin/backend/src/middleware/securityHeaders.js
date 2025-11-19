/**
 * Security Headers Middleware
 * Adds additional security headers beyond helmet defaults
 */

/**
 * Content Security Policy (CSP) Middleware
 * Prevents XSS attacks by controlling which resources can be loaded
 */
const contentSecurityPolicy = (req, res, next) => {
  // CSP header - strict policy to prevent XSS
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'", // Allow inline styles for Tailwind/CSS-in-JS
      "img-src 'self' data: https: blob:", // Allow images from self, data URIs, HTTPS, and blobs
      "font-src 'self' data:",
      "connect-src 'self' https://api.cloudinary.com", // API calls allowed to self and Cloudinary
      "frame-ancestors 'none'", // Prevent clickjacking
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  );

  // Additional security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  );

  next();
};

/**
 * Strict Transport Security (HSTS)
 * Forces HTTPS connections (only enable in production with HTTPS)
 */
const strictTransportSecurity = (req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  next();
};

/**
 * No Cache for Sensitive Routes
 * Prevents browser caching of sensitive data
 */
const noCache = (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
};

module.exports = {
  contentSecurityPolicy,
  strictTransportSecurity,
  noCache
};
