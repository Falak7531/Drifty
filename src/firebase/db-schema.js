// src/firebase/db-schema.js
/**
 * Firebase Firestore Database Schema Documentation
 * This file describes the data structure used throughout the Worry App
 */

/**
 * /users/{uid}
 * User profiles and authentication metadata
 * 
 * Structure:
 * {
 *   uid: string (Firebase Auth UID),
 *   name: string (Display name),
 *   email: string (Email address),
 *   role: 'admin' | 'member' (User role),
 *   createdAt: timestamp (Account creation date),
 *   avatar?: string (Avatar URL, optional)
 * }
 */
export const USERS_COLLECTION = 'users';

/**
 * /tasks/{taskId}
 * Task entries with status tracking and assignment
 * 
 * Structure:
 * {
 *   title: string (Task title),
 *   description: string (Task description),
 *   status: 'To Do' | 'In Progress' | 'Done',
 *   priority: 'low' | 'medium' | 'high',
 *   deadline?: string (ISO date string, e.g., '2026-05-15'),
 *   assignedTo?: string (UID of assigned user),
 *   createdBy: string (UID of creator),
 *   createdAt: timestamp,
 *   updatedAt?: timestamp,
 *   comments?: array of comment objects:
 *     {
 *       uid: string,
 *       name: string,
 *       text: string,
 *       createdAt: timestamp
 *     }
 * }
 */
export const TASKS_COLLECTION = 'tasks';

/**
 * /meetings/{meetingId}
 * Scheduled meetings and events
 * 
 * Structure:
 * {
 *   title: string (Meeting title),
 *   description?: string (Meeting description),
 *   date: string (ISO date string, e.g., '2026-05-15'),
 *   time: string (Time in HH:MM format, e.g., '14:30'),
 *   createdAt: timestamp,
 *   createdBy?: string (UID of creator)
 * }
 */
export const MEETINGS_COLLECTION = 'meetings';

/**
 * /activity/{activityId}
 * Activity log for audit trail and dashboard updates
 * 
 * Structure:
 * {
 *   message: string (Human-readable activity message),
 *   uid: string (UID of acting user),
 *   userName: string (Display name of acting user),
 *   timestamp: timestamp (When action occurred)
 * }
 */
export const ACTIVITY_COLLECTION = 'activity';
