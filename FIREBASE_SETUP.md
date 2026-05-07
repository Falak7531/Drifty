# Firebase Setup Guide for Worry App

This guide provides detailed instructions for setting up Firebase for the Worry App.

## Prerequisites

- A Google account
- Node.js and npm installed
- The Worry App repository cloned locally

## Step-by-Step Setup

### 1. Create Firebase Project

1. Navigate to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter your project name (e.g., "worry-app")
4. Accept the terms and click **"Continue"**
5. Choose to enable or disable Google Analytics (optional)
6. Click **"Create project"** and wait for completion

### 2. Register Web App

1. In the Firebase Console, click the **"<>"** icon to create a new web app
2. Enter an app nickname (e.g., "Worry Web App")
3. Check **"Also set up Firebase Hosting for this app"** (optional)
4. Click **"Register app"**
5. Copy the Firebase configuration object shown (you'll need this)

### 3. Set Up Authentication

1. In the left sidebar, click **"Authentication"**
2. Click the **"Get started"** button
3. In the **"Sign-in method"** tab, click **"Email/Password"**
4. Toggle **"Enable"** to ON
5. Click **"Save"**

### 4. Create Firestore Database

1. In the left sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Select your preferred location (closest to your users is best)
4. For development, choose **"Start in test mode"** (allows all reads/writes)
5. Click **"Create"**
6. Wait for the database to initialize

### 5. Configure Environment Variables

1. In the project root, copy the template file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your editor

3. Go back to Firebase Console → Project Settings (gear icon) → Your apps → Web app

4. Copy each value from the Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
   ```

5. Paste these values into `.env`:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

6. **DO NOT commit `.env` to version control** (it's in `.gitignore`)

### 6. Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** → **Rules** tab
2. Replace the default rules with the content from `src/firebase/firestore-rules.txt`:
   ```
   rules_version = '2';

   service cloud.firestore {
     match /databases/{database}/documents {
       // Users collection
       match /users/{userId} {
         allow read: if request.auth.uid == userId || isAdmin();
         allow create: if request.auth.uid == userId;
         allow update, delete: if request.auth.uid == userId || isAdmin();
       }

       // Tasks, meetings, activity (similar patterns)
       ...
     }
   }
   ```
3. Click **"Publish"**

### 7. Create First Admin User

1. In Firebase Console, go to **Authentication** → **Users**
2. Click **"Add user"**
3. Enter an email and password
4. Click **"Add user"**

5. Copy the user's UID (shown in the user list)

6. Go to **Firestore Database** → **Data**

7. Click **"+ Start collection"** and create a collection named `users`

8. Add your first document with these fields:
   - **Document ID**: Paste the user's UID
   - **Fields**:
     ```json
     {
       "name": "Your Name",
       "email": "your_email@example.com",
       "role": "admin",
       "uid": "user_uid_here",
       "createdAt": "timestamp_value"
     }
     ```

### 8. Start the Development Server

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and log in with your admin credentials.

## Database Collections Reference

### users
Stores user profiles and authentication metadata.

**Fields:**
- `uid` (string): Firebase Authentication UID
- `name` (string): Display name
- `email` (string): Email address
- `role` (string): "admin" or "member"
- `createdAt` (timestamp): Account creation date

### tasks
Stores task items with status tracking.

**Fields:**
- `title` (string): Task title
- `description` (string): Task description
- `status` (string): "To Do", "In Progress", or "Done"
- `priority` (string): "low", "medium", or "high"
- `deadline` (string): ISO date format
- `assignedTo` (string): UID of assigned user (optional)
- `createdBy` (string): UID of creator
- `createdAt` (timestamp): Creation date
- `comments` (array): Array of comment objects

### meetings
Stores scheduled meetings and events.

**Fields:**
- `title` (string): Meeting title
- `description` (string): Meeting description
- `date` (string): ISO date format
- `time` (string): HH:MM format
- `createdAt` (timestamp): Creation date
- `createdBy` (string): UID of creator

### activity
Stores activity logs for audit trail.

**Fields:**
- `message` (string): Human-readable action description
- `uid` (string): UID of acting user
- `userName` (string): Display name of acting user
- `timestamp` (timestamp): When the action occurred

## Transitioning to Production

Before deploying to production:

1. **Update Security Rules**
   - Replace test mode rules with strict security rules
   - See `src/firebase/firestore-rules.txt` for examples

2. **Enable Enhanced Security**
   - In Firebase Console → Authentication → Settings
   - Configure password requirements
   - Set up email verification

3. **Set Up Backups**
   - In Firestore Database → Backups
   - Enable automatic daily backups

4. **Monitor Usage**
   - In Firebase Console → Usage → Billing
   - Set up billing alerts if not on Blaze plan

5. **Configure Domain Restrictions**
   - In Firebase Console → Authentication → Settings
   - Add your domain to the authorized domains list

## Troubleshooting

### "Cannot find module" errors in browser console

**Solution:**
- Ensure `.env` file exists in project root
- Verify environment variables are correctly set
- Restart the development server: `npm run dev`

### "Permission denied" when loading data

**Solution:**
- Check Firestore security rules in Firebase Console
- Verify your user has the correct role in the `users` collection
- Ensure your user's UID matches what's stored in Firestore

### "User not found" on login

**Solution:**
- Verify the user exists in Firebase Authentication
- Confirm a matching user profile exists in Firestore
- Check that both UID values match exactly

### Cannot create new users (Team page shows error)

**Solution:**
- Ensure you're logged in as an admin user
- Verify your role is set to "admin" in the `users` collection
- Check that Firestore security rules allow admin user creation

### Firestore queries returning empty results

**Solution:**
- Verify data exists in Firestore Database → Data tab
- Check that queries are using the correct collection names
- Ensure indexes exist for ordered queries (Firestore will prompt to create them)

## Security Best Practices

1. **Never commit `.env` files** - Already added to `.gitignore`
2. **Use environment-specific keys** - Different Firebase projects for dev/prod
3. **Regularly rotate API keys** - In Firebase Console → Settings → Service accounts
4. **Monitor activity** - Use Firestore audit logs (Blaze plan required)
5. **Implement row-level security** - Users can only access their own data (except admins)
6. **Rate limiting** - Consider Cloud Functions for additional protection

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Firebase Pricing](https://firebase.google.com/pricing)
