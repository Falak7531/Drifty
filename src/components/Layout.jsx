import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, Users } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/meetings', label: 'Meetings', icon: Users },
  ];

  return (
    <div className="flex h-screen">
      <aside className="fixed left-0 top-0 w-72 h-full bg-gray-900 text-white p-6 shadow-lg">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">Worry</h2>
          <p className="text-sm text-slate-300 mt-2">Task Management</p>
        </div>
        <ul className="space-y-3">
          {menuItems.map(item => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  location.pathname === item.to
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon && <item.icon className="w-5 h-5" />}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <main className="ml-72 flex-1 overflow-y-auto p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default Layout;