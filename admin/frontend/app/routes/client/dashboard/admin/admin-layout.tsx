import { Outlet } from "react-router";
import { useAuth } from "~/contexts/AuthContext";

export default function AdminLayout() {
  const { user } = useAuth();

  // Redirect non-admin users
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="card p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Restricted</h2>
          <p className="text-slate-600">
            This section is only available to administrators. Please contact your system administrator if you need access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="card p-6 bg-gradient-to-r from-indigo-50 via-violet-50 to-slate-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold title-gradient">
              Administrator Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Manage events, volunteers, and system settings
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-medium">
              Admin Access
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="card p-1">
        <nav className="flex space-x-1">
          <a
            href="/dashboard/admin/events"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:text-slate-800 hover:bg-slate-50"
          >
            Event Management
          </a>
          <a
            href="/dashboard/admin/create-event"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:text-slate-800 hover:bg-slate-50"
          >
            Create Event
          </a>
          <a
            href="/dashboard/admin/matching"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-slate-600 hover:text-slate-800 hover:bg-slate-50"
          >
            Volunteer Matching
          </a>
        </nav>
      </div>

      {/* Admin Content */}
      <div>
        <Outlet />
      </div>
    </div>
  );
}