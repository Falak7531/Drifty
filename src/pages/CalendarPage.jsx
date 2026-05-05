import { useState, useEffect } from 'react';
import useGoogleAuth from '../contexts/useGoogleAuth';
import { getUpcomingEvents } from '../googleCalendar';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle } from 'lucide-react';

const CalendarPage = () => {
  const { isGoogleAuthenticated } = useGoogleAuth();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 5)); // May 5, 2026
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const fetchUpcomingEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const events = await getUpcomingEvents(50);
      setUpcomingEvents(events);
    } catch (err) {
      setError('Failed to load calendar events. Please try reconnecting Google Calendar.');
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isGoogleAuthenticated) {
      return;
    }

    let active = true;
    const loadEvents = async () => {
      setLoading(true);
      setError(null);

      try {
        const events = await getUpcomingEvents(50);
        if (active) {
          setUpcomingEvents(events);
        }
      } catch (err) {
        if (active) {
          setError('Failed to load calendar events. Please try reconnecting Google Calendar.');
        }
        console.error('Error fetching events:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      active = false;
    };
  }, [isGoogleAuthenticated]);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  // Check if date has events
  const getEventsForDate = (day) => {
    if (!day) return [];
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString().split('T')[0];
    return upcomingEvents.filter(event => {
      const eventDate = new Date(event.start).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  // Check if it's today
  const isToday = (day) => {
    const today = new Date(2026, 4, 5); // May 5, 2026
    return day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();
  };

  // Previous month
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  // Next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date(2026, 4, 5));
  };

  // Format time
  const formatTime = (dateTimeStr) => {
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'All day';
    }
  };

  // Format date range
  const formatDateRange = (startStr, endStr) => {
    try {
      const start = new Date(startStr);
      const end = new Date(endStr);
      const startDate = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const startTime = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const endTime = end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `${startDate} • ${startTime} - ${endTime}`;
    } catch {
      return 'All day';
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 sm:mb-0">Calendar</h1>
          <GoogleAuthButton />
        </div>

        {/* Sync Status */}
        {!isGoogleAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Connect Google Calendar</h3>
              <p className="text-sm text-blue-700 mt-1">
                Connect your Google account to sync events from your Google Calendar.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={goToToday}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg transition duration-200 text-sm"
                  >
                    Today
                  </button>
                  <button
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {daysOfWeek.map(day => (
                  <div
                    key={day}
                    className="text-center font-semibold text-gray-600 text-sm py-3"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const eventsForDay = getEventsForDate(day);
                  const isCurrentDay = isToday(day);

                  return (
                    <div
                      key={index}
                      className={`aspect-square p-2 rounded-lg border-2 transition duration-200 ${
                        day === null
                          ? 'bg-gray-50'
                          : isCurrentDay
                            ? 'bg-blue-50 border-blue-500 hover:bg-blue-100'
                            : eventsForDay.length > 0
                              ? 'bg-green-50 border-green-300 hover:bg-green-100'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {day && (
                        <div className="h-full flex flex-col">
                          <span
                            className={`text-sm font-semibold ${
                              isCurrentDay
                                ? 'text-blue-700'
                                : 'text-gray-900'
                            }`}
                          >
                            {day}
                          </span>
                          {eventsForDay.length > 0 && (
                            <div className="mt-1 flex-1 overflow-hidden">
                              <div className="text-xs bg-green-200 text-green-800 px-1 py-0.5 rounded truncate">
                                {eventsForDay.length} event{eventsForDay.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming Events Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Upcoming Events
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : upcomingEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No upcoming events</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {upcomingEvents.map(event => (
                    <div
                      key={event.id}
                      className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition duration-200"
                    >
                      <h4 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                        {event.title}
                      </h4>
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatTime(event.start)}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {event.description || 'No description'}
                      </div>
                      {event.htmlLink && (
                        <a
                          href={event.htmlLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Open in Google Calendar →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isGoogleAuthenticated && (
                <button
                  onClick={fetchUpcomingEvents}
                  disabled={loading}
                  className="w-full mt-4 px-4 py-2 bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 text-blue-700 disabled:text-gray-500 font-medium rounded-lg transition duration-200 text-sm"
                >
                  {loading ? 'Refreshing...' : 'Refresh Events'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Events List View */}
        {isGoogleAuthenticated && upcomingEvents.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">All Upcoming Events</h3>
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition duration-200 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {event.title}
                    </h4>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDateRange(event.start, event.end)}
                      </div>
                      {event.description && (
                        <div className="flex items-center mt-2 sm:mt-0">
                          <span className="text-gray-700">{event.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {event.htmlLink && (
                    <a
                      href={event.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 text-sm flex-shrink-0"
                    >
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
