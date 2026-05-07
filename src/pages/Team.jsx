// src/pages/Team.jsx
// Admin-only page to manage team members (create accounts, view team)
import { useEffect, useState } from 'react';
import { collection, onSnapshot, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import { getAuthErrorMessage, getFirestoreErrorMessage } from '../firebase/errors';
import { useAuth } from '../context/AuthContext';
import { logActivity } from '../utils/activity';

const ROLE_COLORS = {
  admin: 'bg-violet-500/15 text-violet-400',
  member: 'bg-blue-500/15 text-blue-400',
};

export default function Team() {
  const { currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || form.password.length < 6) {
      setError('Please fill all fields. Password must be at least 6 characters.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // Create Firebase Auth user
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      // Save profile in Firestore
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: form.name,
        email: form.email,
        uid: cred.user.uid,
        role: form.role,
        createdAt: serverTimestamp(),
      });
      await logActivity(db, `${form.name} was added to the team`, currentUser.uid, userProfile?.name);
      setForm({ name: '', email: '', password: '', role: 'member' });
      setShowForm(false);
    } catch (err) {
      setError(getAuthErrorMessage(err) || getFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Team</h2>
          <p className="text-slate-400 text-sm mt-0.5">{users.length} members</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {users.map(u => {
          const initials = u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
          return (
            <div key={u.id} className="bg-[#18181f] border border-white/[0.06] rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{u.name}</p>
                <p className="text-slate-500 text-xs truncate">{u.email}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize shrink-0 ${ROLE_COLORS[u.role] || 'bg-slate-500/15 text-slate-400'}`}>
                {u.role}
              </span>
            </div>
          );
        })}
      </div>

      {/* Add member modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181f] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-5">Add Team Member</h3>
            {error && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{error}</div>
            )}
            <div className="space-y-3">
              <input placeholder="Full name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input" />
              <input type="email" placeholder="Email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="input" />
              <input type="password" placeholder="Temporary password (min 6 chars) *" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="input" />
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="input">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <p className="text-slate-600 text-xs mt-2">The member will log in with this email and password.</p>
            <div className="flex gap-2 mt-5">
              <button onClick={() => { setShowForm(false); setError(''); }} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition disabled:opacity-50">
                {saving ? 'Creating…' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
