import { useState, useEffect } from 'react';
import { HistoryService, SkillsService, type VolunteerHistoryRecord } from '~/services/api';

export default function VolunteerHistoryPage() {
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'UPCOMING' | 'CANCELLED' | 'NO_SHOW'>('ALL');
  const [sortBy, setSortBy] = useState<keyof VolunteerHistoryRecord>('eventDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Backend data state
  const [history, setHistory] = useState<VolunteerHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Load history from backend
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const historyData = await HistoryService.getMyHistory();
        setHistory(historyData);
        setError("");
      } catch (err) {
        setError("Failed to load volunteer history");
        console.error("Error loading history:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading volunteer history...</p>
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

  const filteredHistory = history.filter(item => {
    if (filter === 'ALL') return true;
    return item.participationStatus === filter;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    // Handle date sorting
    if (sortBy === 'eventDate') {
      const aDate = new Date(aValue as string);
      const bDate = new Date(bValue as string);
      return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
    }

    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }

    // Handle number sorting
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'NO_SHOW': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toUpperCase()) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'NORMAL': case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalHours = history
    .filter(item => item.participationStatus === 'COMPLETED')
    .reduce((sum, item) => sum + (item.hoursWorked || 0), 0);

  const completedEvents = history.filter(item => item.participationStatus === 'COMPLETED').length;
  const upcomingEvents = history.filter(item => item.participationStatus === 'UPCOMING').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900">Volunteer History</h1>
        <p className="text-slate-600 mt-1">Track your volunteer participation and impact</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="title-gradient">Events Completed</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">{completedEvents}</p>
          <p className="text-sm text-slate-600">Total events attended</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="title-gradient">Total Hours</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">{totalHours}</p>
          <p className="text-sm text-slate-600">Hours volunteered</p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-violet-100 rounded-lg">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="title-gradient">Upcoming Events</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">{upcomingEvents}</p>
          <p className="text-sm text-slate-600">Events scheduled</p>
        </div>
      </div>

      {/* Filter and Sort Controls */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ALL">All Events</option>
              <option value="COMPLETED">Completed</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="eventDate">Date</option>
              <option value="eventTitle">Event Name</option>
              <option value="participationStatus">Status</option>
              <option value="hoursWorked">Hours</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-4">
        {sortedHistory.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-slate-600">No volunteer history found.</p>
          </div>
        ) : (
          sortedHistory.map((item) => (
            <div key={item.id} className="card p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-1">{item.eventTitle}</h3>
                      <p className="text-slate-600 text-sm mb-2">{item.eventDescription}</p>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {item.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(item.eventDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.participationStatus)}`}>
                        {item.participationStatus.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(item.urgencyLevel)}`}>
                        {item.urgencyLevel}
                      </span>
                    </div>
                  </div>

                  {item.requiredSkills.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-slate-700 mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {item.requiredSkills.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.participationStatus === 'COMPLETED' && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-700">Hours Worked:</p>
                          <p className="text-sm text-slate-600">{item.hoursWorked || 0} hours</p>
                        </div>
                        {item.feedback && (
                          <div>
                            <p className="text-sm font-medium text-slate-700">Feedback:</p>
                            <p className="text-sm text-slate-600">{item.feedback}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}