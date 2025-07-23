# NutriLife AI 🥗✨

NutriLife AI is your personal health assistant, designed to help you make smarter choices about the food and lifestyle products you use every day. Powered by the Google Gemini API, this app provides instant, data-driven insights to empower your wellness journey.

## Features

*   🔐 **Cross-Device Accounts:** Sign up and log in from any device. Your data is securely stored in the cloud with Firebase.
*   🔬 **Product Analyzer:** Not sure if a product is healthy? Snap a picture of its label or just type in the name. You'll get an instant health score (A-F), a detailed ingredient analysis, suggestions for healthier alternatives, a product image, and links to buy online.
*   🌿 **Lifestyle Overhaul:** Want a bigger picture? List your regular daily products and receive a complete, prioritized action plan to improve your habits, complete with smart swaps.
*   ✨ **Personalized Recommendations:** Get AI-powered suggestions for new products you might love, based on your previous analyses.
*   📚 **Cloud-Synced History:** Every analysis is automatically saved to your account. Revisit your past reports anytime, from any device.

## Firebase Backend Setup

This application uses Firebase for authentication and as a database. To run it, you must first set up your own Firebase project.

### Step 1: Create a Firebase Project
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and give it a name (e.g., "NutriLife AI").
3.  Follow the on-screen steps. You can disable Google Analytics if you wish.

### Step 2: Register Your Web App
1.  In your project's dashboard, click the **Web icon (`</>`)**.
2.  Give your app a nickname and click **"Register app"**.
3.  Firebase will show a `firebaseConfig` object. **Keep these values handy**, as you'll need them later.

### Step 3: Enable Authentication Methods
1.  In the left menu, go to **Build > Authentication**.
2.  Click **"Get started"**.
3.  Under the **"Sign-in method"** tab, click **"Add new provider"**.
4.  Enable the providers you want:
    *   **Email/Password**: Select it, click the **Enable** switch, and save.
    *   **Google**: Select it, click the **Enable** switch, choose a project support email, and save.

### Step 4: Set Up Firestore Database
1.  In the left menu, go to **Build > Firestore Database**.
2.  Click **"Create database"**.
3.  Start in **production mode**.
4.  Choose a location for your database.

### Step 5: Configure Firestore Security Rules
1.  In Firestore, go to the **"Rules"** tab.
2.  Replace the default rules with the following to ensure users can only access their own data. This is a critical security step!
    ```
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        // Users can only read and write to their own document.
        match /users/{userId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
    }
    ```
3.  Click **"Publish"**.

---

## Vercel Deployment Guide

Deploying this app to Vercel is the recommended way to get it online.

### Step 1: Import Your Project
1. Log in to your [Vercel](https://vercel.com) account.
2. From your dashboard, click **"Add New... > Project"**.
3. Import your project from your GitHub repository.

### Step 2: Configure Build & Output Settings
Vercel should automatically detect that this is a **Vite** project. If you need to check or enter them manually, use the following:

- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Step 3: Add Environment Variables
This is the most important step for connecting to Firebase and Google AI.
1. In your new Vercel project's dashboard, click on the **"Settings"** tab.
2. Choose **"Environment Variables"** from the menu on the left.
3. Add the **seven** required variables one by one. The `KEY` must match exactly. The `VALUE` comes from your Firebase project config and Google AI Studio.

| Key                                     | Value                                      |
| :-------------------------------------- | :----------------------------------------- |
| `API_KEY`                               | `your-google-ai-api-key-goes-here`         |
| `VITE_FIREBASE_API_KEY`                 | `your-firebase-api-key`                    |
| `VITE_FIREBASE_AUTH_DOMAIN`             | `your-firebase-auth-domain`                |
| `VITE_FIREBASE_PROJECT_ID`              | `your-firebase-project-id`                 |
| `VITE_FIREBASE_STORAGE_BUCKET`          | `your-firebase-storage-bucket`             |
| `VITE_FIREBASE_MESSAGING_SENDER_ID`     | `your-firebase-messaging-sender-id`        |
| `VITE_FIREBASE_APP_ID`                  | `your-firebase-app-id`                     |

### Step 4: Deploy
1. After adding all environment variables, you must **trigger a new deployment**.
2. Go to the **"Deployments"** tab for your project.
3. Find the most recent deployment, click the "..." menu on the right, and select **"Redeploy"**.

---
## Local Development

If you want to run the project on your own machine:

### 1. Configure Local Environment Variables
1.  Create a file named `.env.local` in the root of your project.
2.  Copy the template below into the file and fill it with your actual keys from Firebase and Google AI Studio.

    ```bash
    # Your Google Gemini API Key
    API_KEY="your-google-ai-api-key"

    # Your Firebase Project Credentials
    VITE_FIREBASE_API_KEY="your-firebase-api-key"
    VITE_FIREBASE_AUTH_DOMAIN="your-firebase-auth-domain"
    VITE_FIREBASE_PROJECT_ID="your-firebase-project-id"
    VITE_FIREBASE_STORAGE_BUCKET="your-firebase-storage-bucket"
    VITE_FIREBASE_MESSAGING_SENDER_ID="your-firebase-messaging-sender-id"
    VITE_FIREBASE_APP_ID="your-firebase-app-id"
    ```

### 2. Install and Run
1.  Install the necessary packages: `npm install`
2.  Start the development server: `npm run dev`