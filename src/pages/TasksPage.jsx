import { useState } from 'react';

// Dummy users for local state
const dummyUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
  { id: '3', name: 'Admin User', email: 'admin@example.com' },
];

const TasksPage = () => {
  // For testing, assume Admin role
  const isAdmin = true; // role === 'Admin';
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Sample Task',
      description: 'This is a sample task',
      assignedTo: '1',
      deadline: '2026-05-10',
      priority: 'Medium',
      status: 'To Do',
      shopifyLink: 'https://shopify.com',
      comments: [
        { id: 'c1', user: 'John Doe', text: 'Started working on this', timestamp: new Date().toISOString() }
      ]
    }
  ]);
  const [users] = useState(dummyUsers);
  const [form, setForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
    priority: 'Medium',
    status: 'To Do',
    shopifyLink: '',
  });
  const [editingTask, setEditingTask] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    assignedTo: '',
    priority: '',
    search: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTask) {
      setTasks(tasks.map(task => task.id === editingTask.id ? { ...editingTask, ...form } : task));
      setEditingTask(null);
    } else {
      const newTask = {
        ...form,
        id: Date.now().toString(),
        comments: [],
      };
      setTasks([...tasks, newTask]);
    }
    setForm({
      title: '',
      description: '',
      assignedTo: '',
      deadline: '',
      priority: 'Medium',
      status: 'To Do',
      shopifyLink: '',
    });
    setShowModal(false);
  };

  const updateStatus = (id, status) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, status } : task));
  };

  const deleteTask = (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== id));
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      deadline: task.deadline,
      priority: task.priority,
      status: task.status,
      shopifyLink: task.shopifyLink,
    });
    setShowModal(true);
  };

  const viewTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now().toString(),
      user: 'Anonymous',
      text: newComment,
      timestamp: new Date().toISOString(),
    };
    setTasks(tasks.map(task => task.id === selectedTask.id ? { ...task, comments: [...task.comments, comment] } : task));
    setSelectedTask({ ...selectedTask, comments: [...selectedTask.comments, comment] });
    setNewComment('');
  };

  const filteredTasks = tasks.filter(task => {
    return (
      (filters.status === '' || task.status === filters.status) &&
      (filters.assignedTo === '' || task.assignedTo === filters.assignedTo) &&
      (filters.priority === '' || task.priority === filters.priority) &&
      (filters.search === '' || task.title.toLowerCase().includes(filters.search.toLowerCase()))
    );
  });

  const openCreateModal = () => {
    setEditingTask(null);
    setForm({
      title: '',
      description: '',
      assignedTo: '',
      deadline: '',
      priority: 'Medium',
      status: 'To Do',
      shopifyLink: '',
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 sm:mb-0">Task Management</h1>
          {isAdmin && (
            <button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition duration-200 ease-in-out transform hover:scale-105">
              Create Task
            </button>
          )}
        </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Filters & Search</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="">All Status</option>
              <option>To Do</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assigned User</label>
            <select
              value={filters.assignedTo}
              onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            >
              <option value="">All Priorities</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
            />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-200 ease-in-out">
            <div className="mb-4">
              <h3 className="font-bold text-xl text-gray-900 mb-2">{task.title}</h3>
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-medium">Assigned:</span> {users.find(u => u.id === task.assignedTo)?.name || 'Unknown'}
              </p>
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Deadline:</span> {task.deadline}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'High' ? 'bg-red-100 text-red-800' :
                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority} Priority
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  task.status === 'Done' ? 'bg-green-100 text-green-800' :
                  task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status}
                </span>
              </div>
              {task.shopifyLink && (
                <a href={task.shopifyLink} className="text-blue-600 hover:text-blue-800 text-sm font-medium underline">
                  Shopify Link
                </a>
              )}
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => viewTask(task)}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200"
              >
                View Details
              </button>
              <div className="flex space-x-2">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => editTask(task)}
                      className="text-yellow-600 hover:text-yellow-800 font-medium text-sm transition duration-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-red-600 hover:text-red-800 font-medium text-sm transition duration-200"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Update Status</label>
              <select
                value={task.status}
                onChange={(e) => updateStatus(task.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 text-sm"
              >
                <option>To Do</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTask ? 'Edit Task' : selectedTask ? 'Task Details' : 'Create New Task'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {selectedTask ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTask.title}</h3>
                    <p className="text-gray-700 mb-4">{selectedTask.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="font-medium text-gray-600">Assigned to:</span>
                        <p className="text-gray-900">{users.find(u => u.id === selectedTask.assignedTo)?.name}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Deadline:</span>
                        <p className="text-gray-900">{selectedTask.deadline}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Priority:</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ml-2 ${
                          selectedTask.priority === 'High' ? 'bg-red-100 text-red-800' :
                          selectedTask.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {selectedTask.priority}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ml-2 ${
                          selectedTask.status === 'Done' ? 'bg-green-100 text-green-800' :
                          selectedTask.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedTask.status}
                        </span>
                      </div>
                    </div>
                    {selectedTask.shopifyLink && (
                      <div className="mb-4">
                        <span className="font-medium text-gray-600">Shopify Link:</span>
                        <a href={selectedTask.shopifyLink} className="text-blue-600 hover:text-blue-800 ml-2 underline">
                          {selectedTask.shopifyLink}
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Comments</h4>
                    <div className="space-y-4 mb-4">
                      {selectedTask.comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-900">{comment.user}</span>
                            <span className="text-sm text-gray-500">{new Date(comment.timestamp).toLocaleString()}</span>
                          </div>
                          <p className="text-gray-700">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Add Comment</label>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your comment here..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
                        rows={3}
                      />
                      <button
                        onClick={addComment}
                        className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition duration-200 ease-in-out"
                      >
                        Add Comment
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                      <input
                        type="text"
                        placeholder="Enter task title"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        placeholder="Enter task description"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To *</label>
                      <select
                        value={form.assignedTo}
                        onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      >
                        <option value="">Select user</option>
                        {users.map(user => (
                          <option key={user.id} value={user.id}>{user.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Deadline *</label>
                      <input
                        type="date"
                        value={form.deadline}
                        onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={form.priority}
                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                      <select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      >
                        <option>To Do</option>
                        <option>In Progress</option>
                        <option>Done</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Shopify Link</label>
                      <input
                        type="url"
                        placeholder="https://shopify.com/..."
                        value={form.shopifyLink}
                        onChange={(e) => setForm({ ...form, shopifyLink: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200 ease-in-out"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 ease-in-out transform hover:scale-105"
                    >
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default TasksPage;