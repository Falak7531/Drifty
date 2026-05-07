// src/pages/Calendar.jsx
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useAuth } from '../context/AuthContext';

export default function CalendarPage() {
  const { currentUser, isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'tasks'));
    const unsub = onSnapshot(q, snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, 'meetings'), orderBy('date', 'asc')), snap => {
      setMeetings(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  // Build FullCalendar events
  const userTasks = isAdmin ? tasks : tasks.filter(t => !t.assignedTo || t.assignedTo === currentUser?.uid);
  const events = [
    ...userTasks
      .filter(t => t.deadline)
      .map(t => ({
        id: `task-${t.id}`,
        title: t.title,
        date: t.deadline,
        backgroundColor: t.status === 'Done' ? '#10b981' : t.priority === 'high' ? '#ef4444' : '#6366f1',
        borderColor: 'transparent',
        extendedProps: { type: 'task', ...t },
      })),
    ...meetings.map(m => ({
      id: `meeting-${m.id}`,
      title: `📅 ${m.title}`,
      date: m.date,
      backgroundColor: '#8b5cf6',
      borderColor: 'transparent',
      extendedProps: { type: 'meeting', ...m },
    })),
  ];

  const handleEventClick = ({ event }) => {
    setSelectedEvent(event.extendedProps);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
          <span className="text-slate-400 text-xs">Tasks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
          <span className="text-slate-400 text-xs">High Priority</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-400 text-xs">Done</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-violet-500 inline-block" />
          <span className="text-slate-400 text-xs">Meetings</span>
        </div>
      </div>

      <div className="bg-[#18181f] border border-white/[0.06] rounded-xl p-4 calendar-wrapper">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek',
          }}
          height="auto"
        />
      </div>

      {/* Event detail popup */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#18181f] border border-white/[0.08] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-start justify-between mb-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${selectedEvent.type === 'meeting' ? 'bg-violet-500/15 text-violet-400' : 'bg-indigo-500/15 text-indigo-400'}`}>
                {selectedEvent.type === 'meeting' ? 'Meeting' : 'Task'}
              </span>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-500 hover:text-white">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <h3 className="text-white font-semibold mb-2">{selectedEvent.title}</h3>
            {selectedEvent.type === 'task' ? (
              <div className="space-y-1 text-sm">
                <p className="text-slate-400">Status: <span className="text-white">{selectedEvent.status}</span></p>
                <p className="text-slate-400">Priority: <span className="text-white">{selectedEvent.priority}</span></p>
                {selectedEvent.deadline && <p className="text-slate-400">Deadline: <span className="text-white">{selectedEvent.deadline}</span></p>}
                {selectedEvent.description && <p className="text-slate-500 text-xs mt-2">{selectedEvent.description}</p>}
              </div>
            ) : (
              <div className="space-y-1 text-sm">
                <p className="text-slate-400">Date: <span className="text-white">{selectedEvent.date}</span></p>
                <p className="text-slate-400">Time: <span className="text-white">{selectedEvent.time}</span></p>
                {selectedEvent.description && <p className="text-slate-500 text-xs mt-2">{selectedEvent.description}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
