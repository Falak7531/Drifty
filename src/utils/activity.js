// src/utils/activity.js
// Helper to log activity entries to Firestore
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

/**
 * Log an activity entry.
 * @param {object} db - Firestore instance
 * @param {string} message - Human-readable activity message
 * @param {string} uid - Acting user UID
 * @param {string} name - Acting user display name
 */
export async function logActivity(db, message, uid, name) {
  try {
    await addDoc(collection(db, 'activity'), {
      message,
      uid,
      userName: name || 'Unknown',
      timestamp: serverTimestamp(),
    });
  } catch (e) {
    // Activity logging is non-critical — silently fail
    console.warn('Activity log error:', e);
  }
}
