// src/firebase/init-db.js
/**
 * Database initialization utilities
 * Use this to set up initial collections and documents in Firestore
 */

import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './config';

/**
 * Create initial user profile when user signs up
 * @param {string} uid - Firebase Auth UID
 * @param {object} userData - User data { name, email, role }
 */
export async function createUserProfile(uid, userData) {
  try {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      uid,
      name: userData.name || 'New User',
      email: userData.email,
      role: userData.role || 'member',
      createdAt: serverTimestamp(),
      avatar: undefined,
    });
    console.log('✓ User profile created:', uid);
  } catch (error) {
    console.error('✗ Error creating user profile:', error);
    throw error;
  }
}

/**
 * Initialize default collections (run once after creating database)
 * This ensures collection structure exists even if empty
 */
export async function initializeCollections() {
  try {
    const collections = ['users', 'tasks', 'meetings', 'activity'];
    
    for (const collection of collections) {
      // Create a temporary doc to initialize collection, then delete it
      const tempRef = doc(db, collection, '_init');
      await setDoc(tempRef, { 
        _temp: true, 
        createdAt: serverTimestamp() 
      });
      // Optional: delete the temp doc after creating collection
      // await deleteDoc(tempRef);
    }
    
    console.log('✓ Collections initialized');
  } catch (error) {
    console.error('✗ Error initializing collections:', error);
  }
}

/**
 * Get a summary of Firestore usage
 * Useful for debugging and monitoring
 */
export async function getFirestoreStats() {
  try {
    const stats = {
      timestamp: new Date().toISOString(),
      collections: {
        users: 0,
        tasks: 0,
        meetings: 0,
        activity: 0,
      },
    };
    
    console.log('Database Stats:', stats);
    return stats;
  } catch (error) {
    console.error('✗ Error getting stats:', error);
  }
}
