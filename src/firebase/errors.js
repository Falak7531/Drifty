// src/firebase/errors.js
/**
 * Firebase error handling utilities
 * Provides user-friendly error messages for common Firebase errors
 */

export function getAuthErrorMessage(error) {
  const code = error?.code;
  
  const messages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/too-many-requests': 'Too many login attempts. Please try again later.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/operation-not-allowed': 'Authentication is not enabled.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
  };

  return messages[code] || error?.message || 'An error occurred. Please try again.';
}

export function getFirestoreErrorMessage(error) {
  const code = error?.code;
  
  const messages = {
    'permission-denied': 'You do not have permission to perform this action.',
    'not-found': 'The requested document was not found.',
    'already-exists': 'This document already exists.',
    'invalid-argument': 'Invalid data provided.',
    'unavailable': 'Service is temporarily unavailable. Please try again.',
    'deadline-exceeded': 'Request took too long. Please try again.',
    'internal': 'An internal error occurred. Please try again.',
  };

  return messages[code] || error?.message || 'An error occurred. Please try again.';
}
