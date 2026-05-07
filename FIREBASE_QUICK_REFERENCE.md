# Firebase Quick Reference

## 30-Second Setup Summary

1. **Create Firebase Project**: https://console.firebase.google.com → Create Project
2. **Enable Services**:
   - Authentication → Email/Password
   - Firestore Database → Create
3. **Get Credentials**: Project Settings → Your Apps → Copy config
4. **Add to `.env`**: Copy `.env.example` to `.env`, fill in values
5. **Run App**: `npm install && npm run dev`
6. **Add Admin User**: Firebase Console → Create user, then add to Firestore `users` collection
7. **Set Rules**: Copy `src/firebase/firestore-rules.txt` to Firebase Console rules

## Environment Variables

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Get from: Firebase Console → Project Settings → Your Apps → Web app

## Database Schema

| Collection | Purpose | Key Fields |
|-----------|---------|-----------|
| `users` | User profiles | `uid`, `name`, `email`, `role`, `createdAt` |
| `tasks` | Task management | `title`, `status`, `priority`, `deadline`, `assignedTo` |
| `meetings` | Scheduled meetings | `title`, `date`, `time`, `description` |
| `activity` | Audit log | `message`, `uid`, `userName`, `timestamp` |

## Common Code Patterns

### Import Firebase
```javascript
import { db, auth } from '../firebase/config';
```

### Listen to Collection
```javascript
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

useEffect(() => {
  const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
  const unsub = onSnapshot(q, snap => {
    setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
  return unsub;
}, []);
```

### Add Document
```javascript
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const ref = await addDoc(collection(db, 'tasks'), {
  title: 'New Task',
  createdAt: serverTimestamp(),
});
```

### Update Document
```javascript
import { updateDoc, doc } from 'firebase/firestore';

await updateDoc(doc(db, 'tasks', taskId), {
  status: 'Done'
});
```

### Delete Document
```javascript
import { deleteDoc, doc } from 'firebase/firestore';

await deleteDoc(doc(db, 'tasks', taskId));
```

### Use Auth Context
```javascript
import { useAuth } from '../context/AuthContext';

const { currentUser, userProfile, isAdmin, login, logout } = useAuth();
```

### Error Handling
```javascript
import { getAuthErrorMessage } from '../firebase/errors';

try {
  // Firebase operation
} catch (err) {
  const message = getAuthErrorMessage(err);
  setError(message);
}
```

## Useful Links

| Resource | URL |
|----------|-----|
| Firebase Console | https://console.firebase.google.com |
| Firebase Docs | https://firebase.google.com/docs |
| Firestore Security | https://firebase.google.com/docs/firestore/security/start |
| React Router | https://reactrouter.com |
| Tailwind CSS | https://tailwindcss.com |

## Common Issues

| Issue | Solution |
|-------|----------|
| Environment variables not loading | Restart dev server after creating `.env` |
| "Permission denied" errors | Check Firestore security rules and user role |
| User not found | Create user in Auth AND add profile to Firestore |
| Blank dashboard | Check browser console for errors, verify collections exist |
| Cannot create tasks | Verify user is authenticated and has write permission |

## File Locations

```
src/firebase/
├── config.js           ← Main Firebase setup
├── errors.js           ← Error handling utilities
├── db-schema.js        ← Database structure docs
├── firestore-rules.txt ← Security rules
└── init-db.js          ← Database helpers
```

## Command Reference

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run ESLint
```

## Environment Setup Checklist

- [ ] `.env` file created from `.env.example`
- [ ] All 6 Firebase config values filled in
- [ ] Firebase project created at console.firebase.google.com
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database created
- [ ] Admin user created
- [ ] Security rules copied from `src/firebase/firestore-rules.txt`
- [ ] Dev server started (`npm run dev`)
- [ ] Login works with admin credentials

For detailed setup instructions, see [FIREBASE_SETUP.md](FIREBASE_SETUP.md)
