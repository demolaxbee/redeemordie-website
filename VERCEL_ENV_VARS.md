# Vercel Environment Variables Setup

## Required Environment Variables

Copy these to your Vercel project settings under "Environment Variables":

### Essential Variables
```
REACT_APP_API_BASE_URL=https://redeemordie-website.onrender.com
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here
```

### Firebase Variables (For Admin Features)
```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=G-your_measurement_id
```

## Quick Fix for Current Deployment

**If you don't have Firebase set up yet, add these placeholder values to prevent the crash:**

```
REACT_APP_FIREBASE_API_KEY=placeholder
REACT_APP_FIREBASE_AUTH_DOMAIN=placeholder.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=placeholder
REACT_APP_FIREBASE_STORAGE_BUCKET=placeholder.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:placeholder
REACT_APP_FIREBASE_MEASUREMENT_ID=G-PLACEHOLDER
```

This will allow your site to load, but admin features won't work until you set up Firebase properly.

## Steps to Add Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable one by one:
   - Name: `REACT_APP_API_BASE_URL`
   - Value: `https://redeemordie-website.onrender.com`
   - Environment: `Production`
5. Click "Add" and repeat for all variables
6. Redeploy your project

## Testing After Setup

1. **Homepage**: Should load without errors
2. **Newsletter**: Should accept email submissions
3. **Shop**: Should display products and allow purchases
4. **Admin**: Will work once Firebase is properly configured

Your site should work immediately with the API base URL set! 