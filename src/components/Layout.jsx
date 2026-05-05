import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, Users, LogIn } from 'lucide-react';

const Layout = ({ children }) => {
  const location = useLocation();

  const menuItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/calendar', label: 'Calendar', icon: Calendar },
    { to: '/meetings', label: 'Meetings', icon: Users },
    { to: '/login', label: 'Login', icon: LogIn },
  ];

  return (
    <div className="flex h-screen">
      <aside className="fixed left-0 top-0 w-64 h-full bg-gray-900 text-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-8 text-center">Menu</h2>
        <ul className="space-y-4">
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
      <main className="ml-64 flex-1 overflow-y-auto p-6 bg-gray-50">
        {children}
      </main>
    </div>
  );
};

export default Layout;