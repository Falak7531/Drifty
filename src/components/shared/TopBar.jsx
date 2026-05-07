// src/components/shared/TopBar.jsx
import { useLocation } from 'react-router-dom';

const titles = {
  '/dashboard': 'Dashboard',
  '/tasks': 'Tasks',
  '/calendar': 'Calendar',
  '/meetings': 'Meetings',
  '/team': 'Team',
};

export default function TopBar({ onMenuClick }) {
  const location = useLocation();
  const title = titles[location.pathname] || 'Drifty';

  return (
    <header className="h-16 bg-[#0f0f13]/80 backdrop-blur-sm border-b border-white/[0.06] flex items-center px-4 lg:px-6 sticky top-0 z-10">
      <button
        className="lg:hidden p-2 text-slate-400 hover:text-white mr-2"
        onClick={onMenuClick}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-white font-semibold text-lg">{title}</h1>
    </header>
  );
}
