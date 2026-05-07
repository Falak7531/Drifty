// src/pages/Meetings.jsx
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { logActivity } from '../utils/activity';

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', date: '', time: '', description: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'meetings'), orderBy('date', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setMeetings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = meetings.filter(m => m.date >= today);
  const past = meetings.filter(m => m.date < today);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.date || !form.time) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'meetings'), { ...form, createdAt: serverTimestamp(), createdBy: 'system' });
      await logActivity(db, `Meeting "${form.title}" scheduled for ${form.date}`, 'system', 'System');
      setForm({ title: '', date: '', time: '', description: '' });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete meeting "${title}"?`)) return;
    await deleteDoc(doc(db, 'meetings', id));
    await logActivity(db, `Meeting "${title}" was deleted`, 'system', 'System');
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Meetings</h2>
          <p className="text-slate-400 text-sm mt-0.5">{upcoming.length} upcoming</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Schedule
        </button>
      </div>

      {/* Upcoming */}
      <section className="mb-6">
        <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Upcoming</h3>
        {upcoming.length === 0 ? (
          <div className="bg-[#18181f] border border-white/[0.06] rounded-xl p-6 text-center text-slate-500 text-sm">
            No upcoming meetings scheduled.
          </div>
        ) : (
          <div className="space-y-2">
            {upcoming.map(m => (
              <MeetingCard key={m.id} meeting={m} onDelete={handleDelete} isPast={false} />
            ))}
          </div>
        )}
      </section>

      {/* Past */}
      {past.length > 0 && (
        <section>
          <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Past</h3>
          <div className="space-y-2">
            {[...past].reverse().slice(0, 5).map(m => (
              <MeetingCard key={m.id} meeting={m} onDelete={handleDelete} isPast />
            ))}
          </div>
        </section>
      )}

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181f] border border-white/[0.08] rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-5">Schedule Meeting</h3>
            <div className="space-y-3">
              <input
                placeholder="Meeting title *"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="input"
              />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} className="input" />
                <input type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} className="input" />
              </div>
              <textarea
                placeholder="Description (optional)"
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input resize-none"
              />
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition">Cancel</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition disabled:opacity-50">
                {saving ? 'Saving…' : 'Schedule'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MeetingCard({ meeting, onDelete, isPast }) {
  return (
    <div className={`bg-[#18181f] border rounded-xl p-4 flex items-start gap-4 ${isPast ? 'border-white/[0.04] opacity-60' : 'border-white/[0.07]'}`}>
      <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${isPast ? 'bg-slate-500/10' : 'bg-indigo-500/15'}`}>
        <span className={`text-xs font-bold leading-none ${isPast ? 'text-slate-400' : 'text-indigo-400'}`}>
          {new Date(meeting.date + 'T00:00:00').toLocaleDateString('en', { day: '2-digit' })}
        </span>
        <span className={`text-xs uppercase leading-none ${isPast ? 'text-slate-500' : 'text-indigo-500'}`}>
          {new Date(meeting.date + 'T00:00:00').toLocaleDateString('en', { month: 'short' })}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{meeting.title}</p>
        <p className="text-slate-400 text-xs mt-0.5">{meeting.time}</p>
        {meeting.description && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{meeting.description}</p>}
      </div>
      <button onClick={() => onDelete(meeting.id, meeting.title)} className="text-slate-600 hover:text-red-400 transition shrink-0">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
  );
}
