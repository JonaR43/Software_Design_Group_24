import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { AttendanceService, type AttendanceRoster, type AttendanceRosterVolunteer } from "~/services/api";
import { DataTransformer } from "~/services/api";

export default function AttendanceRoster() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [roster, setRoster] = useState<AttendanceRoster | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [selectedVolunteers, setSelectedVolunteers] = useState<Set<string>>(new Set());
  const [editingVolunteer, setEditingVolunteer] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<AttendanceRosterVolunteer>>({});

  useEffect(() => {
    if (eventId) {
      loadRoster();
    }
  }, [eventId]);

  const loadRoster = async () => {
    if (!eventId) return;

    try {
      setIsLoading(true);
      setError("");

      const data = await AttendanceService.getEventRoster(eventId);
      setRoster(data);
    } catch (err) {
      console.error("Failed to load roster:", err);
      setError(err instanceof Error ? err.message : "Failed to load roster");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckboxChange = (volunteerId: string) => {
    const newSelected = new Set(selectedVolunteers);
    if (newSelected.has(volunteerId)) {
      newSelected.delete(volunteerId);
    } else {
      newSelected.add(volunteerId);
    }
    setSelectedVolunteers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedVolunteers.size === roster?.roster.length) {
      setSelectedVolunteers(new Set());
    } else {
      setSelectedVolunteers(new Set(roster?.roster.map((v) => v.volunteerId) || []));
    }
  };

  const handleEdit = (volunteer: AttendanceRosterVolunteer) => {
    setEditingVolunteer(volunteer.volunteerId);
    setEditFormData({
      attendance: volunteer.attendance,
      hoursWorked: volunteer.hoursWorked,
      performanceRating: volunteer.performanceRating,
      adminNotes: volunteer.adminNotes,
    });
  };

  const handleSaveEdit = async () => {
    if (!eventId || !editingVolunteer) return;

    try {
      setProcessing(true);
      setError("");

      await AttendanceService.updateAttendance(eventId, editingVolunteer, {
        attendance: editFormData.attendance,
        hoursWorked: editFormData.hoursWorked,
        performanceRating: editFormData.performanceRating,
        adminNotes: editFormData.adminNotes,
      });

      setEditingVolunteer(null);
      await loadRoster();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update attendance");
    } finally {
      setProcessing(false);
    }
  };

  const handleMarkNoShow = async (volunteerId: string) => {
    if (!eventId || !confirm("Mark this volunteer as no-show?")) return;

    try {
      setProcessing(true);
      setError("");

      await AttendanceService.markNoShow(eventId, volunteerId, {
        sendNotification: true,
        adminNotes: "Marked as no-show by administrator",
      });

      await loadRoster();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark as no-show");
    } finally {
      setProcessing(false);
    }
  };

  const handleBulkMarkPresent = async () => {
    if (!eventId || selectedVolunteers.size === 0) return;

    try {
      setProcessing(true);
      setError("");

      const updates = Array.from(selectedVolunteers).map((volunteerId) => ({
        volunteerId,
        data: {
          attendance: 'PRESENT' as const,
        },
      }));

      await AttendanceService.bulkUpdateAttendance(eventId, updates);
      setSelectedVolunteers(new Set());
      await loadRoster();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to bulk update");
    } finally {
      setProcessing(false);
    }
  };

  const handleFinalizeEvent = async () => {
    if (!eventId || !confirm("Finalize this event? This will auto-checkout volunteers and mark no-shows.")) return;

    try {
      setProcessing(true);
      setError("");

      const result = await AttendanceService.finalizeEventAttendance(eventId);

      alert(
        `Event finalized!\n\n` +
        `Total volunteers: ${result.summary.totalVolunteers}\n` +
        `Auto-checked out: ${result.summary.autoCheckedOut}\n` +
        `Marked no-show: ${result.summary.markedNoShow}`
      );

      await loadRoster();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to finalize event");
    } finally {
      setProcessing(false);
    }
  };

  const getAttendanceBadge = (attendance: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      PRESENT: { color: "bg-green-100 text-green-700", text: "Present" },
      LATE: { color: "bg-yellow-100 text-yellow-700", text: "Late" },
      ABSENT: { color: "bg-red-100 text-red-700", text: "Absent" },
      PENDING: { color: "bg-gray-100 text-gray-700", text: "Pending" },
    };

    const badge = badges[attendance] || { color: "bg-gray-100 text-gray-700", text: attendance };

    return (
      <span className={`px-2 py-1 ${badge.color} rounded text-xs font-medium`}>
        {badge.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      COMPLETED: { color: "bg-blue-100 text-blue-700", text: "Completed" },
      CONFIRMED: { color: "bg-green-100 text-green-700", text: "Confirmed" },
      NO_SHOW: { color: "bg-red-100 text-red-700", text: "No Show" },
      REGISTERED: { color: "bg-gray-100 text-gray-700", text: "Registered" },
    };

    const badge = badges[status] || { color: "bg-gray-100 text-gray-700", text: status };

    return (
      <span className={`px-2 py-1 ${badge.color} rounded text-xs font-medium`}>
        {badge.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event roster...</p>
        </div>
      </div>
    );
  }

  if (!roster) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Event not found</p>
        <button
          onClick={() => navigate('/dashboard/admin/attendance')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/dashboard/admin/attendance')}
            className="text-indigo-600 hover:text-indigo-700 mb-2 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Events
          </button>
          <h1 className="text-3xl font-bold text-slate-900">{roster.event.title}</h1>
          <p className="text-slate-600 mt-1">
            {DataTransformer.formatDate(roster.event.startDate)} - Event Attendance Roster
          </p>
        </div>
        <button
          onClick={handleFinalizeEvent}
          disabled={processing || roster.event.status === 'COMPLETED'}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {roster.event.status === 'COMPLETED' ? 'Event Finalized' : 'Finalize Event'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{roster.summary.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-4">
          <p className="text-sm text-green-600">Present</p>
          <p className="text-2xl font-bold text-green-700">{roster.summary.present}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg shadow p-4">
          <p className="text-sm text-yellow-600">Late</p>
          <p className="text-2xl font-bold text-yellow-700">{roster.summary.late}</p>
        </div>
        <div className="bg-red-50 rounded-lg shadow p-4">
          <p className="text-sm text-red-600">Absent</p>
          <p className="text-2xl font-bold text-red-700">{roster.summary.absent}</p>
        </div>
        <div className="bg-gray-50 rounded-lg shadow p-4">
          <p className="text-sm text-gray-600">No Show</p>
          <p className="text-2xl font-bold text-gray-700">{roster.summary.noShow}</p>
        </div>
        <div className="bg-blue-50 rounded-lg shadow p-4">
          <p className="text-sm text-blue-600">Checked In</p>
          <p className="text-2xl font-bold text-blue-700">{roster.summary.checkedIn}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg shadow p-4">
          <p className="text-sm text-indigo-600">Checked Out</p>
          <p className="text-2xl font-bold text-indigo-700">{roster.summary.checkedOut}</p>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedVolunteers.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-indigo-900 font-medium">
            {selectedVolunteers.size} volunteer(s) selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleBulkMarkPresent}
              disabled={processing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Mark as Present
            </button>
            <button
              onClick={() => setSelectedVolunteers(new Set())}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Roster Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedVolunteers.size === roster.roster.length && roster.roster.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Volunteer</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Contact</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Attendance</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Check In/Out</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Hours</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Rating</th>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roster.roster.map((volunteer) => (
                <tr key={volunteer.volunteerId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedVolunteers.has(volunteer.volunteerId)}
                      onChange={() => handleCheckboxChange(volunteer.volunteerId)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{volunteer.volunteerName}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-600">{volunteer.email}</div>
                    {volunteer.phone && <div className="text-sm text-gray-500">{volunteer.phone}</div>}
                  </td>
                  <td className="py-3 px-4">
                    {editingVolunteer === volunteer.volunteerId ? (
                      <select
                        value={editFormData.attendance || volunteer.attendance}
                        onChange={(e) => setEditFormData({ ...editFormData, attendance: e.target.value as any })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PRESENT">Present</option>
                        <option value="LATE">Late</option>
                        <option value="ABSENT">Absent</option>
                      </select>
                    ) : (
                      getAttendanceBadge(volunteer.attendance)
                    )}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(volunteer.participationStatus)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {volunteer.checkInTime && <div>In: {new Date(volunteer.checkInTime).toLocaleTimeString()}</div>}
                    {volunteer.checkOutTime && <div>Out: {new Date(volunteer.checkOutTime).toLocaleTimeString()}</div>}
                    {!volunteer.checkInTime && !volunteer.checkOutTime && '-'}
                  </td>
                  <td className="py-3 px-4">
                    {editingVolunteer === volunteer.volunteerId ? (
                      <input
                        type="number"
                        value={editFormData.hoursWorked ?? volunteer.hoursWorked}
                        onChange={(e) => setEditFormData({ ...editFormData, hoursWorked: parseFloat(e.target.value) })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        step="0.25"
                        min="0"
                      />
                    ) : (
                      <span className="text-gray-900">{volunteer.hoursWorked || 0}h</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingVolunteer === volunteer.volunteerId ? (
                      <input
                        type="number"
                        value={editFormData.performanceRating ?? volunteer.performanceRating ?? ''}
                        onChange={(e) => setEditFormData({ ...editFormData, performanceRating: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        min="1"
                        max="5"
                        placeholder="1-5"
                      />
                    ) : (
                      <span className="text-gray-900">{volunteer.performanceRating ? `${volunteer.performanceRating}/5` : '-'}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingVolunteer === volunteer.volunteerId ? (
                      <div className="flex gap-1">
                        <button
                          onClick={handleSaveEdit}
                          disabled={processing}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingVolunteer(null)}
                          className="px-3 py-1 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(volunteer)}
                          className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
                        >
                          Edit
                        </button>
                        {volunteer.participationStatus !== 'NO_SHOW' && (
                          <button
                            onClick={() => handleMarkNoShow(volunteer.volunteerId)}
                            disabled={processing}
                            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                          >
                            No Show
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {roster.roster.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No volunteers assigned to this event
          </div>
        )}
      </div>
    </div>
  );
}
