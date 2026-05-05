import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAuth } from '../contexts/GoogleAuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

const MeetingsPage = () => {
  const { user, role } = useAuth();
  const { isAuthenticated: isGoogleAuthenticated } = useGoogleAuth();
  const [meetings, setMeetings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    meetingType: 'Team Meeting'
  });
  const [syncWithCalendar, setSyncWithCalendar] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  // Separate meetings into upcoming and past
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const upcomingMeetings = meetings
    .filter(meeting => meeting.date >= today)
    .sort((a, b) => a.date - b.date);

  const pastMeetings = meetings
    .filter(meeting => meeting.date < today)
    .sort((a, b) => b.date - a.date); // Most recent first

  // For testing, assume Admin role
  const userRole = 'admin'; // role === 'Admin';

  const loadMeetings = async () => {
    try {
      // For now, use local state instead of Firebase
      // const fetchedMeetings = await fetchMeetings();
      // setMeetings(fetchedMeetings);

      // Sample data for demonstration
      const sampleMeetings = [
        {
          id: '1',
          title: 'Weekly Team Standup',
          date: new Date('2026-05-15'),
          time: '10:00',
          description: 'Daily standup meeting to discuss progress',
          meetingType: 'Team Meeting',
          createdBy: 'admin-uid',
          googleCalendarEventId: null
        },
        {
          id: '2',
          title: 'Project Review with CEO',
          date: new Date('2026-05-10'),
          time: '14:00',
          description: 'Monthly project review and planning session',
          meetingType: 'Head Meeting',
          createdBy: 'admin-uid',
          googleCalendarEventId: null
        },
        {
          id: '3',
          title: 'Past Team Meeting',
          date: new Date('2026-04-01'),
          time: '11:00',
          description: 'Completed team meeting from last month',
          meetingType: 'Team Meeting',
          createdBy: 'admin-uid',
          googleCalendarEventId: null
        }
      ];
      setMeetings(sampleMeetings);
    } catch (error) {
      console.error('Error loading meetings:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = 'Meeting date cannot be in the past';
      }
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (!formData.meetingType) {
      newErrors.meetingType = 'Meeting type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const meetingData = {
        ...formData,
        createdBy: user.uid
      };

      if (editingMeeting) {
        // For local state, update directly
        setMeetings(meetings.map(meeting =>
          meeting.id === editingMeeting.id
            ? { ...meeting, ...meetingData }
            : meeting
        ));
        // await updateMeeting(editingMeeting.id, meetingData, syncWithCalendar);
        setEditingMeeting(null);
      } else {
        // For local state, add new meeting
        const newMeeting = {
          ...meetingData,
          id: Date.now().toString(),
          date: new Date(meetingData.date),
          googleCalendarEventId: syncWithCalendar && isGoogleAuthenticated ? 'mock-calendar-id' : null
        };
        setMeetings([...meetings, newMeeting]);
        // await createMeeting(meetingData, syncWithCalendar && isGoogleAuthenticated);
      }

      setFormData({
        title: '',
        date: '',
        time: '',
        description: '',
        meetingType: 'Team Meeting'
      });
      setSyncWithCalendar(false);
      setShowForm(false);
      setErrors({});
    } catch (error) {
      console.error('Error saving meeting:', error);
      alert('Failed to save meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      date: meeting.date.toISOString().split('T')[0],
      time: meeting.time,
      description: meeting.description,
      meetingType: meeting.meetingType || 'Team Meeting'
    });
    setSyncWithCalendar(!!meeting.googleCalendarEventId);
    setShowForm(true);
  };

  const handleDelete = async (meetingId) => {
    if (!window.confirm('Are you sure you want to delete this meeting?')) return;

    try {
      // For local state, just remove from state
      setMeetings(meetings.filter(m => m.id !== meetingId));
      // Get the meeting to check if it has a Google Calendar event
      // const meeting = meetings.find(m => m.id === meetingId);
      // const shouldDeleteCalendarEvent = meeting?.googleCalendarEventId && isGoogleAuthenticated;
      // await deleteMeeting(meetingId, shouldDeleteCalendarEvent);
      // loadMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      alert('Failed to delete meeting. Please try again.');
    }
  };

  const openCreateForm = () => {
    setEditingMeeting(null);
    setFormData({
      title: '',
      date: '',
      time: '',
      description: '',
      meetingType: 'Team Meeting'
    });
    setSyncWithCalendar(false);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 sm:mb-0">Meetings</h1>
          {userRole === 'admin' && (
            <button
              onClick={openCreateForm}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm transition duration-200 ease-in-out transform hover:scale-105"
            >
              Create Meeting
            </button>
          )}
        </div>

        {/* Google Calendar Integration */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Google Calendar Integration</h2>
          <p className="text-gray-600 mb-4">
            Connect your Google account to automatically sync meetings with your Google Calendar.
          </p>
          <GoogleAuthButton />
        </div>

        {/* Upcoming Meetings */}
        {upcomingMeetings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Meetings</h2>
            <div className="space-y-4">
              {upcomingMeetings.map((meeting, index) => (
                <div key={meeting.id} className={`bg-white p-6 rounded-xl shadow-sm border transition duration-200 ease-in-out hover:shadow-md ${
                  index === 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                }`}>
                  {index === 0 && (
                    <div className="flex items-center mb-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        Next Meeting
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className={`text-xl font-bold ${index === 0 ? 'text-blue-900' : 'text-gray-900'}`}>
                          {meeting.title}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          meeting.meetingType === 'Team Meeting'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {meeting.meetingType}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="font-medium text-gray-600">Date:</span>
                          <p className={index === 0 ? 'text-blue-900 font-medium' : 'text-gray-900'}>
                            {meeting.date.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Time:</span>
                          <p className={index === 0 ? 'text-blue-900 font-medium' : 'text-gray-900'}>
                            {meeting.time}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Calendar Sync:</span>
                          <p className="text-gray-900">
                            {meeting.googleCalendarEventId ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Synced
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Not Synced
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {meeting.description && (
                        <div className="mb-4">
                          <span className="font-medium text-gray-600">Description:</span>
                          <p className="text-gray-900 mt-1">{meeting.description}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(meeting)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(meeting.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Past Meetings */}
        {pastMeetings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Past Meetings</h2>
            <div className="space-y-4">
              {pastMeetings.map(meeting => (
                <div key={meeting.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition duration-200 ease-in-out opacity-75">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-700">{meeting.title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          meeting.meetingType === 'Team Meeting'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {meeting.meetingType}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="font-medium text-gray-600">Date:</span>
                          <p className="text-gray-700">{meeting.date.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Time:</span>
                          <p className="text-gray-700">{meeting.time}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Calendar Sync:</span>
                          <p className="text-gray-900">
                            {meeting.googleCalendarEventId ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Synced
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                Not Synced
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      {meeting.description && (
                        <div className="mb-4">
                          <span className="font-medium text-gray-600">Description:</span>
                          <p className="text-gray-700 mt-1">{meeting.description}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(meeting)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(meeting.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Meetings Message */}
        {meetings.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
            <p className="text-gray-500 text-lg">No meetings scheduled yet.</p>
            <p className="text-gray-400 mt-2">Create your first meeting to get started!</p>
          </div>
        )}

        {/* Create/Edit Meeting Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingMeeting ? 'Edit Meeting' : 'Create New Meeting'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600 transition duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                      <input
                        type="text"
                        placeholder="Meeting title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                          errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                          errors.date ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                          errors.time ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.time && <p className="mt-1 text-sm text-red-600">{errors.time}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Type *</label>
                      <select
                        value={formData.meetingType}
                        onChange={(e) => setFormData({ ...formData, meetingType: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ${
                          errors.meetingType ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="Team Meeting">Team Meeting</option>
                        <option value="Head Meeting">Head Meeting</option>
                      </select>
                      {errors.meetingType && <p className="mt-1 text-sm text-red-600">{errors.meetingType}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        placeholder="Meeting description (optional)"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Google Calendar Sync Option */}
                  {isGoogleAuthenticated && (
                    <div className="mt-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={syncWithCalendar}
                          onChange={(e) => setSyncWithCalendar(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Sync with Google Calendar
                        </span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        This will create an event in your Google Calendar when the meeting is saved.
                      </p>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200 ease-in-out"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition duration-200 ease-in-out transform hover:scale-105 disabled:transform-none"
                    >
                      {loading ? 'Saving...' : (editingMeeting ? 'Update Meeting' : 'Create Meeting')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingsPage;