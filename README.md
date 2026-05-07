# Worry App

A React application built with Vite and Tailwind CSS for team project management with Firebase Firestore integration.

## Features

- **Authentication**: Email/password login with Firebase Auth
- **Dashboard**: Overview of tasks, meetings, and team activity
- **Task Management**: Create, assign, prioritize, and track tasks
- **Meetings**: Schedule and track team meetings
- **Calendar**: Visual calendar view of tasks and meetings
- **Team Management**: Admin panel to manage team members and roles
- **Activity Logging**: Audit trail of team activities
- **Responsive Design**: Mobile-friendly Tailwind CSS interface

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Create a new project**
3. Enter project name (e.g., "worry-app")
4. Choose your location and click **Create project**

#### Enable Required Services

In the Firebase Console:

1. **Enable Authentication**
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password**

2. **Create Firestore Database**
   - Go to **Firestore Database**
   - Click **Create database**
   - Start in **test mode** (for development)
   - Choose your location
   - Click **Enable**

3. **Get Your Firebase Config**
   - Go to **Project Settings** (gear icon)
   - Click **Your apps** → **Web** (or add a web app)
   - Copy your Firebase config object

#### Configure Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase credentials:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

#### Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database** → **Rules**
2. Replace the default rules with the rules from [src/firebase/firestore-rules.txt](src/firebase/firestore-rules.txt)
3. Click **Publish**

> **Note**: The rules file provides a basic security setup. Adjust as needed for your use case.

### 3. Start Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

### 4. Create Your First Admin Account

1. Go to the **Login** page
2. Since authentication isn't fully enabled in test mode, you may need to manually create a user via Firebase Console → Authentication → Add user
3. Then create a corresponding user profile in Firestore:
   - Go to **Firestore Database** → **Collections**
   - Create a new collection called `users`
   - Add a document with:
     ```json
     {
       "uid": "user_uid_from_auth",
       "name": "Your Name",
       "email": "your_email@example.com",
       "role": "admin",
       "createdAt": "2026-05-06"
     }
     ```

## Project Structure

```
worry/
├── src/
│   ├── components/
│   │   ├── auth/           # Authentication components
│   │   ├── shared/         # Layout, Sidebar, TopBar
│   │   ├── dashboard/      # Dashboard widgets
│   │   ├── tasks/          # Task components
│   │   ├── calendar/       # Calendar components
│   │   ├── meetings/       # Meeting components
│   │   └── shared/         # Shared UI components
│   ├── context/
│   │   └── AuthContext.jsx # Authentication context & hooks
│   ├── firebase/
│   │   ├── config.js       # Firebase initialization
│   │   ├── db-schema.js    # Database schema documentation
│   │   ├── errors.js       # Error handling utilities
│   │   └── firestore-rules.txt # Security rules
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Tasks.jsx
│   │   ├── Calendar.jsx
│   │   ├── Meetings.jsx
│   │   └── Team.jsx
│   ├── utils/
│   │   └── activity.js     # Activity logging helper
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Database Schema

The app uses Firestore with the following collections:

- **users**: User profiles and roles
- **tasks**: Task items with status and assignments
- **meetings**: Scheduled meetings and events
- **activity**: Audit trail of actions

See [src/firebase/db-schema.js](src/firebase/db-schema.js) for detailed schema documentation.

## Build for Production

```bash
npm run build
```

The output will be in the `dist/` directory.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase App ID |

## Troubleshooting

### "Missing Firebase environment variables"
- Ensure `.env` file exists in the project root
- Verify all environment variables are filled in
- Restart the dev server after changing `.env`

### "Permission denied" errors in Firestore
- Check Firestore security rules in Firebase Console
- Ensure your user has the `admin` role in the `users` collection

### "User not found" on login
- Verify the user exists in Firebase Authentication
- Ensure a corresponding user profile document exists in Firestore

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Tech Stack

- **Frontend**: React 19, Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore)
- **Calendar**: FullCalendar
- **Icons**: Lucide React
- **Routing**: React Router DOM
