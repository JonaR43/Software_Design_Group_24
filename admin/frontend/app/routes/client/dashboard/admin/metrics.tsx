import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { HttpClient } from "~/services/api";

interface MetricsData {
  overview: {
    totalUsers: number;
    adminUsers: number;
    volunteerUsers: number;
    verifiedUsers: number;
    totalEvents: number;
    publishedEvents: number;
    completedEvents: number;
    totalHoursVolunteered: number;
    averageHoursPerEvent: number;
    attendanceRate: number;
    capacityUtilization: number;
  };
  userRegistrationTrend: Array<{
    month: string;
    users: number;
    volunteers: number;
    admins: number;
  }>;
  eventStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: string;
  }>;
  categoryMetrics: Array<{
    category: string;
    events: number;
    volunteers: number;
    capacity: number;
    utilization: string;
  }>;
  topVolunteers: Array<{
    id: string;
    name: string;
    hours: number;
    events: number;
    avgRating: string | number;
  }>;
  ratingDistribution: Array<{
    rating: string;
    count: number;
  }>;
  avgRating: number;
  monthlyHoursTrend: Array<{
    month: string;
    hours: number;
    participants: number;
  }>;
  participationMetrics: {
    completed: number;
    noShows: number;
    cancelled: number;
    total: number;
  };
}

const COLORS = ['#4F46E5', '#06B6D4', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await HttpClient.get<{
        status: string;
        data: MetricsData;
      }>('/admin/metrics');

      if (response.status === 'success') {
        setMetrics(response.data);
        setError("");
      }
    } catch (err) {
      setError("Failed to load metrics");
      console.error("Error loading metrics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

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

  if (error || !metrics) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        {error || "Failed to load metrics"}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 title-gradient">Analytics & Metrics</h1>
          <p className="text-slate-600 mt-2">Platform performance and insights</p>
        </div>
        <button
          onClick={loadMetrics}
          className="bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-lg text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2 w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 bg-gradient-to-br from-indigo-50 to-indigo-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">Total Users</p>
              <p className="text-3xl font-bold text-indigo-900 mt-1">{metrics.overview.totalUsers}</p>
              <p className="text-xs text-indigo-600 mt-1">
                {metrics.overview.volunteerUsers} volunteers, {metrics.overview.adminUsers} admins
              </p>
            </div>
            <div className="h-12 w-12 bg-indigo-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-sky-50 to-sky-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-sky-600 font-medium">Total Events</p>
              <p className="text-3xl font-bold text-sky-900 mt-1">{metrics.overview.totalEvents}</p>
              <p className="text-xs text-sky-600 mt-1">
                {metrics.overview.publishedEvents} published, {metrics.overview.completedEvents} completed
              </p>
            </div>
            <div className="h-12 w-12 bg-sky-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-violet-50 to-violet-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-600 font-medium">Total Hours</p>
              <p className="text-3xl font-bold text-violet-900 mt-1">{metrics.overview.totalHoursVolunteered}</p>
              <p className="text-xs text-violet-600 mt-1">
                {metrics.overview.averageHoursPerEvent} hrs avg per event
              </p>
            </div>
            <div className="h-12 w-12 bg-violet-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-fuchsia-50 to-fuchsia-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-fuchsia-600 font-medium">Attendance Rate</p>
              <p className="text-3xl font-bold text-fuchsia-900 mt-1">{metrics.overview.attendanceRate}%</p>
              <p className="text-xs text-fuchsia-600 mt-1">
                Capacity: {metrics.overview.capacityUtilization}%
              </p>
            </div>
            <div className="h-12 w-12 bg-fuchsia-200 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-fuchsia-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">User Registration Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metrics.userRegistrationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#4F46E5" strokeWidth={2} name="Total Users" />
              <Line type="monotone" dataKey="volunteers" stroke="#06B6D4" strokeWidth={2} name="Volunteers" />
              <Line type="monotone" dataKey="admins" stroke="#8B5CF6" strokeWidth={2} name="Admins" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event Status Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Event Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.eventStatusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.status}: ${entry.count}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {metrics.eventStatusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Hours Trend */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Volunteer Hours Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.monthlyHoursTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="hours" fill="#4F46E5" name="Total Hours" />
              <Bar dataKey="participants" fill="#06B6D4" name="Participants" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Event Categories Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.categoryMetrics} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis dataKey="category" type="category" stroke="#64748b" style={{ fontSize: '12px' }} width={100} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="events" fill="#8B5CF6" name="Events" />
              <Bar dataKey="volunteers" fill="#EC4899" name="Volunteers" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Ratings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Performance Ratings
            <span className="ml-2 text-sm text-slate-600">(Avg: {metrics.avgRating} ⭐)</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.ratingDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="rating" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              />
              <Bar dataKey="count" fill="#F59E0B" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Participation Metrics */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Participation Breakdown</h3>
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-sm font-medium text-green-800">Completed</span>
              <span className="text-xl font-bold text-green-900">{metrics.participationMetrics.completed}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <span className="text-sm font-medium text-red-800">No Shows</span>
              <span className="text-xl font-bold text-red-900">{metrics.participationMetrics.noShows}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm font-medium text-yellow-800">Cancelled</span>
              <span className="text-xl font-bold text-yellow-900">{metrics.participationMetrics.cancelled}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
              <span className="text-sm font-medium text-slate-800">Total Participations</span>
              <span className="text-xl font-bold text-slate-900">{metrics.participationMetrics.total}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Volunteers */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Top Volunteers</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Volunteer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Events</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Avg Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {metrics.topVolunteers.map((volunteer, index) => (
                <tr key={volunteer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-2xl font-bold text-slate-300">#{index + 1}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900">{volunteer.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-indigo-600">{volunteer.hours} hrs</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{volunteer.events} events</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{volunteer.avgRating} ⭐</span>
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
