import { useState, useEffect } from "react";
import { DashboardService, type DashboardStats, HistoryService, API_BASE_URL } from "~/services/api";
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

        if (user?.role === 'volunteer') {
          // For volunteers, get both their assignments (upcoming) and history (completed)
          const [myEventsResponse, historyRecords] = await Promise.all([
            fetch(`${API_BASE_URL}/events/my-events`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              }
            }),
            HistoryService.getMyHistory()
          ]);

          let upcomingEvents = 0;
          let recentActivities: any[] = [];

          if (myEventsResponse.ok) {
            const myEventsData = await myEventsResponse.json();
            upcomingEvents = myEventsData.data?.events?.length || 0;

            // Get recent upcoming events for activity feed
            if (myEventsData.data?.events) {
              recentActivities = myEventsData.data.events.slice(0, 3).map((event: any) => ({
                eventTitle: event.title,
                eventDate: event.startDate,
                status: 'UPCOMING',
                hoursWorked: 0
              }));
            }
          }

          // Add completed events to activity feed
          const completedEvents = historyRecords
            .filter(record => record.participationStatus === 'COMPLETED')
            .slice(0, 3)
            .map(record => ({
              eventTitle: record.eventTitle,
              eventDate: record.eventDate,
              status: 'COMPLETED',
              hoursWorked: record.hoursWorked
            }));

          // Merge and sort activities by date
          const allActivities = [...recentActivities, ...completedEvents]
            .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
            .slice(0, 3);

          // Calculate total hours from history
          const totalHours = historyRecords
            .filter(record => record.participationStatus === 'COMPLETED')
            .reduce((sum, record) => sum + (record.hoursWorked || 0), 0);

          const hoursLast30Days = historyRecords
            .filter(record => {
              const recordDate = new Date(record.eventDate);
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
              return record.participationStatus === 'COMPLETED' && recordDate >= thirtyDaysAgo;
            })
            .reduce((sum, record) => sum + (record.hoursWorked || 0), 0);

          // Calculate reliability score (attendance rate)
          const presentEvents = historyRecords.filter(r => r.attendance === 'PRESENT').length;
          const reliabilityScore = historyRecords.length > 0
            ? Math.round((presentEvents / historyRecords.length) * 100)
            : 0;

          // Create dashboard stats from the data
          const dashboardStats: DashboardStats = {
            overview: {
              totalVolunteers: 1,
              totalEvents: upcomingEvents,
              totalHours: totalHours,
              averageReliability: reliabilityScore
            },
            recentActivity: {
              last30Days: upcomingEvents,
              completedLast30Days: historyRecords.filter(r => r.participationStatus === 'COMPLETED').length,
              hoursLast30Days: hoursLast30Days,
              activities: allActivities
            },
            topPerformers: []
          };

          setStats(dashboardStats);
        } else {
          // For admins, use the existing dashboard service
          const dashboardStats = await DashboardService.getDashboardStats();
          setStats(dashboardStats);
        }

        setError("");
      } catch (err) {
        setError("Failed to load dashboard statistics");
        console.error("Error loading dashboard stats:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, [user]);

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
