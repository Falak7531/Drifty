# Firebase Architecture Diagram

## Application Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Worry App Frontend                          │
│                      (React + Tailwind)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
         ┌────────────────────────────────────────────┐
         │         React Router (App.jsx)             │
         │    ┌──────────────────────────────────┐    │
         │    │  Protected Routes                │    │
         │    │  - Dashboard                     │    │
         │    │  - Tasks                         │    │
         │    │  - Calendar                      │    │
         │    │  - Meetings                      │    │
         │    │  - Team (admin only)             │    │
         │    └──────────────────────────────────┘    │
         └────────────────────────────────────────────┘
                              │
                              ↓
         ┌────────────────────────────────────────────┐
         │        AuthContext (Context API)           │
         │    ┌──────────────────────────────────┐    │
         │    │ - currentUser (Firebase Auth)   │    │
         │    │ - userProfile (Firestore)       │    │
         │    │ - isAdmin (role checking)       │    │
         │    │ - login/logout functions        │    │
         │    └──────────────────────────────────┘    │
         └────────────────────────────────────────────┘
                              │
                              ↓
         ┌────────────────────────────────────────────┐
         │         Firebase Config                    │
         │    (src/firebase/config.js)                │
         │    ┌──────────────────────────────────┐    │
         │    │ - initializeApp()                │    │
         │    │ - getAuth()                      │    │
         │    │ - getFirestore()                 │    │
         │    └──────────────────────────────────┘    │
         └────────────────────────────────────────────┘
                     │                  │
                     ↓                  ↓
        ┌────────────────────┐  ┌──────────────────┐
        │  Firebase Auth     │  │  Firestore DB    │
        │                    │  │                  │
        │ - Email/Password   │  │ Collections:     │
        │ - User Sessions    │  │ - users          │
        │ - UID Generation   │  │ - tasks          │
        │                    │  │ - meetings       │
        │                    │  │ - activity       │
        └────────────────────┘  └──────────────────┘
```

## Data Flow

```
┌──────────────────┐
│   User Logs In   │
└────────┬─────────┘
         │
         ↓
┌──────────────────────────────┐
│ LoginPage.jsx                │
│ - Email/Password input       │
│ - validateCredentials()      │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ AuthContext.login()          │
│ - signInWithEmailAndPassword │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Firebase Auth                │
│ - Validates credentials      │
│ - Returns user + UID         │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ onAuthStateChanged           │
│ - Detects auth state change  │
│ - Triggers profile fetch     │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ fetchProfile(uid)            │
│ - Query: db.users[uid]       │
│ - Get user profile data      │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ AuthContext Updated          │
│ - currentUser = Firebase User│
│ - userProfile = Firestore Doc│
│ - isAdmin = role === admin   │
└────────┬─────────────────────┘
         │
         ↓
┌──────────────────────────────┐
│ Dashboard Rendered           │
│ - Shows user data            │
│ - Loads real-time updates    │
└──────────────────────────────┘
```

## Firestore Data Model

```
┌─────────────────────────────────────────────────────────┐
│                    Firestore Database                    │
└─────────────────────────────────────────────────────────┘

┌──────────────────────────────┐
│ Collection: users            │
│                              │
│ Documents:                   │
│ ├─ [uid1]                   │
│ │  ├─ uid: string           │
│ │  ├─ name: string          │
│ │  ├─ email: string         │
│ │  ├─ role: "admin"|"member"│
│ │  └─ createdAt: timestamp  │
│ │                            │
│ └─ [uid2]                   │
│    └─ (same structure)      │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Collection: tasks            │
│                              │
│ Documents:                   │
│ ├─ [taskId1]                │
│ │  ├─ title: string         │
│ │  ├─ status: string        │
│ │  ├─ priority: string      │
│ │  ├─ deadline: date        │
│ │  ├─ assignedTo: uid|null  │
│ │  ├─ comments: array       │
│ │  └─ createdAt: timestamp  │
│ │                            │
│ └─ [taskId2]                │
│    └─ (same structure)      │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Collection: meetings         │
│                              │
│ Documents:                   │
│ ├─ [meetingId1]             │
│ │  ├─ title: string         │
│ │  ├─ date: string          │
│ │  ├─ time: string          │
│ │  ├─ description: string   │
│ │  └─ createdAt: timestamp  │
│ │                            │
│ └─ [meetingId2]             │
│    └─ (same structure)      │
└──────────────────────────────┘

┌──────────────────────────────┐
│ Collection: activity         │
│                              │
│ Documents:                   │
│ ├─ [actId1]                 │
│ │  ├─ message: string       │
│ │  ├─ uid: string           │
│ │  ├─ userName: string      │
│ │  └─ timestamp: timestamp  │
│ │                            │
│ └─ [actId2]                 │
│    └─ (same structure)      │
└──────────────────────────────┘
```

## Real-time Data Sync

```
┌─────────────────────────────────┐
│ Page Component (e.g., Tasks)    │
└────────────────┬────────────────┘
                 │
                 ↓
    ┌────────────────────────────┐
    │ useEffect(() => {          │
    │   const q = query(         │
    │     collection(db, 'tasks'),
    │     orderBy('createdAt')   │
    │   );                       │
    │                            │
    │   const unsub = onSnapshot │
    │     (q, (snapshot) => {    │
    │       setTasks([...]);     │
    │     });                    │
    │                            │
    │   return unsub; // cleanup │
    │ }, []);                    │
    └────────────────┬───────────┘
                     │
                     ↓
        ┌────────────────────────┐
        │ onSnapshot Listener    │
        │ - Active & real-time   │
        │ - Updates on changes   │
        │ - Auto re-renders      │
        └────────────────┬───────┘
                         │
                    Firestore
                    (always synced)
```

## Security Rules Flow

```
User Request
    │
    ↓
┌──────────────────────────────────┐
│ Firestore Security Rule Check    │
│                                  │
│ match /users/{userId} {          │
│   allow read: if                 │
│     request.auth.uid == userId   │
│     || isAdmin()                 │
│ }                                │
└────────────┬──────────────────────┘
             │
    ┌────────┴────────┐
    ↓                 ↓
 ALLOWED           DENIED
 (Return data)   (Permission Error)
```

## Feature Components Map

```
┌─────────────────────────────────────────────┐
│         Worry App Features                  │
└────────────┬────────────────────────────────┘
             │
   ┌─────────┼─────────────────────┐
   ↓         ↓                     ↓
┌──────────┐ ┌───────────────┐ ┌──────────┐
│ Auth     │ │ Data Management
│ System   │ │ System         │ │ Team     │
│          │ │                │ │ System   │
├──────────┤ ├────────────────┤ ├──────────┤
│ Login    │ │ Tasks          │ │ Create   │
│ Logout   │ │ - Create       │ │ Users    │
│ Auth     │ │ - Update       │ │ Manage   │
│ Context  │ │ - Delete       │ │ Roles    │
│ Protected│ │ - Assign       │ │ View     │
│ Routes   │ │ - Comment      │ │ Members  │
│          │ │                │ │          │
│          │ │ Meetings       │ │          │
│          │ │ - Schedule     │ │          │
│          │ │ - View         │ │          │
│          │ │ - Delete       │ │          │
│          │ │                │ │          │
│          │ │ Activity Log   │ │          │
│          │ │ - Track events │ │          │
│          │ │ - Audit trail  │ │          │
└──────────┘ └────────────────┘ └──────────┘
     │              │                 │
     └──────────────┼─────────────────┘
                    │
                    ↓
         ┌──────────────────────┐
         │  Firebase Backend    │
         │  ├─ Authentication   │
         │  ├─ Firestore        │
         │  └─ Real-time Sync   │
         └──────────────────────┘
```

## Security Rules Hierarchy

```
┌────────────────────────────────────────────┐
│ Firestore Security Rules                   │
└────────────────────────────────────────────┘
         │
         ├─ /users/{uid}
         │  ├─ read: if auth.uid == uid OR isAdmin()
         │  ├─ create: if auth.uid == uid
         │  └─ update/delete: if auth.uid == uid OR isAdmin()
         │
         ├─ /tasks/{taskId}
         │  ├─ read: if auth != null
         │  └─ write: if auth != null
         │
         ├─ /meetings/{meetingId}
         │  ├─ read: if auth != null
         │  └─ write: if auth != null
         │
         └─ /activity/{actId}
            ├─ read: if auth != null
            └─ write: if isAdmin()
```

---

## Legend

```
┌──────┐
│ Box  │  = Component/Service/Collection
└──────┘

  ↓     = Data flow / Communication

  |     = Connection / Relationship

[text] = Document ID or Dynamic value
```

---

For more details, see:
- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Step-by-step setup
- [FIREBASE_QUICK_REFERENCE.md](./FIREBASE_QUICK_REFERENCE.md) - Code examples
- [src/firebase/db-schema.js](./src/firebase/db-schema.js) - Data structure
