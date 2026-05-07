# Developer Quick Start

Get the Worry App running with Firebase in 5 minutes.

## Step 1: Clone & Install (1 min)

```bash
cd worry
npm install
```

## Step 2: Create Firebase Project (2 min)

1. Go to https://console.firebase.google.com
2. Click "Create project" → Enter name → Create
3. Wait for project to be ready

## Step 3: Set Up Firestore (1 min)

1. In Firebase Console: **Firestore Database**
2. Click **Create database**
3. Select location → **Start in test mode** → **Create**

## Step 4: Set Up Auth (1 min)

1. In Firebase Console: **Authentication**
2. **Get started** → **Email/Password**
3. Toggle **Enable** → **Save**

## Step 5: Add Credentials (1 min)

1. Firebase Console → **Project Settings** (gear icon)
2. **Your apps** → **Web** → Copy your config
3. In project root: `cp .env.example .env`
4. Paste your values into `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## Step 6: Start App

```bash
npm run dev
```

Visit `http://localhost:5173`

## Step 7: Create Admin User (1 min)

1. Firebase Console → **Authentication** → **Add user**
2. Create with email/password
3. Copy the user's UID
4. Firebase Console → **Firestore Database** → **Collections**
5. Create collection `users`
6. Add document with UID as ID:
   ```json
   {
     "uid": "user_uid_here",
     "name": "Your Name",
     "email": "your_email@example.com",
     "role": "admin",
     "createdAt": "2026-05-06"
   }
   ```

## Step 8: Set Security Rules (1 min)

1. Firebase Console → **Firestore Database** → **Rules**
2. Replace with content from `src/firebase/firestore-rules.txt`
3. Click **Publish**

## Done! 🎉

Login with your email/password at `http://localhost:5173`

---

## Useful Commands

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Build for production
npm run lint         # Check code style
```

## Stuck?

- Check [FIREBASE_SETUP_COMPLETE.md](./FIREBASE_SETUP_COMPLETE.md)
- Read [FIREBASE_QUICK_REFERENCE.md](./FIREBASE_QUICK_REFERENCE.md)
- Follow [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed steps
- Use [FIREBASE_CHECKLIST.md](./FIREBASE_CHECKLIST.md) to verify setup

## File Locations

- **Firebase config**: `src/firebase/config.js`
- **Your credentials**: `.env` (create from `.env.example`)
- **Security rules**: `src/firebase/firestore-rules.txt`
- **Database schema**: `src/firebase/db-schema.js`
- **Error handling**: `src/firebase/errors.js`

## That's It!

Your app is ready. Log in and start managing tasks! 🚀
