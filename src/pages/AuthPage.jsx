import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import useAuth from '../contexts/useAuth';

const AuthPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      console.log('User authenticated, navigating to dashboard');
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const parseError = (err) => {
    const code = err.code;
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/missing-email':
        return 'Please enter your email address.';
      default:
        return `Something went wrong: ${code}. Please try again.`;
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();
    const name = form.name.trim();

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (isSignup && !name) {
      setError('Please enter your name.');
      return;
    }

    setLoading(true);

    try {
      if (isSignup) {
        console.log('Signing up user:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user) {
          await updateProfile(user, { displayName: name });
          await setDoc(doc(db, 'users', user.uid), {
            uid: user.uid,
            name,
            email,
            role: form.role,
            createdAt: serverTimestamp(),
          });
          console.log('User saved to Firestore:', user.uid);
        }
      } else {
        console.log('Logging in user:', email);
        await signInWithEmailAndPassword(auth, email, password);
      }

      // Navigation will be handled by useEffect when currentUser is set
    } catch (err) {
      console.error('Authentication error:', err);
      console.log('Error code:', err.code);
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-gradient-to-br from-sky-600 to-indigo-700 text-white p-10 flex flex-col justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-4">{isSignup ? 'Create account' : 'Welcome back'}</h1>
              <p className="text-slate-100/90 leading-relaxed">
                {isSignup
                  ? 'Sign up with your email to join the team and access your dashboard.'
                  : 'Log in to continue managing your dashboard, tasks, meetings, and calendar.'}
              </p>
            </div>
            <div className="mt-8 text-sm text-slate-200/90">
              {isSignup ? 'Already have an account?' : 'Need a new account?'}
              <button
                type="button"
                onClick={() => setIsSignup(!isSignup)}
                className="ml-2 font-semibold text-white underline"
              >
                {isSignup ? 'Log in' : 'Sign up'}
              </button>
            </div>
          </div>

          <div className="p-10">
            <div className="mb-6 text-center">
              <p className="text-sm uppercase tracking-[0.4em] text-slate-400 font-semibold">Authentication</p>
              <h2 className="mt-4 text-3xl font-semibold text-slate-900">{isSignup ? 'Sign up' : 'Log in'}</h2>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    type="text"
                    placeholder="Your full name"
                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                  />
                </div>
              )}

              {isSignup && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type="password"
                  placeholder="Enter password"
                  className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-slate-900 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-3xl bg-slate-900 text-white py-3 text-sm font-semibold transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? 'Please wait...' : isSignup ? 'Create account' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              By continuing, you agree to our terms and conditions.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
