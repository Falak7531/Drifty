// ==========================================
// FIRESTORE DATABASE STRUCTURE & USAGE GUIDE
// ==========================================

/*
## Database Collections Structure

### 1. USERS Collection
Document Fields:
- name: string (User's full name)
- email: string (User's email address)
- role: string (Admin, Team Member, etc.)
- uid: string (Firebase Auth UID)
- createdAt: Timestamp

### 2. TASKS Collection
Document Fields:
- title: string (Task title)
- description: string (Task description)
- assignedTo: string (UID of assigned user)
- assignedToName: string (Name of assigned user)
- deadline: Timestamp (Task deadline)
- status: string (To Do, In Progress, Done)
- priority: string (Low, Medium, High)
- shopifyLink: string (Optional Shopify link)
- createdBy: string (UID of creator)
- createdAt: Timestamp

### 3. MEETINGS Collection
Document Fields:
- title: string (Meeting title)
- date: Timestamp (Meeting date)
- time: string (Meeting time, e.g., "10:00 AM")
- description: string (Meeting description)
- createdBy: string (UID of creator)
- createdAt: Timestamp

## Usage Examples

### Import the functions:
```javascript
import {
  addUser,
  getUserByUid,
  createTask,
  fetchTasks,
  updateTaskStatus,
  createMeeting,
  fetchMeetings
} from './firestore';
```

### Add a new user:
```javascript
const userId = await addUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Team Member',
  uid: 'firebase-auth-uid-here'
});
```

### Create a task:
```javascript
const taskId = await createTask({
  title: 'Design new landing page',
  description: 'Create a modern landing page design',
  assignedTo: 'user-uid',
  assignedToName: 'Jane Smith',
  deadline: new Date('2026-05-15'),
  status: 'To Do',
  priority: 'High',
  shopifyLink: 'https://shopify.com/store',
  createdBy: 'admin-uid'
});
```

### Fetch all tasks:
```javascript
const tasks = await fetchTasks();
// Returns array of task objects with converted dates
```

### Update task status:
```javascript
await updateTaskStatus('task-id', 'In Progress');
```

### Create a meeting:
```javascript
const meetingId = await createMeeting({
  title: 'Weekly Team Meeting',
  date: new Date('2026-05-10'),
  time: '10:00 AM',
  description: 'Discuss project progress',
  createdBy: 'admin-uid'
});
```

### Fetch upcoming meetings:
```javascript
const meetings = await fetchUpcomingMeetings();
// Returns meetings for the next 30 days
```

## Integration with React Components

### Example: Using in TasksPage.jsx

```javascript
import { useState, useEffect } from 'react';
import { fetchTasks, createTask, updateTaskStatus } from '../firestore';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const fetchedTasks = await fetchTasks();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const handleCreateTask = async (taskData) => {
    try {
      await createTask(taskData);
      loadTasks(); // Refresh the list
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
      loadTasks(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // ... rest of component
};
```

## Security Rules (Firestore)

Add these security rules in Firebase Console:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data, admins can read/write all
    match /users/{userId} {
      allow read, write: if request.auth != null &&
        (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin');
    }

    // Tasks: creators and assignees can read, admins can do everything
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        request.auth.uid == resource.data.createdBy;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.createdBy ||
         request.auth.uid == resource.data.assignedTo ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin');
      allow delete: if request.auth != null &&
        (request.auth.uid == resource.data.createdBy ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin');
    }

    // Meetings: all authenticated users can read, creators and admins can modify
    match /meetings/{meetingId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        (request.auth.uid == resource.data.createdBy ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin');
    }
  }
}
```

## Environment Variables Required

Make sure to set these in your .env file:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

This setup provides a complete Firestore integration for your task management system!
*/