import { useState, useEffect } from "react";
import { HistoryService, type VolunteerHistoryRecord } from "~/services/api";

interface MyEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  assignment: {
    id: string;
    status: string;
    assignedAt: string;
    confirmedAt?: string;
    notes: string;
  };
}

export default function Schedule() {
  const [upcomingEvents, setUpcomingEvents] = useState<MyEvent[]>([]);
  const [completedEvents, setCompletedEvents] = useState<VolunteerHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Load schedule data from backend
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Get upcoming events from assignments (my-events endpoint)
        const response = await fetch('http://localhost:3001/api/events/my-events?timeFilter=upcoming', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('My events data:', data);
          setUpcomingEvents(data.data.events || []);
        }

        // Get completed events from history
        const allHistory = await HistoryService.getMyHistory();
        const completed = allHistory.filter(record =>
          record.participationStatus === 'COMPLETED'
        );
        setCompletedEvents(completed);

      } catch (err) {
        setError("Failed to load schedule");
        console.error("Error loading schedule:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedule();
  }, []);

  const handleEditEvent = (eventId: string) => {
    alert(`Edit functionality for event ${eventId} would open an edit modal or form here.`);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to remove this event from your schedule?')) {
      setUpcomingEvents(events => events.filter(event => event.id !== eventId));
    }
  };

  const handleViewDetails = (eventId: string) => {
    alert(`View details functionality for event ${eventId} would show more information here.`);
  };

  const handleExportSchedule = () => {
    alert('Export schedule functionality would generate a PDF or CSV file of your schedule.');
  };

  const handleAddAvailability = () => {
    alert('Add availability functionality would open a calendar to set your available times.');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">My Schedule</h1>
          <p className="text-slate-600 mt-1">Track your volunteer commitments and hours</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportSchedule}
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition"
          >
            Export Schedule
          </button>
          <button
            onClick={handleAddAvailability}
            className="btn-primary px-4 py-2 w-auto text-sm"
          >
            Add Availability
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-600">Upcoming Events</p>
              <p className="text-xl font-semibold text-slate-900">{upcomingEvents.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 rounded-lg">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-600">Hours This Month</p>
              <p className="text-xl font-semibold text-slate-900">
                {completedEvents.reduce((total, event) => total + (event.hoursWorked || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-600">Completed Events</p>
              <p className="text-xl font-semibold text-slate-900">{completedEvents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Upcoming Events</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {upcomingEvents.map((event) => (
            <div key={event.id} className="card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{event.eventTitle}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      <span>{new Date(event.eventDate).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}</span>
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditEvent(event.id)}
                    className="text-slate-600 hover:text-slate-800 p-2"
                    title="Edit event"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Remove from schedule"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {completedEvents.map((event) => (
            <div key={event.id} className="card p-4 bg-green-50 border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{event.eventTitle}</h3>
                    <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                      <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      <span>{new Date(event.eventDate).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}</span>
                      <span>{event.location}</span>
                      <span className="text-green-600 font-medium">Completed ({event.hoursWorked || 0} hrs)</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleViewDetails(event.id)}
                  className="text-slate-600 hover:text-slate-800 p-2"
                  title="View event details"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
