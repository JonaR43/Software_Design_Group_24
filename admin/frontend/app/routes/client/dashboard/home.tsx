export default function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl p-6 border border-indigo-100">
        <h1 className="text-3xl font-semibold text-slate-900 mb-2">Welcome back!</h1>
        <p className="text-slate-600">Here's your volunteer dashboard overview</p>
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
            <h3 className="title-gradient">Upcoming Events</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">3</p>
          <p className="text-sm text-slate-600">Events this week</p>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-sky-100 rounded-lg">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="title-gradient">Hours This Month</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">24</p>
          <p className="text-sm text-slate-600">8 hours remaining</p>
        </div>
        
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-fuchsia-100 rounded-lg">
              <svg className="w-5 h-5 text-fuchsia-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 14H3l5-5v5z" />
              </svg>
            </div>
            <h3 className="title-gradient">Impact Score</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">92</p>
          <p className="text-sm text-slate-600">Great work!</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="title-gradient mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="dot-indigo" />
            <div>
              <p className="text-sm font-medium text-slate-900">Community Food Drive</p>
              <p className="text-xs text-slate-600">Completed 4 hours • Yesterday</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="dot-sky" />
            <div>
              <p className="text-sm font-medium text-slate-900">Youth Mentorship Program</p>
              <p className="text-xs text-slate-600">Upcoming • Tomorrow 2:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="dot-fuchsia" />
            <div>
              <p className="text-sm font-medium text-slate-900">Park Cleanup Initiative</p>
              <p className="text-xs text-slate-600">Registered • This Saturday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
