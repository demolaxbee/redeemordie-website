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
FRONTEND_URL=https://your-frontend-domain.com
STRIPE_SECRET_KEY=sk_live_...
BREVO_API_KEY=xkeysib-...
EXCHANGE_API_KEY=...
PORT=4242
```

## Deployment Checklist

### Backend (Render)
- [x] Backend deployed to: https://redeemordie-website.onrender.com
- [ ] Set FRONTEND_URL to your production frontend domain
- [ ] Configure all environment variables above
- [ ] Test API endpoints

### Frontend
- [x] Updated API base URL to use production backend
- [ ] Deploy frontend to hosting platform
- [ ] Set REACT_APP_API_BASE_URL to backend URL
- [ ] Test complete checkout flow
- [ ] Test newsletter subscription

## Testing Production Setup

1. **Newsletter Test**: Submit email on homepage
2. **Checkout Test**: Complete a test purchase
3. **Stock Updates**: Verify admin dashboard updates reflect on storefront
4. **CORS Test**: Ensure no CORS errors in browser console

## Notes

- Backend automatically allows the domain set in FRONTEND_URL
- Newsletter service has fallback to production URL
- Checkout service has fallback to production URL
- All localhost references removed for production 