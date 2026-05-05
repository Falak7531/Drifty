import { useEffect, useState } from 'react';
import {
  initGoogleAPI,
  signInToGoogle,
  signOutFromGoogle,
  getCurrentUser,
  getAccessToken
} from '../googleCalendar';
import { GoogleAuthContext } from './GoogleAuthContextObject';

export const GoogleAuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const updateSigninStatus = (isSignedIn) => {
    setIsAuthenticated(isSignedIn);
    if (isSignedIn) {
      const currentUser = getCurrentUser();
      const profile = currentUser.getBasicProfile();
      setUser({
        id: profile.getId(),
        name: profile.getName(),
        email: profile.getEmail(),
        imageUrl: profile.getImageUrl(),
        accessToken: getAccessToken()
      });
      setError(null);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    const initializeGoogleAuth = async () => {
      try {
        await initGoogleAPI();

        // Listen for auth state changes
        const authInstance = window.gapi.auth2.getAuthInstance();
        authInstance.isSignedIn.listen(updateSigninStatus);

        // Handle initial sign-in state
        updateSigninStatus(authInstance.isSignedIn.get());
        setLoading(false);
      } catch (err) {
        console.error('Error initializing Google Auth:', err);
        setError('Failed to initialize Google authentication');
        setLoading(false);
      }
    };

    initializeGoogleAuth();
  }, []);

  const signIn = async () => {
    try {
      setError(null);
      await signInToGoogle();
    } catch (err) {
      console.error('Error signing in to Google:', err);
      setError('Failed to sign in to Google');
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await signOutFromGoogle();
    } catch (err) {
      console.error('Error signing out from Google:', err);
      setError('Failed to sign out from Google');
      throw err;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    signIn,
    signOut,
    getAccessToken: () => user?.accessToken
  };

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  );
};