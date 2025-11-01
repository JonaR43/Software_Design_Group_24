import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { EventVolunteerService, EventService } from "~/services/api";

interface Volunteer {
  id: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  status: string;
  hoursWorked?: number;
  performanceRating?: number;
  feedback?: string;
  adminNotes?: string;
  participationDate: string;
}

export default function EventVolunteersPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    status: '',
    hoursWorked: '',
    performanceRating: '',
    feedback: '',
    adminNotes: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    if (!eventId) return;

    try {
      setIsLoading(true);
      const [eventData, assignmentsResponse] = await Promise.all([
        EventService.getEvents({ search: eventId }),
        EventVolunteerService.getEventVolunteers(eventId)
      ]);

      if (eventData.length > 0) {
        setEvent(eventData[0]);
      }

      // Transform the assignments data to match our interface
      const transformedVolunteers = assignmentsResponse.map((assignment: any) => ({
        id: assignment.id,
        volunteerId: assignment.volunteerId,
        volunteerName: assignment.volunteer?.profile
          ? `${assignment.volunteer.profile.firstName} ${assignment.volunteer.profile.lastName}`
          : assignment.volunteer?.username || 'Unknown',
        volunteerEmail: assignment.volunteer?.email || 'No email',
        status: assignment.status || 'pending',
        hoursWorked: assignment.hoursWorked,
        performanceRating: assignment.performanceRating,
        feedback: assignment.feedback,
        adminNotes: assignment.adminNotes,
        participationDate: assignment.assignedAt || assignment.createdAt
      }));

      setVolunteers(transformedVolunteers);
      setError("");
    } catch (err) {
      setError("Failed to load event volunteers");
      console.error("Error loading event volunteers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openReviewModal = (volunteer: Volunteer) => {
    console.log('Opening review modal for:', volunteer);
    setSelectedVolunteer(volunteer);
    const initialForm = {
      status: volunteer.status || '',
      hoursWorked: volunteer.hoursWorked?.toString() || '',
      performanceRating: volunteer.performanceRating?.toString() || '',
      feedback: volunteer.feedback || '',
      adminNotes: volunteer.adminNotes || ''
    };
    console.log('Initial form state:', initialForm);
    setReviewForm(initialForm);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedVolunteer(null);
    setReviewForm({
      status: '',
      hoursWorked: '',
      performanceRating: '',
      feedback: '',
      adminNotes: ''
    });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVolunteer || !eventId) return;

    console.log('Submitting review for:', {
      eventId,
      volunteerId: selectedVolunteer.volunteerId,
      reviewData: reviewForm
    });

    try {
      setIsSaving(true);
      setError("");

      const reviewData = {
        status: reviewForm.status || undefined,
        hoursWorked: reviewForm.hoursWorked ? parseFloat(reviewForm.hoursWorked) : undefined,
        performanceRating: reviewForm.performanceRating ? parseInt(reviewForm.performanceRating) : undefined,
        feedback: reviewForm.feedback || undefined,
        adminNotes: reviewForm.adminNotes || undefined
      };

      console.log('Review data to submit:', reviewData);

      await EventVolunteerService.updateVolunteerReview(
        eventId,
        selectedVolunteer.volunteerId,
        reviewData
      );

      console.log('Review saved successfully');

      // Reload data
      await loadData();
      closeReviewModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save review';
      setError(errorMessage);
      console.error("Error saving review:", err);
      alert('Error: ' + errorMessage); // Add alert for debugging
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'no_show':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading volunteers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/admin/events" className="text-indigo-600 hover:text-indigo-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-slate-900 title-gradient">
            Manage Event Volunteers
          </h1>
          {event && (
            <p className="text-slate-600 mt-1">
              {event.title} • {event.date}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Volunteers Table */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">
            Volunteers ({volunteers.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Volunteer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Feedback</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {volunteers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No volunteers assigned to this event yet
                  </td>
                </tr>
              ) : (
                volunteers.map((volunteer) => (
                  <tr key={volunteer.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-900">{volunteer.volunteerName}</div>
                      <div className="text-xs text-slate-500">{volunteer.volunteerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(volunteer.status)}`}>
                        {volunteer.status.replace('_', ' ').charAt(0).toUpperCase() + volunteer.status.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {volunteer.hoursWorked || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {volunteer.performanceRating ? (
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-slate-900 mr-1">{volunteer.performanceRating}</span>
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 max-w-xs truncate">
                        {volunteer.feedback || 'No feedback yet'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => openReviewModal(volunteer)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedVolunteer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-semibold text-slate-900">
                Review: {selectedVolunteer.volunteerName}
              </h2>
              <p className="text-slate-600 text-sm mt-1">{selectedVolunteer.volunteerEmail}</p>
            </div>

            <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Status
                </label>
                <select
                  value={reviewForm.status}
                  onChange={(e) => {
                    console.log('Status changed to:', e.target.value);
                    setReviewForm({ ...reviewForm, status: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isSaving}
                >
                  <option value="">Select status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="no_show">No Show</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Hours Worked */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Hours Worked
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={reviewForm.hoursWorked}
                  onChange={(e) => {
                    console.log('Hours changed to:', e.target.value);
                    setReviewForm({ ...reviewForm, hoursWorked: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.0"
                  disabled={isSaving}
                />
              </div>

              {/* Performance Rating */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Performance Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, performanceRating: rating.toString() })}
                      className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                        reviewForm.performanceRating === rating.toString()
                          ? 'border-yellow-400 bg-yellow-50 text-yellow-800'
                          : 'border-slate-300 text-slate-600 hover:border-yellow-300'
                      }`}
                    >
                      {rating} ★
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Feedback (Public)
                </label>
                <textarea
                  value={reviewForm.feedback}
                  onChange={(e) => {
                    console.log('Feedback changed to:', e.target.value);
                    setReviewForm({ ...reviewForm, feedback: e.target.value });
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Share feedback about the volunteer's performance..."
                  disabled={isSaving}
                />
              </div>

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Admin Notes (Internal)
                </label>
                <textarea
                  value={reviewForm.adminNotes}
                  onChange={(e) => {
                    console.log('Admin notes changed to:', e.target.value);
                    setReviewForm({ ...reviewForm, adminNotes: e.target.value });
                  }}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Internal notes for admin use only..."
                  disabled={isSaving}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeReviewModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
