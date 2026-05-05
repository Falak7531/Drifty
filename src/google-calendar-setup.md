// ==========================================
// GOOGLE CALENDAR API INTEGRATION GUIDE
// ==========================================

/*
## Setup Instructions

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Configure OAuth consent screen if prompted
4. Select "Web application" as application type
5. Add authorized origins:
   - `http://localhost:5173` (for development)
   - Your production domain
6. Add authorized redirect URIs:
   - `http://localhost:5173` (for development)
   - Your production domain
7. Copy the Client ID

### 3. Environment Variables

Add these to your `.env` file:

```
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_API_KEY=your_google_api_key_here
```

### 4. Update Firestore Security Rules

Add these rules to your Firestore security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ... existing rules ...

    // Meetings with Google Calendar integration
    match /meetings/{meetingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null &&
        request.auth.uid == resource.data.createdBy;
      allow update: if request.auth != null &&
        (request.auth.uid == resource.data.createdBy ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'Admin');
      allow delete: if request.auth != null &&
        request.auth.uid == resource.data.createdBy;
    }
  }
}
```

## Usage Examples

### Basic Google Calendar Functions

```javascript
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getUpcomingEvents
} from './googleCalendar';

// Create an event
const event = await createCalendarEvent({
  title: 'Team Meeting',
  date: '2026-05-10',
  time: '10:00',
  description: 'Weekly team sync'
});

// Update an event
await updateCalendarEvent(event.id, {
  title: 'Updated Team Meeting',
  description: 'Updated description'
});

// Delete an event
await deleteCalendarEvent(event.id);

// Get upcoming events
const events = await getUpcomingEvents(10);
```

### React Component Usage

```javascript
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

const MyComponent = () => {
  const { isAuthenticated, user, signIn, signOut } = useGoogleAuth();

  return (
    <div>
      <GoogleAuthButton />

      {isAuthenticated && (
        <div>
          <p>Connected as: {user.name}</p>
          <button onClick={() => signOut()}>Disconnect</button>
        </div>
      )}
    </div>
  );
};
```

### Meeting Creation with Calendar Sync

```javascript
import { createMeeting } from '../firestore';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';

const CreateMeetingComponent = () => {
  const { isAuthenticated } = useGoogleAuth();

  const handleCreateMeeting = async (meetingData) => {
    // This will create both Firestore document and Google Calendar event
    const meetingId = await createMeeting(meetingData, isAuthenticated);
    console.log('Meeting created:', meetingId);
  };

  return (
    <form onSubmit={handleCreateMeeting}>
      {/* Meeting form fields */}
      {isAuthenticated && (
        <label>
          <input type="checkbox" />
          Sync with Google Calendar
        </label>
      )}
      <button type="submit">Create Meeting</button>
    </form>
  );
};
```

## API Reference

### Google Calendar Functions

#### `initGoogleAPI()`
Initializes the Google API client.

#### `signInToGoogle()`
Signs the user in to Google.

#### `signOutFromGoogle()`
Signs the user out from Google.

#### `isSignedIn()`
Returns boolean indicating if user is signed in.

#### `getCurrentUser()`
Returns the current Google user object.

#### `getAccessToken()`
Returns the current access token.

#### `createCalendarEvent(eventData)`
Creates a new Google Calendar event.
- `eventData.title`: Event title
- `eventData.date`: Event date (YYYY-MM-DD)
- `eventData.time`: Event time (HH:MM)
- `eventData.description`: Event description

#### `updateCalendarEvent(eventId, eventData)`
Updates an existing Google Calendar event.

#### `deleteCalendarEvent(eventId)`
Deletes a Google Calendar event.

#### `getUpcomingEvents(maxResults)`
Gets upcoming calendar events.

### Firestore Integration

#### `createMeeting(meetingData, createGoogleEvent)`
Creates a meeting with optional Google Calendar sync.

#### `updateMeeting(meetingId, updates, updateGoogleEvent)`
Updates a meeting with optional Google Calendar sync.

#### `deleteMeeting(meetingId, deleteGoogleEvent)`
Deletes a meeting with optional Google Calendar event deletion.

## Error Handling

All functions include comprehensive error handling:

```javascript
try {
  const event = await createCalendarEvent(eventData);
  console.log('Event created:', event.htmlLink);
} catch (error) {
  console.error('Failed to create event:', error.message);
  // Handle error appropriately
}
```

## Security Considerations

1. **Access Tokens**: Never store access tokens in local storage or Firestore
2. **Scopes**: Only request necessary Google API scopes
3. **User Consent**: Always get explicit user consent for calendar access
4. **Error Handling**: Implement proper error handling for API failures

## Testing

1. Start your development server: `npm run dev`
2. Navigate to `/meetings`
3. Click "Connect Google Calendar"
4. Create a meeting with calendar sync enabled
5. Check your Google Calendar for the new event

This integration provides seamless Google Calendar synchronization for your meeting management system!
*/