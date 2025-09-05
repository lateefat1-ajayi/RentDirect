// Simple in-memory rate limiter (per IP + route) for low-traffic/dev use
// For production, use a persistent store (e.g., Redis) or a proven library.

const requestStore = new Map();

function getKey(ip, route) {
  return `${ip}:${route}`;
}

export default function rateLimit({ windowMs = 60_000, max = 5 } = {}) {
  return (req, res, next) => {
    try {
      const now = Date.now();
      const key = getKey(req.ip || req.connection?.remoteAddress || "unknown", req.originalUrl);

      const record = requestStore.get(key) || { count: 0, start: now };

      if (now - record.start > windowMs) {
        record.count = 0;
        record.start = now;
      }

      record.count += 1;
      requestStore.set(key, record);

      if (record.count > max) {
        const retryAfter = Math.ceil((record.start + windowMs - now) / 1000);
        res.setHeader("Retry-After", retryAfter);
        return res.status(429).json({ message: "Too many requests. Please try again later." });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}


