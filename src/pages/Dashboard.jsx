// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

function StatCard({ label, value, color, icon }) {
  return (
    <div className="bg-[#18181f] border border-white/[0.06] rounded-xl p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-400 text-sm">{label}</p>
        <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function priorityColor(p) {
  if (p === 'high') return 'bg-red-500/15 text-red-400';
  if (p === 'medium') return 'bg-amber-500/15 text-amber-400';
  return 'bg-emerald-500/15 text-emerald-400';
}

export default function Dashboard() {
  const { currentUser, userProfile, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [activity, setActivity] = useState([]);

  // Load tasks
  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Load upcoming meetings
  useEffect(() => {
    const q = query(
      collection(db, 'meetings'),
      orderBy('date', 'asc'),
      limit(5)
    );
    const unsub = onSnapshot(q, (snap) => {
      const now = new Date().toISOString().split('T')[0];
      setMeetings(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(m => m.date >= now)
      );
    });
    return unsub;
  }, []);

  // Load recent activity
  useEffect(() => {
    const q = query(
      collection(db, 'activity'),
      orderBy('timestamp', 'desc'),
      limit(8)
    );
    const unsub = onSnapshot(q, (snap) => {
      setActivity(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const now = new Date();
  const userTasks = isAdmin ? tasks : tasks.filter(t => !t.assignedTo || t.assignedTo === currentUser?.uid);
  const total = userTasks.length;
  const done = userTasks.filter(t => t.status === 'Done').length;
  const inProgress = userTasks.filter(t => t.status === 'In Progress').length;
  const overdue = userTasks.filter(t => {
    if (!t.deadline || t.status === 'Done') return false;
    return new Date(t.deadline) < now;
  }).length;

  const upcoming = userTasks
    .filter(t => t.deadline && t.status !== 'Done')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-white text-2xl font-bold">
          {isAdmin ? 'Team Overview' : 'My Dashboard'}
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isAdmin 
            ? "Here's what's happening with your team today." 
            : `Good ${hour()}, ${userProfile?.name || 'there'} 👋 Here's your personal overview.`
          }
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total Tasks"
          value={total}
          color="bg-violet-500/15"
          icon={<svg className="w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard
          label="Completed"
          value={done}
          color="bg-emerald-500/15"
          icon={<svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          color="bg-blue-500/15"
          icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Overdue"
          value={overdue}
          color="bg-red-500/15"
          icon={<svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="bg-[#18181f] border border-white/[0.06] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium text-sm">Overall Progress</span>
            <span className="text-slate-400 text-sm">{Math.round((done / total) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
              style={{ width: `${(done / total) * 100}%` }}
            />
          </div>
          <div className="flex gap-4 mt-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" /> To Do: {userTasks.filter(t => t.status === 'To Do').length}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> In Progress: {inProgress}</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Done: {done}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming deadlines */}
        <div className="bg-[#18181f] border border-white/[0.06] rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Upcoming Deadlines</h3>
          {upcoming.length === 0 ? (
            <p className="text-slate-500 text-sm">No upcoming deadlines 🎉</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map(task => {
                const daysLeft = Math.ceil((new Date(task.deadline) - now) / 86400000);
                return (
                  <div key={task.id} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{task.title}</p>
                      <p className="text-slate-500 text-xs">{task.deadline}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs font-medium ${daysLeft < 0 ? 'text-red-400' : daysLeft <= 2 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today' : `${daysLeft}d left`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Next meeting + recent activity */}
        <div className="space-y-4">
          {/* Next meeting */}
          <div className="bg-[#18181f] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Next Meeting</h3>
            {meetings.length === 0 ? (
              <p className="text-slate-500 text-sm">No upcoming meetings scheduled.</p>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/15 flex items-center justify-center shrink-0">
                  <svg className="w-4.5 h-4.5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{meetings[0].title}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{meetings[0].date} at {meetings[0].time}</p>
                  {meetings[0].description && (
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">{meetings[0].description}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Recent activity */}
          <div className="bg-[#18181f] border border-white/[0.06] rounded-xl p-5">
            <h3 className="text-white font-semibold mb-3">Recent Activity</h3>
            {activity.length === 0 ? (
              <p className="text-slate-500 text-sm">No recent activity yet.</p>
            ) : (
              <div className="space-y-2">
                {(isAdmin ? activity : activity.filter(a => a.uid === currentUser?.uid)).slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-slate-300 text-xs">{a.message}</p>
                      <p className="text-slate-600 text-xs">{timeAgo(a.timestamp?.toDate?.())}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function hour() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}

function timeAgo(date) {
  if (!date) return '';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
