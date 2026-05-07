# 🚀 Complete Setup Guide - Get the App Running Now

This guide walks you through getting the Worry App running with a real Firebase project in about 10 minutes.

## Step 1: Clone and Install (2 minutes)

```bash
cd /Users/falakmishra/worry
npm install
```

Wait for all dependencies to install.

## Step 2: Create Firebase Project (3 minutes)

1. Go to https://console.firebase.google.com
2. Click **"Create a project"**
3. Enter name: **"Worry App"**
4. Click through and create the project
5. When asked about Analytics, you can skip it

## Step 3: Set Up Authentication (1 minute)

In Firebase Console:
1. Go to **Authentication** → **Get started**
2. Click **Email/Password**
3. Click the toggle to enable it
4. Save

## Step 4: Create Firestore Database (1 minute)

In Firebase Console:
1. Go to **Firestore Database**
2. Click **Create database**
3. Select your location (closest to you)
4. Choose **Start in test mode** (good for development)
5. Enable

## Step 5: Get Your Firebase Config (1 minute)

In Firebase Console:
1. Go to **Project Settings** (gear icon)
2. Under "Your apps", find or create a **Web app**
3. Copy the Firebase config object
4. You'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "worry-app.firebaseapp.com",
  projectId: "worry-app",
  storageBucket: "worry-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 6: Add Credentials to `.env` (1 minute)

Open `/Users/falakmishra/worry/.env` and fill it in:

```env
VITE_FIREBASE_API_KEY=AIza... (from above)
VITE_FIREBASE_AUTH_DOMAIN=worry-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=worry-app
VITE_FIREBASE_STORAGE_BUCKET=worry-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## Step 7: Set Up Firestore Security Rules (1 minute)

1. Firebase Console → **Firestore Database** → **Rules** tab
2. Replace the default rules with:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId;
      allow update, delete: if request.auth.uid == userId;
    }

    match /tasks/{taskId} {
      allow read, write: if request.auth != null;
    }

    match /meetings/{meetingId} {
      allow read, write: if request.auth != null;
    }

    match /activity/{actId} {
      allow read: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

## Step 8: Create Test User (1 minute)

1. Firebase Console → **Authentication** → **Users**
2. Click **Add user**
3. Email: `admin@example.com`
4. Password: `password123`
5. Click **Add user**
6. Copy the User UID shown in the list

## Step 9: Create User Profile in Firestore (1 minute)

1. Firebase Console → **Firestore Database** → **Data**
2. Click **Start collection**
3. Collection name: `users`
4. Document ID: Paste the User UID from step 8
5. Add these fields:
   - Field `uid` (string): (paste the UID again)
   - Field `name` (string): "Admin User"
   - Field `email` (string): "admin@example.com"  
   - Field `role` (string): "admin"
   - Field `createdAt` (date): Today's date
6. Save

## Step 10: Run the App! (1 minute)

```bash
cd /Users/falakmishra/worry
npm run dev
```

Visit `http://localhost:5173`

### First Login
- Email: `admin@example.com`
- Password: `password123`

You should see the dashboard!

## Step 11: Add Test Data (Optional)

### Add a Test Task

In Dashboard, click **Tasks**:
1. Click **"Add Task"** button
2. Fill in:
   - Title: "Fix homepage banner"
   - Status: "In Progress"
   - Priority: "High"
   - Deadline: (pick a date)
3. Create

### Add a Test Meeting

In Dashboard, click **Meetings**:
1. Click **"Schedule"** button
2. Fill in:
   - Title: "Team Standup"
   - Date: Today
   - Time: "10:00"
3. Create

Now your dashboard should show real data!

## Troubleshooting

### "Cannot find module" errors
- Make sure you restarted the dev server after adding `.env`
- Check that all 6 environment variables are filled in

### "Permission denied" when loading tasks
- Make sure your user profile is set up in Firestore (Step 9)
- Verify your role is set to "admin"

### Still blank dashboard
- Check browser console (F12) for errors
- Make sure Firestore rules are published (Step 7)
- Verify user is logged in

### Firebase config validation error
- Check that `.env` values don't have spaces
- Make sure you're using the exact values from Firebase Console

## Next: Advanced Setup

Once you have it running, check these files for more info:
- [00_START_HERE.md](./00_START_HERE.md) - Complete overview
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Detailed Firebase guide
- [FIREBASE_QUICK_REFERENCE.md](./FIREBASE_QUICK_REFERENCE.md) - Code examples

## You Did It! 🎉

Your Worry App is now running with:
- Real Firebase backend
- User authentication
- Firestore database
- Real-time updates

Start adding tasks, meetings, and invite team members!

---

**Need help?** Each page has helpful guides in the project documentation.
