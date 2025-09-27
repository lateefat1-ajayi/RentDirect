# RentDirect Backend Environment Setup

## Required Environment Variables

Create a `.env` file in the Backend directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/rentdirect

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL for CORS (IMPORTANT FOR DEPLOYMENT)
FRONTEND_URL=https://rentdirect-rd.netlify.app

# Email Configuration (for nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Paystack Configuration (for payments)
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

## CORS Configuration

The backend is configured to accept requests from:
- `https://rentdirect-rd.netlify.app` (production frontend)
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (alternative dev server)

Make sure to set `FRONTEND_URL=https://rentdirect-rd.netlify.app` in your production environment variables on Render.com.

## Deployment Notes

1. Set all environment variables in your Render.com dashboard
2. Ensure `FRONTEND_URL` is set to `https://rentdirect-rd.netlify.app` (without trailing slash)
3. The CORS configuration will automatically handle both the environment variable and hardcoded URLs
