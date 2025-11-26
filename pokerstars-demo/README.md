# 🎰 PokerStars Age Verification Demo

A complete demo application showing how to implement **KYC (Know Your Customer)** and **Age Verification** using **Telefónica's Open Gateway APIs**. This demo simulates the PokerStars registration flow with real-time identity and age verification.

## 🎯 What This Demo Does

This application demonstrates a complete user onboarding flow for online gaming platforms:

1. **User Registration Form**: Collects user personal information
2. **Identity Verification (KYC)**: Validates user identity against official records
3. **Age Verification**: Confirms user is 18+ years old through carrier verification
4. **Eligibility Decision**: Determines if user can play based on verification results

## 🏗️ How It Works

### The Complete Flow:
```
1. User fills form with personal data
2. App sends verification request to Open Gateway
3. Open Gateway performs KYC check against official databases
4. Open Gateway performs age verification through mobile carrier
5. App receives verification results
6. User gets approval/rejection with detailed feedback
```

### Technologies Used:
- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes
- **APIs**: Telefónica Open Gateway (KYC + Age Verification)
- **Authentication**: CIBA (Client Initiated Backchannel Authentication)

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **Open Gateway API credentials** (KYC + Age Verification)

### 1. Installation

```bash
# Clone or download this folder
cd pokerstars-demo

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory with your API credentials:

```bash
# Open Gateway API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-opengateway-endpoint.com

# KYC Verification Credentials
CLIENT_ID_KYC=your_kyc_client_id
CLIENT_SECRET_KYC=your_kyc_client_secret

# Age Verification Credentials  
CLIENT_ID_AV=your_age_verification_client_id
CLIENT_SECRET_AV=your_age_verification_client_secret
```

**⚠️ Important**: You need separate credentials for KYC and Age Verification services.

### 3. Run the Application

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Test the Demo

1. **Fill the form** with test data (or use "Generate Data" button)
2. **Click "COMENZAR A JUGAR EN POKERSTARS"**
3. **Watch the verification process** in the browser and terminal
4. **See the results** - approved/rejected with detailed feedback

## 📁 Project Structure

```
pokerstars-demo/
├── app/                          # Next.js App Router
│   ├── api/kyc-match/           # Verification API endpoint
│   │   └── route.ts             # Main API logic
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── pokerstars.css           # PokerStars-specific styles
├── components/                   # React components
│   ├── PokerStarsForm.tsx       # Registration form
│   ├── PokerStarsResults.tsx    # Results display
│   └── PokerStarsVerification.tsx # Main verification component
├── public/images/               # Static assets
│   └── pokerstars-logo.png      # PokerStars logo
├── src/                         # Source code
│   └── services/                # Business logic
│       └── verification.ts      # Open Gateway integration
├── types/                       # TypeScript definitions
│   └── index.ts                 # Type definitions
├── .env.local                   # Environment variables (create this)
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

## 🔧 Configuration

### API Endpoints Used:
- **KYC Match**: `/kyc-match/v0.2/match`
- **Age Verification**: `/kyc-age-verification/v0.1/verify`
- **Authentication**: `/bc-authorize` + `/token`

### Required Phone Number Format:
- Must use international format: `+34696567000`
- The demo uses Spanish numbers by default

### Test Data:
The form includes a "Generate Data" button that creates realistic test data for Spanish users.

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Utilities
npm run type-check   # Check TypeScript types
```

## 🔍 Understanding the Results

### Successful Verification ✅
- **KYC Verified**: Identity matches official records
- **Age Verified**: User is 18+ years old
- **Can Play**: User is eligible for PokerStars

### Failed Verification ❌
- **KYC Failed**: Identity doesn't match or incomplete data
- **Age Failed**: User under 18 or verification failed
- **Cannot Play**: User not eligible, with specific reasons

### Result Fields Explained:
- `idDocumentMatch`: ID number validation
- `nameMatch`: Full name verification
- `birthdateMatch`: Birth date confirmation
- `addressMatch`: Address verification
- `ageCheck`: Age threshold verification (18+)

## 🚨 Troubleshooting

### Common Issues:

**"Invalid API credentials" (401)**
- Check your CLIENT_ID and CLIENT_SECRET in `.env.local`
- Ensure you have separate credentials for KYC and Age services

**"No permission to verify phone number" (403)**
- The phone number might not be authorized for testing
- Contact Open Gateway support to whitelist test numbers

**"Invalid phone number format" (400)**
- Use international format: `+34696567000`
- Don't include spaces or special characters

**"Verification service unavailable" (404)**
- Check the API base URL in your environment variables
- Verify the service endpoints are correct

## 📊 Monitoring

The application logs verification attempts and results to the console. Check your terminal/browser console for detailed information about:
- API requests and responses
- Verification results
- Error details and troubleshooting hints

## 🔒 Security Notes

- Never commit your `.env.local` file to version control
- API credentials should be kept secure
- This is a demo - add proper authentication for production use
- Validate all user inputs on both client and server side

## 📞 Support

For API-related issues, contact Telefónica Open Gateway support.
For demo-specific questions, check the console logs for detailed error information.

## 🎮 Ready to Play!

Once everything is set up, you'll have a fully functional age verification system that can:
- Verify user identities in real-time
- Confirm users are of legal gambling age
- Provide detailed feedback on verification results
- Simulate a real-world online gaming registration flow

Perfect for understanding how modern age verification works in the gaming industry! 🎰✨