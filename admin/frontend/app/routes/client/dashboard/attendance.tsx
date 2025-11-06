import { useState, useEffect } from "react";
import { AttendanceService, ScheduleService, type AttendanceStatus, HistoryService, type VolunteerHistoryRecord } from "~/services/api";
import { DataTransformer } from "~/services/api";

interface EventWithAttendance {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  status: AttendanceStatus;
  startDate: string;
  endDate: string;
}

export default function Attendance() {
  const [upcomingEvents, setUpcomingEvents] = useState<EventWithAttendance[]>([]);
  const [pastEvents, setPastEvents] = useState<VolunteerHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  // Load events and attendance status
  useEffect(() => {
    loadAttendanceData();
  }, []);

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Get upcoming events from schedule
      const schedule = await ScheduleService.getMySchedule();

      // Get attendance status for each event
      const eventsWithStatus = await Promise.all(
        schedule.map(async (event) => {
          try {
            const status = await AttendanceService.getMyAttendanceStatus(event.eventId);
            return {
              id: event.eventId,
              title: event.eventTitle,
              date: DataTransformer.formatDate(event.eventDate),
              time: "Event time",
              location: event.location,
              status,
              startDate: event.eventDate,
              endDate: event.eventDate
            };
          } catch (err) {
            console.error(`Failed to get status for event ${event.eventId}:`, err);
            return null;
          }
        })
      );

      setUpcomingEvents(eventsWithStatus.filter((e): e is EventWithAttendance => e !== null));

      // Get past events with attendance
      const history = await HistoryService.getMyHistory();
      const completed = history.filter(
        (record) => record.participationStatus === 'COMPLETED' || record.participationStatus === 'NO_SHOW'
      );
      setPastEvents(completed);
    } catch (err) {
      console.error("Failed to load attendance data:", err);
      setError(err instanceof Error ? err.message : "Failed to load attendance data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async (eventId: string) => {
    try {
      setProcessing(eventId);
      setError("");

      await AttendanceService.checkIn(eventId);

      // Reload data to get updated status
      await loadAttendanceData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check in");
    } finally {
      setProcessing(null);
    }
  };

  const handleCheckOut = async (eventId: string) => {
    try {
      setProcessing(eventId);
      setError("");

      const feedbackText = feedback[eventId] || "";
      await AttendanceService.checkOut(eventId, feedbackText);

      // Clear feedback
      setFeedback({ ...feedback, [eventId]: "" });

      // Reload data to get updated status
      await loadAttendanceData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check out");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    if (status.checkedOut) {
      return (
        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          Completed • {status.hoursWorked}h worked
        </span>
      );
    }

    if (status.checkedIn) {
      return (
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
          Checked In
        </span>
      );
    }

    if (status.canCheckIn) {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          Ready to Check In
        </span>
      );
    }

    return (
      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
        {status.attendance}
      </span>
    );
  };

  const getAttendanceBadge = (participationStatus: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      COMPLETED: { color: "bg-green-100 text-green-700", text: "Completed" },
      NO_SHOW: { color: "bg-red-100 text-red-700", text: "No Show" },
      CANCELLED: { color: "bg-gray-100 text-gray-700", text: "Cancelled" },
    };

    const badge = badges[participationStatus] || { color: "bg-gray-100 text-gray-700", text: participationStatus };

    return (
      <span className={`px-3 py-1 ${badge.color} rounded-full text-sm font-medium`}>
        {badge.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Attendance</h1>
          <p className="text-slate-600 mt-1">Check in and out of your events</p>
        </div>
        <button
          onClick={loadAttendanceData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Upcoming Events</h2>

        {upcomingEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming events assigned</p>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {event.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {event.location}
                      </div>
                    </div>
                    <div className="mt-3">
                      {getStatusBadge(event.status)}
                    </div>

                    {event.status.checkedIn && (
                      <div className="mt-3 text-sm text-gray-600">
                        <p>Checked in at: {event.status.checkInTime ? new Date(event.status.checkInTime).toLocaleTimeString() : 'N/A'}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    {event.status.canCheckIn && !event.status.checkedIn && (
                      <button
                        onClick={() => handleCheckIn(event.id)}
                        disabled={processing === event.id}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processing === event.id ? "Processing..." : "Check In"}
                      </button>
                    )}

                    {event.status.canCheckOut && event.status.checkedIn && !event.status.checkedOut && (
                      <div className="space-y-2">
                        <textarea
                          value={feedback[event.id] || ""}
                          onChange={(e) => setFeedback({ ...feedback, [event.id]: e.target.value })}
                          placeholder="Add feedback (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          rows={2}
                        />
                        <button
                          onClick={() => handleCheckOut(event.id)}
                          disabled={processing === event.id}
                          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === event.id ? "Processing..." : "Check Out"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Events */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Attendance History</h2>

        {pastEvents.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No attendance history yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Event</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Hours</th>
                </tr>
              </thead>
              <tbody>
                {pastEvents.map((event) => (
                  <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{event.eventTitle}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {DataTransformer.formatDate(event.eventDate)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">{event.location}</td>
                    <td className="py-3 px-4">
                      {getAttendanceBadge(event.participationStatus)}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {event.hoursWorked ? `${event.hoursWorked}h` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
