# Production Setup Guide

## Environment Variables Required

### Frontend (.env)
```
REACT_APP_API_BASE_URL=https://redeemordie-website.onrender.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

### Backend (Render Environment Variables)
```
FRONTEND_URL=https://www.redeemordie.com
STRIPE_SECRET_KEY=sk_live_...
BREVO_API_KEY=xkeysib-...
EXCHANGE_API_KEY=...
PORT=4242
```

## Deployment Status

### Backend (Render)
- [x] Backend deployed to: https://redeemordie-website.onrender.com
- [x] CORS configured for production frontend
- [ ] Set FRONTEND_URL environment variable to: https://www.redeemordie.com
- [ ] Configure all other environment variables
- [ ] Test API endpoints

### Frontend (Production)
- [x] Frontend deployed to: https://www.redeemordie.com
- [x] Updated API base URL to use production backend
- [x] Fixed Firebase configuration for graceful fallback
- [x] Fixed manifest.json issues
- [ ] Set all required environment variables in Vercel
- [ ] Test complete checkout flow
- [ ] Test newsletter subscription

## Testing Production Setup

1. **Homepage**: Should load without errors ✅
2. **Newsletter**: Submit email on homepage
3. **Checkout**: Complete a test purchase
4. **Stock Updates**: Verify admin dashboard updates reflect on storefront
5. **CORS Test**: Ensure no CORS errors in browser console

## Environment Variable Setup Commands

### For Render (Backend)
Set this environment variable in your Render dashboard:
```
FRONTEND_URL=https://www.redeemordie.com
```

### For Vercel (Frontend)
Use the values from `VERCEL_ENV_VARS.md`

## Notes

- Backend automatically allows both www and non-www versions of your domain
- Newsletter service has fallback to production URL
- Checkout service has fallback to production URL
- Firebase configuration is now graceful (won't crash if missing)
- CORS includes localhost for development 