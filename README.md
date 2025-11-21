# RedeemOrDie - Streetwear E-commerce Website

A modern, responsive e-commerce website for the RedeemOrDie clothing brand, built with React TypeScript and a Node.js backend.

## Features

- **Responsive Design**: Mobile-first approach with modern dark theme and red accents
- **E-commerce Functionality**: Complete shopping cart, checkout with Stripe integration
- **Product Management**: Admin dashboard for inventory management via Airtable
- **Newsletter System**: Brevo (Sendinblue) integration for email marketing
- **Multi-currency Support**: Dynamic currency conversion and formatting
- **Search & Filter**: Product search and filtering capabilities
- **Payment Processing**: Secure Stripe checkout with success flow
- **Email Notifications**: Contact form and order confirmations via EmailJS
- **Real-time Cart**: Persistent shopping cart with local storage
- **SEO Friendly**: Proper meta tags and semantic HTML

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **React Router v6** for navigation
- **Context API** for state management
- **CSS3** with custom properties and responsive design
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **Brevo API** for newsletter subscriptions
- **CORS** enabled for cross-origin requests

### Third-party Services
- **Stripe** - Payment processing
- **Airtable** - Product database and inventory management
- **Brevo (Sendinblue)** - Email marketing and newsletters
- **EmailJS** - Contact form emails
- **Firebase** - Authentication and hosting

## Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/demolaxbee/redeemordie-website.git
cd redeemordie-website
```

### 2. Frontend Setup
```bash
# Install frontend dependencies
npm install

# Create .env file for frontend environment variables
cp .env.example .env
```

Add your environment variables to `.env`:
```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
REACT_APP_AIRTABLE_API_KEY=your_airtable_api_key
REACT_APP_AIRTABLE_BASE_ID=your_airtable_base_id
REACT_APP_EMAILJS_SERVICE_ID=your_emailjs_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_emailjs_public_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_firebase_project_id
```

### 3. Backend Setup
```bash
# Navigate to server directory
cd server

# Install backend dependencies
npm install

# Create .env file for backend
cp .env.example .env
```

Add your backend environment variables to `server/.env`:
```env
BREVO_API_KEY=your_brevo_api_key
PORT=4242
```

### 4. Start Development Servers

**Frontend** (in root directory):
```bash
npm start
```

**Backend** (in server directory):
```bash
cd server
npm start
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:4242`.

## Design System

### Color Scheme
- **Primary**: Dark theme with red accents (#ff0000)
- **Background**: Dark grays and blacks
- **Text**: White and light grays
- **Accent**: Bright red for CTAs and highlights

### Typography
- **Primary Font**: Montserrat
- **Secondary Font**: Bebas Neue
- **Body Text**: Clean, readable sans-serif

## Pages & Features

### Customer-Facing Pages
1. **Home** - Hero section, featured products, newsletter signup
2. **Shop** - Product catalog with search and filtering
3. **Product Detail** - Individual product pages with variants
4. **Cart** - Shopping cart management with currency conversion
5. **Checkout** - Secure Stripe payment processing
6. **Thank You** - Post-purchase confirmation page
7. **About** - Brand story and information
8. **Contact** - Contact form with EmailJS integration

### Admin Features
1. **Admin Login** - Secure authentication
2. **Admin Dashboard** - Product and inventory management
3. **Real-time Updates** - Inventory changes via Airtable

### Key Components
- **Navbar** - Responsive navigation with cart indicator
- **Footer** - Links, social media, and additional info
- **Product Card** - Reusable product display component
- **Cart Sidebar** - Slide-out cart interface
- **Currency Selector** - Multi-currency support
- **Search Bar** - Product search functionality

## Development

### Project Structure
```
src/
├── components/        # Reusable UI components
│   ├── CartSidebar.tsx
│   ├── CurrencySelector.tsx
│   ├── Navbar.tsx
│   ├── ProductCard.tsx
│   └── ...
├── pages/            # Page components
│   ├── Home.tsx
│   ├── Shop.tsx
│   ├── ProductDetail.tsx
│   ├── Checkout.tsx
│   ├── AdminDashboard.tsx
│   └── ...
├── context/          # React Context providers
│   ├── CartContext.tsx
│   ├── CurrencyContext.tsx
│   ├── SearchContext.tsx
│   └── AuthContext.tsx
├── utils/            # Helper functions and services
│   ├── airtable.ts
│   ├── emailService.ts
│   ├── newsletterService.ts
│   ├── convertCurrency.ts
│   └── ...
├── styles/           # CSS files
└── assets/           # Images, fonts, etc.
```

### Server Structure
```
server/
├── server.js         # Express server with API endpoints
├── middleware/       # Custom middleware
└── package.json      # Backend dependencies
```

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm eject` - Ejects from Create React App

## 📄 License

MIT License - feel free to use this project as a template for your own work.
