import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { HistoryService, type VolunteerHistoryRecord, API_BASE_URL, AttendanceService } from "~/services/api";
import { showSuccess, showError, showInfo } from "~/utils/toast";

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
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<MyEvent[]>([]);
  const [completedEvents, setCompletedEvents] = useState<VolunteerHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Edit modal state
  const [editingEvent, setEditingEvent] = useState<MyEvent | null>(null);
  const [editNotes, setEditNotes] = useState("");

  // Check-in/check-out state
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, any>>({});
  const [checkInProcessing, setCheckInProcessing] = useState<Set<string>>(new Set());

  // Load schedule data from backend
  useEffect(() => {
    const loadSchedule = async () => {
      try {
        setIsLoading(true);
        setError("");

        // Get upcoming events from assignments (my-events endpoint)
        const response = await fetch(`${API_BASE_URL}/events/my-events?timeFilter=upcoming&limit=100`, {
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
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

  // Load attendance status for upcoming events
  useEffect(() => {
    const loadAttendanceStatus = async () => {
      for (const event of upcomingEvents) {
        try {
          const status = await AttendanceService.getMyAttendanceStatus(event.id);
          setAttendanceStatus(prev => ({ ...prev, [event.id]: status }));
        } catch (err) {
          // Ignore errors for events user hasn't registered for
          console.log(`No attendance status for event ${event.id}`);
        }
      }
    };

    if (upcomingEvents.length > 0) {
      loadAttendanceStatus();
    }
  }, [upcomingEvents]);

  const handleEditEvent = (eventId: string) => {
    const event = upcomingEvents.find(e => e.id === eventId);
    if (event) {
      setEditingEvent(event);
      setEditNotes(event.assignment.notes || '');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEvent) return;

    try {
      const response = await fetch(`${API_BASE_URL}/events/${editingEvent.id}/update-notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ notes: editNotes })
      });

      if (response.ok) {
        // Update local state
        setUpcomingEvents(events =>
          events.map(event =>
            event.id === editingEvent.id
              ? { ...event, assignment: { ...event.assignment, notes: editNotes } }
              : event
          )
        );
        setEditingEvent(null);
        setEditNotes('');
        showSuccess('Notes updated successfully!');
      } else {
        const errorData = await response.json();
        showError(`Failed to update notes: ${errorData.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error updating notes:', err);
      showError('Failed to update notes');
    }
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setEditNotes('');
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to remove this event from your schedule?')) {
      // Call API to leave event
      fetch(`${API_BASE_URL}/events/${eventId}/leave`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })
        .then(response => {
          if (response.ok) {
            setUpcomingEvents(events => events.filter(event => event.id !== eventId));
            showSuccess('Successfully removed event from your schedule');
          } else {
            return response.json().then(data => {
              throw new Error(data.message || 'Failed to remove event');
            });
          }
        })
        .catch(err => {
          console.error('Error removing event:', err);
          showError(`Failed to remove event: ${err.message}`);
        });
    }
  };

  const handleViewDetails = (eventId: string) => {
    showInfo(`View details functionality for event ${eventId} would show more information here.`);
  };

  const handleExportSchedule = () => {
    showInfo('Export schedule functionality would generate a PDF or CSV file of your schedule.');
  };

  const handleAddAvailability = () => {
    navigate('/dashboard/availability');
  };

  const handleCheckIn = async (eventId: string) => {
    setCheckInProcessing(prev => new Set(prev).add(eventId));
    try {
      // Try to get GPS coordinates
      let latitude, longitude;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (geoError) {
          console.log('Could not get GPS coordinates:', geoError);
        }
      }

      const result = await AttendanceService.checkIn(eventId, { latitude, longitude });

      // Reload attendance status
      const status = await AttendanceService.getMyAttendanceStatus(eventId);
      setAttendanceStatus(prev => ({ ...prev, [eventId]: status }));

      showSuccess(`Successfully checked in at ${new Date(result.checkInTime).toLocaleTimeString()}!`);
    } catch (err) {
      showError(`Failed to check in: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCheckInProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  const handleCheckOut = async (eventId: string) => {
    const feedback = prompt('Optional: Add feedback about your volunteer experience:');

    setCheckInProcessing(prev => new Set(prev).add(eventId));
    try {
      const result = await AttendanceService.checkOut(eventId, feedback || undefined);

      // Reload attendance status
      const status = await AttendanceService.getMyAttendanceStatus(eventId);
      setAttendanceStatus(prev => ({ ...prev, [eventId]: status }));

      showSuccess(
        `Successfully checked out! Check-out time: ${new Date(result.checkOutTime).toLocaleTimeString()}. Hours worked: ${result.hoursWorked}`,
        { duration: 5000 }
      );

      // Reload schedule to refresh completed events
      const allHistory = await HistoryService.getMyHistory();
      const completed = allHistory.filter(record =>
        record.participationStatus === 'COMPLETED'
      );
      setCompletedEvents(completed);
    } catch (err) {
      showError(`Failed to check out: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setCheckInProcessing(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
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
        {upcomingEvents.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-slate-600">No upcoming events scheduled</p>
            <p className="text-sm text-slate-500 mt-2">Join events to see them appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingEvents.map((event) => {
              // Build location from address components if needed
              const location = event.location ||
                (event.address ? `${event.address}, ${event.city || ''}, ${event.state || ''} ${event.zipCode || ''}`.trim() : 'Location TBD');

              return (
                <div key={event.id} className="card p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-gradient-to-r from-indigo-100 to-violet-100 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{event.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                            <span>{new Date(event.startDate).toLocaleDateString()}</span>
                            <span>{new Date(event.startDate).toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}</span>
                            <span>{location}</span>
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

                    {/* Check-in/Check-out Section */}
                    {(() => {
                      const status = attendanceStatus[event.id];
                      const isProcessing = checkInProcessing.has(event.id);
                      const eventStart = new Date(event.startDate);
                      const eventEnd = new Date(event.endDate);
                      const now = new Date();
                      const canCheckIn = now >= new Date(eventStart.getTime() - 30 * 60 * 1000) && now <= eventEnd;

                      if (status?.hasCheckedIn && !status?.hasCheckedOut) {
                        return (
                          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-green-700">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="font-medium">Checked In at {new Date(status.checkInTime).toLocaleTimeString()}</span>
                            </div>
                            <button
                              onClick={() => handleCheckOut(event.id)}
                              disabled={isProcessing}
                              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? 'Processing...' : 'Check Out'}
                            </button>
                          </div>
                        );
                      } else if (status?.hasCheckedOut) {
                        return (
                          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="font-medium">Completed - {status.hoursWorked || 0} hours worked</span>
                          </div>
                        );
                      } else if (canCheckIn) {
                        return (
                          <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <span className="text-sm text-indigo-700 font-medium">Ready to check in</span>
                            <button
                              onClick={() => handleCheckIn(event.id)}
                              disabled={isProcessing}
                              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isProcessing ? 'Processing...' : 'Check In'}
                            </button>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
        {upcomingEvents.length === 0 && completedEvents.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-slate-600">No recent activity</p>
            <p className="text-sm text-slate-500 mt-2">Join events to see your activity here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Show completed events */}
            {completedEvents.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-slate-700">Completed Events</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {completedEvents.slice(0, 4).map((event) => {
                    const eventDate = new Date(event.eventDate);

                    return (
                      <div key={event.id} className="card p-4 bg-green-50 border-green-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-900 truncate">{event.eventTitle}</h3>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  {eventDate.toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {event.location}
                                </span>
                                <span className="text-green-600 font-medium flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {event.hoursWorked || 0} hrs
                                </span>
                              </div>
                              {event.feedback && (
                                <p className="text-xs text-slate-500 mt-2 italic line-clamp-2">"{event.feedback}"</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Show recent upcoming events */}
            {upcomingEvents.length > 0 && (
              <>
                <h3 className="text-sm font-medium text-slate-700 mt-4">Recently Joined</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {upcomingEvents.slice(0, 4).map((event) => {
                    const eventDate = new Date(event.startDate);
                    const location = event.location ||
                      (event.address ? `${event.address}, ${event.city || ''}, ${event.state || ''} ${event.zipCode || ''}`.trim() : 'Location TBD');

                    return (
                      <div key={event.id} className="card p-4 bg-blue-50 border-blue-200">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-900 truncate">{event.title}</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600 mt-1">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {eventDate.toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {location}
                              </span>
                              <span className="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs rounded-full font-medium">
                                Upcoming
                              </span>
                            </div>
                            {event.assignment.notes && (
                              <p className="text-xs text-slate-500 mt-2 italic line-clamp-2">Note: {event.assignment.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-slate-900">Edit Event Assignment</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Event Details (Read-only) */}
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">{editingEvent.title}</h3>
                <p className="text-sm text-slate-600 mb-3">{editingEvent.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(editingEvent.startDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(editingEvent.startDate).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {editingEvent.location ||
                      (editingEvent.address ? `${editingEvent.address}, ${editingEvent.city}, ${editingEvent.state}` : 'Location TBD')}
                  </div>
                </div>
              </div>

              {/* Editable Notes Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Notes
                  <span className="text-slate-500 font-normal ml-2">(Optional - Add any personal notes or reminders)</span>
                </label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Add notes about your availability, special requirements, questions, etc."
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  rows={4}
                />
                <p className="text-xs text-slate-500 mt-1">
                  These notes are visible to event administrators
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-700 to-violet-700 text-white rounded-lg hover:from-indigo-600 hover:to-violet-600 transition"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
