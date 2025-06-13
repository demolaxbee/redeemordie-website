# Email Functionality Setup Guide

## Setting up EmailJS for Newsletter and Contact Form

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Create Email Service
1. In your EmailJS dashboard, go to "Email Services"
2. Click "Add New Service"
3. Choose your email provider (Gmail recommended)
4. Connect your `reedeemordie66@gmail.com` account
5. Note down the **Service ID**

### Step 3: Create Email Templates

#### Contact Form Template
1. Go to "Email Templates" in EmailJS dashboard
2. Click "Create New Template"
3. Template Name: "Contact Form"
4. Subject: `New Contact Form Message: {{subject}}`
5. Content:
```
New message from RedeemOrDie website:

From: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
Sent from RedeemOrDie Contact Form
```
6. Note down the **Template ID**

#### Newsletter Template
1. Create another template
2. Template Name: "Newsletter Signup"
3. Subject: `New Newsletter Subscription`
4. Content:
```
New newsletter subscription:

Email: {{user_email}}

---
Sent from RedeemOrDie Newsletter Signup
```
6. Note down the **Template ID**

### Step 4: Update Configuration
1. Open `src/utils/emailService.ts`
2. Replace the placeholder values:
```typescript
const EMAILJS_PUBLIC_KEY = 'your_public_key_here'; // From EmailJS dashboard
const EMAILJS_SERVICE_ID = 'your_service_id_here'; // From Step 2
const EMAILJS_CONTACT_TEMPLATE_ID = 'your_contact_template_id'; // From Step 3
const EMAILJS_NEWSLETTER_TEMPLATE_ID = 'your_newsletter_template_id'; // From Step 3
```

### Step 5: Get Public Key
1. In EmailJS dashboard, go to "Account" → "General"
2. Copy your **Public Key**
3. Paste it in the configuration

### Step 6: Test the Forms
1. Start your development server: `npm start`
2. Test the newsletter signup on the home page
3. Test the contact form on the contact page
4. Check your `reedeemordie66@gmail.com` inbox for emails

## Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Check your public key and service ID
2. **Template not found**: Verify template IDs are correct
3. **Service not found**: Ensure service ID matches your EmailJS service
4. **Rate limiting**: EmailJS free plan has sending limits

### Gmail Setup:
- If using Gmail, you may need to enable "Less secure app access" or use App Passwords
- Consider using EmailJS's Gmail integration for better security

## Environment Variables (Optional)
For better security, you can use environment variables:

1. Create `.env` file in your project root:
```
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_CONTACT_TEMPLATE_ID=your_contact_template_id
REACT_APP_EMAILJS_NEWSLETTER_TEMPLATE_ID=your_newsletter_template_id
```

2. Update `emailService.ts`:
```typescript
const EMAILJS_PUBLIC_KEY = process.env.REACT_APP_EMAILJS_PUBLIC_KEY || '';
// ... etc
```

## Features Implemented

✅ **Newsletter Signup**: Collects email addresses and sends notification to admin  
✅ **Contact Form**: Sends detailed contact messages with all form fields  
✅ **Loading States**: Shows "Sending..." during submission  
✅ **Success/Error Messages**: User feedback for form submissions  
✅ **Form Validation**: Required fields and email validation  
✅ **Form Reset**: Clears form after successful submission  

Both forms now send emails to `reedeemordie66@gmail.com` when properly configured! 