import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from './googleCalendar';

// ==========================================
// USERS COLLECTION FUNCTIONS
// ==========================================

/**
 * Add a new user to the users collection
 * @param {Object} userData - User data object
 * @param {string} userData.name - User's full name
 * @param {string} userData.email - User's email address
 * @param {string} userData.role - User's role (Admin, Team Member, etc.)
 * @param {string} userData.uid - Firebase Auth UID
 * @returns {Promise<string>} - Document ID of the created user
 */
export const addUser = async (userData) => {
  try {
    const userDoc = {
      name: userData.name,
      email: userData.email,
      role: userData.role || 'Team Member',
      uid: userData.uid,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'users'), userDoc);
    return docRef.id;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

/**
 * Get user by UID
 * @param {string} uid - Firebase Auth UID
 * @returns {Promise<Object|null>} - User data or null if not found
 */
export const getUserByUid = async (uid) => {
  try {
    const q = query(collection(db, 'users'), where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting user by UID:', error);
    throw error;
  }
};

/**
 * Get all users
 * @returns {Promise<Array>} - Array of user objects
 */
export const getAllUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

/**
 * Update user role
 * @param {string} userId - User document ID
 * @param {string} newRole - New role to assign
 * @returns {Promise<void>}
 */
export const updateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

// ==========================================
// TASKS COLLECTION FUNCTIONS
// ==========================================

/**
 * Create a new task
 * @param {Object} taskData - Task data object
 * @param {string} taskData.title - Task title
 * @param {string} taskData.description - Task description
 * @param {string} taskData.assignedTo - UID of assigned user
 * @param {string} taskData.assignedToName - Name of assigned user
 * @param {Date|string} taskData.deadline - Task deadline
 * @param {string} taskData.status - Task status (To Do, In Progress, Done)
 * @param {string} taskData.priority - Task priority (Low, Medium, High)
 * @param {string} taskData.shopifyLink - Optional Shopify link
 * @param {string} taskData.createdBy - UID of creator
 * @returns {Promise<string>} - Document ID of the created task
 */
export const createTask = async (taskData) => {
  try {
    const taskDoc = {
      title: taskData.title,
      description: taskData.description || '',
      assignedTo: taskData.assignedTo,
      assignedToName: taskData.assignedToName,
      deadline: taskData.deadline instanceof Date ? Timestamp.fromDate(taskData.deadline) : Timestamp.fromDate(new Date(taskData.deadline)),
      status: taskData.status || 'To Do',
      priority: taskData.priority || 'Medium',
      shopifyLink: taskData.shopifyLink || '',
      createdBy: taskData.createdBy,
      createdAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'tasks'), taskDoc);
    return docRef.id;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Fetch all tasks
 * @returns {Promise<Array>} - Array of task objects
 */
export const fetchTasks = async () => {
  try {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      deadline: doc.data().deadline?.toDate?.() || doc.data().deadline,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Fetch tasks assigned to a specific user
 * @param {string} userId - UID of the user
 * @returns {Promise<Array>} - Array of task objects
 */
export const fetchTasksByUser = async (userId) => {
  try {
    const q = query(
      collection(db, 'tasks'),
      where('assignedTo', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      deadline: doc.data().deadline?.toDate?.() || doc.data().deadline,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
  } catch (error) {
    console.error('Error fetching tasks by user:', error);
    throw error;
  }
};

/**
 * Update task status
 * @param {string} taskId - Task document ID
 * @param {string} newStatus - New status
 * @returns {Promise<void>}
 */
export const updateTaskStatus = async (taskId, newStatus) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status: newStatus
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
};

/**
 * Update task details
 * @param {string} taskId - Task document ID
 * @param {Object} updates - Object with fields to update
 * @returns {Promise<void>}
 */
export const updateTask = async (taskId, updates) => {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const updateData = { ...updates };

    // Convert deadline to Firestore timestamp if it's a Date
    if (updates.deadline && updates.deadline instanceof Date) {
      updateData.deadline = Timestamp.fromDate(updates.deadline);
    }

    await updateDoc(taskRef, updateData);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string} taskId - Task document ID
 * @returns {Promise<void>}
 */
export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

// ==========================================
// MEETINGS COLLECTION FUNCTIONS
// ==========================================

/**
 * Create a new meeting
 * @param {Object} meetingData - Meeting data object
 * @param {string} meetingData.title - Meeting title
 * @param {Date|string} meetingData.date - Meeting date
 * @param {string} meetingData.time - Meeting time
 * @param {string} meetingData.description - Meeting description
 * @param {string} meetingData.createdBy - UID of creator
 * @param {boolean} createGoogleEvent - Whether to create Google Calendar event (default: false)
 * @returns {Promise<string>} - Document ID of the created meeting
 */
export const createMeeting = async (meetingData, createGoogleEvent = false) => {
  try {
    const meetingDoc = {
      title: meetingData.title,
      date: meetingData.date instanceof Date ? Timestamp.fromDate(meetingData.date) : Timestamp.fromDate(new Date(meetingData.date)),
      time: meetingData.time,
      description: meetingData.description || '',
      createdBy: meetingData.createdBy,
      createdAt: Timestamp.now(),
      googleCalendarEventId: null // Will be updated if Google Calendar event is created
    };

    // Create the meeting document first
    const docRef = await addDoc(collection(db, 'meetings'), meetingDoc);
    const meetingId = docRef.id;

    // Create Google Calendar event if requested
    if (createGoogleEvent) {
      try {
        const calendarEvent = await createCalendarEvent({
          title: meetingData.title,
          date: meetingData.date instanceof Date ? meetingData.date.toISOString().split('T')[0] : meetingData.date,
          time: meetingData.time,
          description: meetingData.description || ''
        });

        // Update the meeting document with Google Calendar event ID
        await updateDoc(doc(db, 'meetings', meetingId), {
          googleCalendarEventId: calendarEvent.id
        });

        console.log('Google Calendar event created:', calendarEvent.htmlLink);
      } catch (calendarError) {
        console.warn('Failed to create Google Calendar event, but meeting was created:', calendarError);
        // Don't throw error here - meeting is still created successfully
      }
    }

    return meetingId;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
};

/**
 * Fetch all meetings
 * @returns {Promise<Array>} - Array of meeting objects
 */
export const fetchMeetings = async () => {
  try {
    const q = query(collection(db, 'meetings'), orderBy('date', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
  } catch (error) {
    console.error('Error fetching meetings:', error);
    throw error;
  }
};

/**
 * Fetch upcoming meetings (next 30 days)
 * @returns {Promise<Array>} - Array of upcoming meeting objects
 */
export const fetchUpcomingMeetings = async () => {
  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const q = query(
      collection(db, 'meetings'),
      where('date', '>=', Timestamp.fromDate(now)),
      where('date', '<=', Timestamp.fromDate(thirtyDaysFromNow)),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt
    }));
  } catch (error) {
    console.error('Error fetching upcoming meetings:', error);
    throw error;
  }
};

/**
 * Update meeting details
 * @param {string} meetingId - Meeting document ID
 * @param {Object} updates - Object with fields to update
 * @param {boolean} updateGoogleEvent - Whether to update Google Calendar event (default: false)
 * @returns {Promise<void>}
 */
export const updateMeeting = async (meetingId, updates, updateGoogleEvent = false) => {
  try {
    const updateData = { ...updates };

    // Convert date to Firestore timestamp if it's a Date
    if (updates.date && updates.date instanceof Date) {
      updateData.date = Timestamp.fromDate(updates.date);
    }

    // Update Firestore document
    await updateDoc(doc(db, 'meetings', meetingId), updateData);

    // Update Google Calendar event if requested and event ID exists
    if (updateGoogleEvent) {
      try {
        const meetingDoc = await getDoc(doc(db, 'meetings', meetingId));
        const meetingData = meetingDoc.data();

        if (meetingData?.googleCalendarEventId) {
          await updateCalendarEvent(meetingData.googleCalendarEventId, {
            title: updates.title || meetingData.title,
            date: updates.date ? (updates.date instanceof Date ? updates.date.toISOString().split('T')[0] : updates.date) : meetingData.date.toDate().toISOString().split('T')[0],
            time: updates.time || meetingData.time,
            description: updates.description !== undefined ? updates.description : meetingData.description
          });
        }
      } catch (calendarError) {
        console.warn('Failed to update Google Calendar event:', calendarError);
        // Don't throw error here - meeting update is still successful
      }
    }
  } catch (error) {
    console.error('Error updating meeting:', error);
    throw error;
  }
};

/**
 * Delete a meeting
 * @param {string} meetingId - Meeting document ID
 * @param {boolean} deleteGoogleEvent - Whether to delete Google Calendar event (default: false)
 * @returns {Promise<void>}
 */
export const deleteMeeting = async (meetingId, deleteGoogleEvent = false) => {
  try {
    // Get meeting data first to check for Google Calendar event ID
    if (deleteGoogleEvent) {
      try {
        const meetingDoc = await getDoc(doc(db, 'meetings', meetingId));
        const meetingData = meetingDoc.data();

        if (meetingData?.googleCalendarEventId) {
          await deleteCalendarEvent(meetingData.googleCalendarEventId);
        }
      } catch (calendarError) {
        console.warn('Failed to delete Google Calendar event:', calendarError);
        // Continue with Firestore deletion even if calendar deletion fails
      }
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'meetings', meetingId));
  } catch (error) {
    console.error('Error deleting meeting:', error);
    throw error;
  }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get document by ID from any collection
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID
 * @returns {Promise<Object|null>} - Document data or null if not found
 */
export const getDocumentById = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
};

/**
 * Get all documents from a collection
 * @param {string} collectionName - Name of the collection
 * @param {Array} orderByField - Optional: [fieldName, direction] for ordering
 * @returns {Promise<Array>} - Array of documents
 */
export const getAllDocuments = async (collectionName, orderByField = null) => {
  try {
    let q;
    if (orderByField) {
      q = query(collection(db, collectionName), orderBy(orderByField[0], orderByField[1] || 'asc'));
    } else {
      q = collection(db, collectionName);
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all documents:', error);
    throw error;
  }
};