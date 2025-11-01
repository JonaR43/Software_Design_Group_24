import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { UserService } from "~/services/api";

export default function VolunteerMetricsPage() {
  const { userId } = useParams();
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadMetrics = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const data = await UserService.getVolunteerMetrics(userId);
        setMetrics(data);
        setError("");
      } catch (err) {
        setError("Failed to load volunteer metrics");
        console.error("Error loading volunteer metrics:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, [userId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        {error}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl">
        No metrics data available
      </div>
    );
  }

  const { volunteer, overview, ratingDistribution, monthlyActivity, categoryBreakdown, recentEvents } = metrics;

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/admin/users" className="text-indigo-600 hover:text-indigo-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 title-gradient">
            Volunteer Metrics: {volunteer.name}
          </h1>
          <p className="text-slate-600 mt-1">
            {volunteer.email} • Joined {new Date(volunteer.joinedDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="text-sm text-slate-600 mb-1">Total Events</div>
          <div className="text-3xl font-bold text-slate-900">{overview.totalEvents}</div>
          <div className="text-xs text-slate-500 mt-1">
            {overview.completedEvents} completed, {overview.upcomingEvents} upcoming
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm text-slate-600 mb-1">Total Hours</div>
          <div className="text-3xl font-bold text-slate-900">{overview.totalHours}</div>
          <div className="text-xs text-slate-500 mt-1">
            {overview.averageHoursPerEvent} hrs/event average
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm text-slate-600 mb-1">Attendance Rate</div>
          <div className="text-3xl font-bold text-slate-900">{overview.attendanceRate}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {overview.noShows} no-shows, {overview.cancelled} cancelled
          </div>
        </div>

        <div className="card p-6">
          <div className="text-sm text-slate-600 mb-1">Average Rating</div>
          <div className="text-3xl font-bold text-slate-900">
            {overview.averageRating ? overview.averageRating : 'N/A'}
          </div>
          {overview.averageRating && (
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`w-4 h-4 ${star <= Math.round(overview.averageRating) ? 'text-yellow-400' : 'text-slate-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Activity Chart */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Monthly Activity</h2>
        <div className="space-y-4">
          {monthlyActivity.map((month: any) => (
            <div key={month.month}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">{month.month}</span>
                <span className="text-sm text-slate-600">
                  {month.completed} events • {month.hours} hours
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${(month.completed / Math.max(...monthlyActivity.map((m: any) => m.completed), 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Distribution and Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Rating Distribution</h2>
          <div className="space-y-3">
            {ratingDistribution.map((rating: any) => (
              <div key={rating.rating} className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700 w-16">{rating.rating}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${(rating.count / Math.max(...ratingDistribution.map((r: any) => r.count), 1)) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-slate-600 w-8 text-right">{rating.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Events by Category</h2>
          <div className="space-y-3">
            {categoryBreakdown.map((category: any) => (
              <div key={category.category} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-700 capitalize">{category.category}</div>
                  <div className="text-xs text-slate-500">{category.events} events • {category.hours} hours</div>
                </div>
                <div className="text-sm font-semibold text-indigo-600">{category.events}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-900">Recent Events</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {recentEvents.map((event: any) => (
                <tr key={event.eventId} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-900">{event.eventName}</div>
                    <div className="text-xs text-slate-500 capitalize">{event.eventCategory}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(event.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      event.status === 'completed' ? 'bg-green-100 text-green-800' :
                      event.status === 'no_show' ? 'bg-red-100 text-red-800' :
                      event.status === 'cancelled' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {event.status.replace('_', ' ').charAt(0).toUpperCase() + event.status.replace('_', ' ').slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {event.hours || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {event.rating ? (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-slate-900 mr-1">{event.rating}</span>
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
