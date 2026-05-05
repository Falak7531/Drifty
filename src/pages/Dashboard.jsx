import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, CheckCircle, Clock, AlertTriangle, Play, Calendar, User, Activity } from 'lucide-react';

const Dashboard = () => {
  // Dummy data
  const [stats, setStats] = useState({
    totalTasks: 24,
    completedTasks: 18,
    pendingTasks: 4,
    overdueTasks: 2,
    inProgressTasks: 5,
  });

  const [upcomingDeadlines] = useState([
    { id: 1, title: 'Design homepage mockup', assignedTo: 'John Doe', deadline: new Date('2026-05-10'), status: 'In Progress', urgent: true },
    { id: 2, title: 'Fix login bug', assignedTo: 'Jane Smith', deadline: new Date('2026-05-12'), status: 'Pending', urgent: false },
    { id: 3, title: 'Update user documentation', assignedTo: 'Bob Johnson', deadline: new Date('2026-05-15'), status: 'To Do', urgent: false },
  ]);

  const [nextMeeting] = useState({
    title: 'Weekly Team Standup',
    date: new Date('2026-05-08T10:00:00'),
    description: 'Discuss project progress and blockers',
  });

  const [myTasks] = useState([
    { id: 1, title: 'Review pull request', status: 'In Progress', deadline: new Date('2026-05-09') },
    { id: 2, title: 'Update API documentation', status: 'Pending', deadline: new Date('2026-05-11') },
    { id: 3, title: 'Test new feature', status: 'To Do', deadline: new Date('2026-05-13') },
  ]);

  const [recentActivity] = useState([
    { id: 1, action: 'Task completed: Design homepage mockup', timestamp: new Date('2026-05-05T14:30:00') },
    { id: 2, action: 'Task updated: Fix login bug', timestamp: new Date('2026-05-05T12:15:00') },
    { id: 3, action: 'Task assigned: Update user documentation', timestamp: new Date('2026-05-05T10:45:00') },
    { id: 4, action: 'Task completed: Setup CI/CD pipeline', timestamp: new Date('2026-05-04T16:20:00') },
  ]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <Link to="/tasks" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          View All Tasks
        </Link>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <LayoutDashboard className="w-8 h-8 mr-4 text-blue-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalTasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 mr-4 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-800">{stats.completedTasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <Clock className="w-8 h-8 mr-4 text-yellow-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pendingTasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 mr-4 text-red-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-800">{stats.overdueTasks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <Play className="w-8 h-8 mr-4 text-purple-500" />
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-800">{stats.inProgressTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Deadlines */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            Upcoming Deadlines
          </h2>
          <div className="space-y-3">
            {upcomingDeadlines.map(task => (
              <div key={task.id} className={`p-4 rounded-lg border-l-4 ${task.urgent ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{task.title}</h3>
                    <p className="text-sm text-gray-600 flex items-center mt-1">
                      <User className="w-4 h-4 mr-1" />
                      {task.assignedTo}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Due: {task.deadline.toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Meeting */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-500" />
            Next Meeting
          </h2>
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h3 className="font-semibold text-lg text-green-800">{nextMeeting.title}</h3>
            <p className="text-sm text-green-600 mt-1">
              {nextMeeting.date.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-2">{nextMeeting.description}</p>
          </div>
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2 text-purple-500" />
            My Tasks
          </h2>
          <div className="space-y-3">
            {myTasks.map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{task.title}</p>
                  <p className="text-sm text-gray-500">Due: {task.deadline.toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                  task.status === 'Pending' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-indigo-500" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;