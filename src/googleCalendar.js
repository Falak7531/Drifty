import { gapi } from 'gapi-script';

// Google API Configuration
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

// Initialize Google API
export const initGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          scope: SCOPES,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest']
        });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  });
};

// Check if user is signed in to Google
export const isSignedIn = () => {
  return gapi.auth2.getAuthInstance().isSignedIn.get();
};

// Sign in to Google
export const signInToGoogle = () => {
  return gapi.auth2.getAuthInstance().signIn();
};

// Sign out from Google
export const signOutFromGoogle = () => {
  return gapi.auth2.getAuthInstance().signOut();
};

// Get current user
export const getCurrentUser = () => {
  return gapi.auth2.getAuthInstance().currentUser.get();
};

// Get access token
export const getAccessToken = () => {
  return gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
};

// Create Google Calendar event
export const createCalendarEvent = async (eventData) => {
  try {
    const event = {
      summary: eventData.title,
      description: eventData.description || '',
      start: {
        dateTime: new Date(`${eventData.date}T${eventData.time}`).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: new Date(new Date(`${eventData.date}T${eventData.time}`).getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      reminders: {
        useDefault: true
      }
    };

    const response = await gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    return {
      id: response.result.id,
      htmlLink: response.result.htmlLink,
      status: 'success'
    };
  } catch (error) {
    console.error('Error creating calendar event:', error);
    const thrownError = new Error(`Failed to create calendar event: ${error.result?.error?.message || error.message}`);
    thrownError.cause = error;
    throw thrownError;
  }
};

// Update Google Calendar event
export const updateCalendarEvent = async (eventId, eventData) => {
  try {
    const event = {
      summary: eventData.title,
      description: eventData.description || '',
      start: {
        dateTime: new Date(`${eventData.date}T${eventData.time}`).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: new Date(new Date(`${eventData.date}T${eventData.time}`).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    };

    const response = await gapi.client.calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      resource: event
    });

    return {
      id: response.result.id,
      htmlLink: response.result.htmlLink,
      status: 'updated'
    };
  } catch (error) {
    console.error('Error updating calendar event:', error);
    const thrownError = new Error(`Failed to update calendar event: ${error.result?.error?.message || error.message}`);
    thrownError.cause = error;
    throw thrownError;
  }
};

// Delete Google Calendar event
export const deleteCalendarEvent = async (eventId) => {
  try {
    await gapi.client.calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId
    });
    return { status: 'deleted' };
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    const thrownError = new Error(`Failed to delete calendar event: ${error.result?.error?.message || error.message}`);
    thrownError.cause = error;
    throw thrownError;
  }
};

// Get upcoming calendar events
export const getUpcomingEvents = async (maxResults = 10) => {
  try {
    const response = await gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: maxResults,
      orderBy: 'startTime'
    });

    return response.result.items.map(event => ({
      id: event.id,
      title: event.summary,
      description: event.description,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      htmlLink: event.htmlLink
    }));
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    const thrownError = new Error(`Failed to fetch calendar events: ${error.result?.error?.message || error.message}`);
    thrownError.cause = error;
    throw thrownError;
  }
};