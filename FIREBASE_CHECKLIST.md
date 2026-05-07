# Firebase Setup Checklist

Use this checklist to verify your Firebase setup is complete and working correctly.

## ✅ Pre-Setup

- [ ] Google account created
- [ ] Node.js and npm installed (`node --version` and `npm --version`)
- [ ] Project cloned locally
- [ ] Terminal open in project root

## ✅ Firebase Console Setup

### Project Creation
- [ ] Firebase project created at console.firebase.google.com
- [ ] Project name decided (e.g., "worry-app")
- [ ] Region/location selected

### Authentication
- [ ] Authentication enabled in Firebase Console
- [ ] Email/Password sign-in method enabled
- [ ] At least one test user created in Authentication → Users

### Firestore Database
- [ ] Firestore Database created
- [ ] Database location selected
- [ ] Started in Test Mode (for development)
- [ ] Collections visible in Firestore Database → Data tab

### Firebase Config
- [ ] Web app registered in Firebase Console
- [ ] Firebase config object copied (from Project Settings → Your apps → Web)

## ✅ Local Setup

### Environment Variables
- [ ] `.env` file created (`cp .env.example .env`)
- [ ] All six Firebase config values filled in `.env`:
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
- [ ] `.env` file is in `.gitignore` (already configured)

### Project Dependencies
- [ ] `npm install` completed successfully
- [ ] No dependency errors reported

## ✅ Firestore Setup

### Security Rules
- [ ] Firestore security rules copied from `src/firebase/firestore-rules.txt`
- [ ] Rules pasted into Firebase Console → Firestore Database → Rules tab
- [ ] Rules published successfully
- [ ] No rule validation errors

### Database Collections
- [ ] `users` collection created in Firestore
- [ ] Initial admin user document created in `users` collection with:
  - [ ] Document ID = Firebase Auth UID
  - [ ] Field: `uid` (string)
  - [ ] Field: `name` (string)
  - [ ] Field: `email` (string)
  - [ ] Field: `role` (string, value: "admin")
  - [ ] Field: `createdAt` (timestamp)

## ✅ Application Testing

### Development Server
- [ ] `npm run dev` started successfully
- [ ] Dev server running at `http://localhost:5173`
- [ ] No console errors about missing environment variables

### Login Flow
- [ ] Login page loads without errors
- [ ] Can enter email/password
- [ ] Login button is clickable
- [ ] With correct admin credentials, login succeeds
- [ ] After login, redirected to dashboard

### Dashboard
- [ ] Dashboard page loads after login
- [ ] "Welcome" or stats display correctly
- [ ] No Firestore permission errors in browser console
- [ ] Data loads from Firestore (tasks, meetings visible if any exist)

### Pages
- [ ] Can navigate between pages (Tasks, Calendar, Meetings)
- [ ] Pages load without errors
- [ ] Firestore data displays correctly

### Admin Features
- [ ] Can access Team page (admin only)
- [ ] Can create new team member
- [ ] New user appears in team list
- [ ] New user can log in

### Logout
- [ ] Logout button works
- [ ] Redirected back to login page
- [ ] Cannot access dashboard without login

## ✅ Production Readiness (Optional)

- [ ] `.env` values are production Firebase credentials
- [ ] Security rules reviewed and hardened
- [ ] No sensitive data in code or version control
- [ ] Error handling working for all error scenarios
- [ ] Console warnings resolved
- [ ] Tested on multiple browsers
- [ ] Mobile responsive design verified
- [ ] Build succeeds: `npm run build`

## ✅ Troubleshooting Items

### If login fails:
- [ ] Email exists in Firebase Authentication
- [ ] User profile exists in Firestore `users` collection
- [ ] User UID matches between Auth and Firestore
- [ ] Security rules allow user read access

### If data doesn't load:
- [ ] Collections exist in Firestore Database
- [ ] Data exists in collections
- [ ] Security rules allow authenticated users to read
- [ ] Browser console shows no errors

### If environment variables not found:
- [ ] `.env` file exists in project root
- [ ] All variables are filled in
- [ ] Dev server restarted after creating `.env`

### If Firestore permission denied:
- [ ] User role is set to "admin" in `users` collection
- [ ] Security rules are published correctly
- [ ] Browser cache cleared if recently changed rules

## ✅ Quick Reference

**Important Files:**
- Environment config: `.env` (create from `.env.example`)
- Firebase initialization: `src/firebase/config.js`
- Database schema: `src/firebase/db-schema.js`
- Security rules: `src/firebase/firestore-rules.txt`
- Error handling: `src/firebase/errors.js`
- Setup guide: `FIREBASE_SETUP.md`

**Common Commands:**
```bash
npm install              # Install dependencies
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run ESLint
```

**Useful URLs:**
- Firebase Console: https://console.firebase.google.com
- Development Server: http://localhost:5173
- Documentation: See README.md and FIREBASE_SETUP.md

## Next Steps

1. Complete all checklist items above
2. Verify application functionality as outlined
3. Review [FIREBASE_SETUP.md](FIREBASE_SETUP.md) for detailed instructions
4. Check [README.md](README.md) for project structure and features
5. Refer to [src/firebase/db-schema.js](src/firebase/db-schema.js) for data structure

Once all items are checked, your Firebase setup is complete! 🎉
