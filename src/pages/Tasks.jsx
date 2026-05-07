// src/pages/Tasks.jsx
import { useEffect, useState } from 'react';
import {
  collection, query, onSnapshot, orderBy,
  addDoc, updateDoc, deleteDoc, doc, serverTimestamp,
  getDoc, arrayUnion
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { logActivity } from '../utils/activity';
import { useAuth } from '../context/AuthContext';

const STATUSES = ['To Do', 'In Progress', 'Done'];
const PRIORITIES = ['low', 'medium', 'high'];

function priorityBadge(p) {
  if (p === 'high') return 'bg-red-500/15 text-red-400 border border-red-500/20';
  if (p === 'medium') return 'bg-amber-500/15 text-amber-400 border border-amber-500/20';
  return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20';
}

function statusBadge(s) {
  if (s === 'Done') return 'bg-emerald-500/15 text-emerald-400';
  if (s === 'In Progress') return 'bg-blue-500/15 text-blue-400';
  return 'bg-slate-500/15 text-slate-400';
}

export default function Tasks() {
  const { currentUser, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState({ status: 'all', priority: 'all', user: 'all' });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [comment, setComment] = useState('');

  // Load all users (for assigning)
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Load tasks
  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Filter + search
  const filtered = tasks.filter(t => {
    if (filter.status !== 'all' && t.status !== filter.status) return false;
    if (filter.priority !== 'all' && t.priority !== filter.priority) return false;
    if (filter.user !== 'all' && t.assignedTo !== filter.user) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    await deleteDoc(doc(db, 'tasks', id));
    await logActivity(db, `Task "${title}" was deleted`, 'system', 'System');
  };

  const handleStatusChange = async (id, status, title) => {
    await updateDoc(doc(db, 'tasks', id), { status });
    await logActivity(db, `Task "${title}" marked as ${status}`, 'system', 'System');
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !detailTask) return;
    const newComment = {
      text: comment.trim(),
      authorName: 'System',
      authorUid: 'system',
      createdAt: new Date().toISOString(),
    };
    await updateDoc(doc(db, 'tasks', detailTask.id), {
      comments: arrayUnion(newComment),
    });
    setComment('');
    // Refresh detailTask
    const snap = await getDoc(doc(db, 'tasks', detailTask.id));
    setDetailTask({ id: snap.id, ...snap.data() });
  };

  const userName = (uid) => users.find(u => u.id === uid)?.name || uid;

  const canEditTask = (task) => {
    if (isAdmin) return true;
    return !task.assignedTo || task.assignedTo === currentUser?.uid;
  };

  const canDeleteTask = () => {
    if (isAdmin) return true;
    return true;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white font-bold text-xl">Tasks</h2>
          <p className="text-slate-400 text-sm mt-0.5">{filtered.length} tasks</p>
        </div>
        <button
          onClick={() => { setEditTask(null); setShowForm(true); }}
          className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search tasks…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#18181f] border border-white/[0.07] rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50 w-48"
        />
        <select
          value={filter.status}
          onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
          className="bg-[#18181f] border border-white/[0.07] rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value="all">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filter.priority}
          onChange={e => setFilter(f => ({ ...f, priority: e.target.value }))}
          className="bg-[#18181f] border border-white/[0.07] rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value="all">All Priority</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          value={filter.user}
          onChange={e => setFilter(f => ({ ...f, user: e.target.value }))}
          className="bg-[#18181f] border border-white/[0.07] rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-violet-500/50"
        >
          <option value="all">All Members</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      </div>

      {/* Kanban-style columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STATUSES.map(status => {
          const col = filtered.filter(t => t.status === status);
          return (
            <div key={status} className="bg-[#13131a] border border-white/[0.05] rounded-xl p-3">
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className={`w-2 h-2 rounded-full ${status === 'Done' ? 'bg-emerald-500' : status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-500'}`} />
                <span className="text-white text-sm font-medium">{status}</span>
                <span className="ml-auto bg-white/5 text-slate-400 text-xs px-2 py-0.5 rounded-full">{col.length}</span>
              </div>
              <div className="space-y-2">
                {col.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    userName={userName}
                    onEdit={canEditTask(task) ? () => { setEditTask(task); setShowForm(true); } : null}
                    onDelete={canDeleteTask(task) ? () => handleDelete(task.id, task.title) : null}
                    onStatusChange={canEditTask(task) ? handleStatusChange : null}
                    onClick={() => setDetailTask(task)}
                  />
                ))}
                {col.length === 0 && (
                  <p className="text-slate-600 text-xs text-center py-4">Empty</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskFormModal
          task={editTask}
          users={users}
          onClose={() => setShowForm(false)}
          db={db}
        />
      )}

      {/* Task Detail Modal */}
      {detailTask && (
        <TaskDetailModal
          task={detailTask}
          users={users}
          comment={comment}
          setComment={setComment}
          onAddComment={handleAddComment}
          onStatusChange={canEditTask(detailTask) ? handleStatusChange : null}
          onClose={() => setDetailTask(null)}
        />
      )}
    </div>
  );
}

// ── TaskCard ──────────────────────────────────────────────────────────────────
function TaskCard({ task, userName, onEdit, onDelete, onClick }) {
  const overdue = task.deadline && task.status !== 'Done' && new Date(task.deadline) < new Date();
  return (
    <div
      className="bg-[#18181f] border border-white/[0.06] rounded-lg p-3 cursor-pointer hover:border-violet-500/30 transition group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-white text-sm font-medium leading-tight line-clamp-2">{task.title}</p>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition shrink-0" onClick={e => e.stopPropagation()}>
          {onEdit && (
            <button onClick={onEdit} className="p-1 text-slate-500 hover:text-white">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-1 text-slate-500 hover:text-red-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityBadge(task.priority)}`}>{task.priority}</span>
        {task.deadline && (
          <span className={`text-xs ${overdue ? 'text-red-400' : 'text-slate-500'}`}>
            {overdue ? '⚠ ' : ''}{task.deadline}
          </span>
        )}
      </div>
      {task.assignedTo && (
        <p className="text-slate-500 text-xs mt-1.5">{userName(task.assignedTo)}</p>
      )}
    </div>
  );
}

// ── TaskFormModal ─────────────────────────────────────────────────────────────
function TaskFormModal({ task, users, onClose, db }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo || '',
    deadline: task?.deadline || '',
    status: task?.status || 'To Do',
    priority: task?.priority || 'medium',
    shopifyLink: task?.shopifyLink || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (task) {
        await updateDoc(doc(db, 'tasks', task.id), { ...form, updatedAt: serverTimestamp() });
        await logActivity(db, `Task "${form.title}" was updated`, 'system', 'System');
      } else {
        await addDoc(collection(db, 'tasks'), { ...form, createdAt: serverTimestamp(), comments: [] });
        await logActivity(db, `Task "${form.title}" was created`, 'system', 'System');
      }
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181f] border border-white/[0.08] rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <h3 className="text-white font-semibold text-lg mb-5">{task ? 'Edit Task' : 'New Task'}</h3>
        <div className="space-y-3">
          <input
            placeholder="Task title *"
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className="input"
          />
          <textarea
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            className="input resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.assignedTo} onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))} className="input">
              <option value="">Assign to…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <input
              type="date"
              value={form.deadline}
              onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="input">
              {['To Do', 'In Progress', 'Done'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="input">
              {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <input
            placeholder="Shopify link (optional)"
            value={form.shopifyLink}
            onChange={e => setForm(f => ({ ...f, shopifyLink: e.target.value }))}
            className="input"
          />
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-white/10 text-slate-400 hover:text-white text-sm transition">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition disabled:opacity-50">
            {saving ? 'Saving…' : task ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── TaskDetailModal ───────────────────────────────────────────────────────────
function TaskDetailModal({ task, users, comment, setComment, onAddComment, onStatusChange, onClose }) {
  const userName = (uid) => users.find(u => u.id === uid)?.name || uid;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#18181f] border border-white/[0.08] rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-white font-semibold text-lg leading-tight pr-4">{task.title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityBadge(task.priority)}`}>{task.priority}</span>
          <span className={`text-xs px-2 py-1 rounded-full ${statusBadge(task.status)}`}>{task.status}</span>
          {task.deadline && <span className="text-xs text-slate-400">{task.deadline}</span>}
        </div>

        {task.description && (
          <p className="text-slate-300 text-sm mb-4">{task.description}</p>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div>
            <span className="text-slate-500 text-xs">Assigned to</span>
            <p className="text-white text-sm">{task.assignedTo ? userName(task.assignedTo) : '—'}</p>
          </div>
          {task.shopifyLink && (
            <div>
              <span className="text-slate-500 text-xs">Shopify</span>
              <a href={task.shopifyLink} target="_blank" rel="noopener noreferrer" className="text-violet-400 text-sm hover:underline block truncate">View link</a>
            </div>
          )}
        </div>

        {/* Status update (for members too) */}
        {onStatusChange && (
          <div className="mb-5">
            <span className="text-slate-500 text-xs block mb-1.5">Update Status</span>
            <div className="flex gap-2">
              {['To Do', 'In Progress', 'Done'].map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(task.id, s, task.title)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition ${task.status === s ? 'bg-violet-600 border-violet-500 text-white' : 'border-white/10 text-slate-400 hover:border-violet-500/50 hover:text-white'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <h4 className="text-white font-medium text-sm mb-3">Comments ({task.comments?.length || 0})</h4>
          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
            {(task.comments || []).map((c, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.04] rounded-lg p-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white text-xs font-medium">{c.authorName}</span>
                  <span className="text-slate-600 text-xs">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-300 text-xs">{c.text}</p>
              </div>
            ))}
            {(!task.comments || task.comments.length === 0) && (
              <p className="text-slate-600 text-xs">No comments yet.</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              placeholder="Add a comment…"
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && onAddComment()}
              className="flex-1 bg-[#0f0f13] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500/50"
            />
            <button onClick={onAddComment} className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
