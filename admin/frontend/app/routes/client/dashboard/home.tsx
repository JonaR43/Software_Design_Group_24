import { useState, useEffect } from "react";
import { DashboardService, type DashboardStats } from "~/services/api";
import { useAuth } from "~/contexts/AuthContext";

export default function Home() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true);
        const dashboardStats = await DashboardService.getDashboardStats();
        setStats(dashboardStats);
        setError("");
      } catch (err) {
        setError("Failed to load dashboard statistics");
        console.error("Error loading dashboard stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
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

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-6 border border-indigo-100">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">
          Welcome back{user?.username ? `, ${user.username}` : ''}!
        </h1>
        <p className="text-slate-600">
          {user?.role === 'admin' ? 'Admin dashboard overview' : 'Your volunteer dashboard overview'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="title-gradient">
              {user?.role === 'admin' ? 'Total Events' : 'Upcoming Events'}
            </h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">
            {stats?.overview.totalEvents || 0}
          </p>
          <p className="text-sm text-slate-600">
            {user?.role === 'admin' ? 'Events in system' : 'Events this week'}
          </p>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-sky-100 rounded-lg">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="title-gradient">
              {user?.role === 'admin' ? 'Total Hours' : 'Hours This Month'}
            </h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">
            {stats?.overview.totalHours || 0}
          </p>
          <p className="text-sm text-slate-600">
            {user?.role === 'admin' ? 'Total volunteer hours' : `${stats?.recentActivity.hoursLast30Days || 0} this month`}
          </p>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-fuchsia-100 rounded-lg">
              <svg className="w-5 h-5 text-fuchsia-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 14H3l5-5v5z" />
              </svg>
            </div>
            <h3 className="title-gradient">
              {user?.role === 'admin' ? 'Total Volunteers' : 'Impact Score'}
            </h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">
            {user?.role === 'admin' ? (stats?.overview.totalVolunteers || 0) : (stats?.overview.averageReliability || 0)}
          </p>
          <p className="text-sm text-slate-600">
            {user?.role === 'admin' ? 'Active volunteers' : 'Your reliability score'}
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="title-gradient mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {stats?.recentActivity?.activities && stats.recentActivity.activities.length > 0 ? (
            stats.recentActivity.activities.slice(0, 3).map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={index === 0 ? "dot-indigo" : index === 1 ? "dot-sky" : "dot-fuchsia"} />
                <div>
                  <p className="text-sm font-medium text-slate-900">{activity.eventTitle}</p>
                  <p className="text-xs text-slate-600">
                    {activity.status === 'COMPLETED'
                      ? `Completed ${activity.hoursWorked || 0} hours • ${new Date(activity.eventDate).toLocaleDateString()}`
                      : activity.status === 'UPCOMING'
                      ? `Upcoming • ${new Date(activity.eventDate).toLocaleDateString()}`
                      : `${activity.status} • ${new Date(activity.eventDate).toLocaleDateString()}`
                    }
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
              <div className="dot-sky" />
              <div>
                <p className="text-sm font-medium text-slate-900">No recent activity</p>
                <p className="text-xs text-slate-600">Join some events to see your activity here</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
