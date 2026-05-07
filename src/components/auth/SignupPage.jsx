import { useState } from 'react';
import { getAuthErrorMessage } from '../../firebase/errors';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Note: Signup functionality requires additional setup
      // For now, use Firebase Console to create users
      // See FIREBASE_SETUP.md for instructions
      setError('Signup is admin-only. Ask your administrator to create your account.');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">Worry</span>
          </div>
          <p className="text-slate-400 text-sm">Team project management — built for focus.</p>
        </div>

        <div className="bg-[#18181f] border border-white/[0.07] rounded-2xl p-8 shadow-2xl shadow-black/40">
          <h2 className="text-white font-semibold text-lg mb-6">Sign up</h2>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-slate-500 rounded-lg px-4 py-2.5 transition focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-slate-500 rounded-lg px-4 py-2.5 transition focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.05] border border-white/[0.1] text-white placeholder:text-slate-500 rounded-lg px-4 py-2.5 transition focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition mt-6"
            >
              {loading ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

          <p className="text-slate-400 text-center text-sm mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-violet-400 hover:text-violet-300 transition">
              Sign in
            </a>
          </p>
        </div>

        <p className="text-slate-500 text-xs text-center mt-6">
          Contact your administrator to create an account
        </p>
      </div>
    </div>
  );
}
