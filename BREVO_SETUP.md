# Brevo Newsletter Setup Guide

## 🚀 Quick Setup Steps

### 1. Create Brevo Account
- Go to [Brevo.com](https://app.brevo.com) and create a free account
- Verify your email address

### 2. Get Your API Key
- Login to your Brevo dashboard
- Click on your profile name (top right) → **SMTP & API**
- Click on **API Keys** tab
- Click **Generate a new API key**
- Enter a name like "Newsletter Signup" and click **Generate**
- Copy your API key ⚠️ **Save this securely!**

### 3. Configure Server Environment Variable
Add this to your **server/.env** file (create if it doesn't exist):
```
BREVO_API_KEY=your_api_key_here
```

### 4. Start Your Backend Server
```bash
cd server
npm start
# or
node server.js
```

### 5. Optional: Create a Contact List
- In Brevo dashboard, go to **Contacts** → **Lists**
- Click **Create a list**
- Name it "Newsletter Subscribers"
- Note the List ID (you can add this to the server endpoint later)

## ✅ Testing
- Make sure your backend server is running on port 4242
- Test the newsletter form on your frontend
- Subscriptions will appear in your Brevo **Contacts** section
- Check server console for success/error logs

## 🔧 How It Works
1. **Frontend** sends email to your backend (`/api/newsletter/subscribe`)
2. **Backend** calls Brevo API with your secure API key
3. **Brevo** adds the contact to your account
4. **Backend** returns success/error to frontend

## 📊 Free Tier Limits
- **300 emails/day** (perfect for newsletter signups)
- **Unlimited contacts**
- **Email marketing tools included**

## 🛠️ Troubleshooting
- Ensure backend server is running: `http://localhost:4242`
- Check server console for API key errors
- Verify Brevo API key is correct
- Check browser network tab for 404/500 errors

---

**Note**: API key is now stored securely server-side, not in frontend environment variables! 