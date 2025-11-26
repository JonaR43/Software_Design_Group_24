import { NavLink, useNavigate, useLocation } from "react-router";
import { useState, useEffect } from "react";
import NotificationCenter from "./NotificationCenter";
import { useAuth } from "~/contexts/AuthContext";
import { NotificationService } from "~/services/api";

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps = {}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['events', 'profile', 'admin'])
  );

  // Track unread notification count
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Check if any child route is active
  const isSectionActive = (routes: string[]) => {
    return routes.some(route => location.pathname.includes(route));
  };

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await NotificationService.getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread notification count:', error);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-full h-full bg-white/90 border-r border-indigo-100 shadow-md backdrop-blur flex flex-col overflow-y-auto">
      {/* Logo and Company Name */}
      <div className="px-4 py-6 border-b border-indigo-100/80">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 logo-shadow">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-label="JACS ShiftPilot shield logo">
              <defs>
                <clipPath id="shield">
                  <path d="M16 2 L28 8 V18 C28 25.5 22.8 29.2 16 31.5 C9.2 29.2 4 25.5 4 18 V8 Z"/>
                </clipPath>
              </defs>
              <path d="M16 2 L28 8 V18 C28 25.5 22.8 29.2 16 31.5 C9.2 29.2 4 25.5 4 18 V8 Z" fill="#ffffff"/>
              <g clipPath="url(#shield)">
                <rect x="0" y="10" width="32" height="22" fill="#ef4444"/>
                <rect x="0" y="12" width="32" height="2" fill="#ffffff"/>
                <rect x="0" y="16" width="32" height="2" fill="#ffffff"/>
                <rect x="0" y="20" width="32" height="2" fill="#ffffff"/>
                <rect x="0" y="24" width="32" height="2" fill="#ffffff"/>
                <rect x="0" y="28" width="32" height="2" fill="#ffffff"/>
                <rect x="4" y="7" width="14" height="9" fill="#1d4ed8"/>
                <path d="M11 10.5 l1.1 2.3 2.6.4-1.9 1.8.5 2.6-2.3-1.2-2.3 1.2.5-2.6-1.9-1.8 2.6-.4z" fill="#ffffff"/>
              </g>
              <path d="M16 2 L28 8 V18 C28 25.5 22.8 29.2 16 31.5 C9.2 29.2 4 25.5 4 18 V8 Z" fill="none" stroke="#312e81" strokeWidth="1.2"/>
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-semibold tracking-wide text-slate-900">JACS ShiftPilot</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Dashboard</span>
              {user?.role === 'admin' && (
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col p-4 space-y-1">
        {/* Home - Standalone */}
        <NavLink
          to="home"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isActive
                ? "bg-indigo-100 text-indigo-700 font-semibold"
                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </NavLink>

        {/* Events Section - Collapsible */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('events')}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              isSectionActive(['events', 'schedule', 'history'])
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Events</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${expandedSections.has('events') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Events Submenu */}
          {expandedSections.has('events') && (
            <div className="ml-4 pl-4 border-l-2 border-indigo-100 space-y-1">
              <NavLink
                to="events"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 pl-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`
                }
              >
                Browse Events
              </NavLink>
              <NavLink
                to="schedule"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 pl-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`
                }
              >
                My Schedule
              </NavLink>
              <NavLink
                to="history"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 pl-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`
                }
              >
                Event History
              </NavLink>
            </div>
          )}
        </div>

        {/* Profile Section - Collapsible */}
        <div className="space-y-1">
          <button
            onClick={() => toggleSection('profile')}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              isSectionActive(['profile', 'availability', 'attendance'])
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="font-medium">Profile</span>
            </div>
            <svg
              className={`w-4 h-4 transition-transform ${expandedSections.has('profile') ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Profile Submenu */}
          {expandedSections.has('profile') && (
            <div className="ml-4 pl-4 border-l-2 border-indigo-100 space-y-1">
              <NavLink
                to="profile"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 pl-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`
                }
              >
                My Profile
              </NavLink>
              <NavLink
                to="availability"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 pl-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`
                }
              >
                Availability
              </NavLink>
              <NavLink
                to="attendance"
                onClick={onNavigate}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 pl-3 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }`
                }
              >
                Attendance
              </NavLink>
            </div>
          )}
        </div>

        {/* Notifications */}
        <NavLink
          to="notifications"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 p-3 rounded-lg transition-colors relative ${
              isActive
                ? "bg-indigo-100 text-indigo-700 font-semibold"
                : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            }`
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notifications
          {unreadCount > 0 && (
            <span className="absolute left-6 top-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white shadow-sm">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </NavLink>

        {/* Admin Section - Only for admins */}
        {user?.role === 'admin' && (
          <>
            <div className="pt-2 pb-1">
              <div className="h-px bg-slate-200"></div>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => toggleSection('admin')}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isSectionActive(['admin'])
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="font-medium">Admin</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${expandedSections.has('admin') ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Admin Submenu */}
              {expandedSections.has('admin') && (
                <div className="ml-4 pl-4 border-l-2 border-indigo-100 space-y-1">
                  <NavLink
                    to="admin/events"
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-2 pl-3 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700 font-semibold"
                          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`
                    }
                  >
                    Event Management
                  </NavLink>
                  <NavLink
                    to="admin/create-event"
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-2 pl-3 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700 font-semibold"
                          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`
                    }
                  >
                    Create Event
                  </NavLink>
                  <NavLink
                    to="admin/matching"
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-2 pl-3 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700 font-semibold"
                          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`
                    }
                  >
                    Volunteer Matching
                  </NavLink>
                  <NavLink
                    to="admin/attendance"
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-2 pl-3 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700 font-semibold"
                          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`
                    }
                  >
                    Attendance
                  </NavLink>
                  <NavLink
                    to="admin/users"
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-2 pl-3 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700 font-semibold"
                          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`
                    }
                  >
                    User Management
                  </NavLink>
                  <NavLink
                    to="admin/metrics"
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `flex items-center gap-3 p-2 pl-3 rounded-lg text-sm transition-colors ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700 font-semibold"
                          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`
                    }
                  >
                    Metrics & Reports
                  </NavLink>
                </div>
              )}
            </div>
          </>
        )}
      </nav>

      {/* User Info Footer */}
      <div className="p-4 border-t border-indigo-100/80">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-800">{user?.username || 'User'}</p>
            <p className="text-xs text-slate-500">{user?.role || 'volunteer'}</p>
          </div>
          <div className="flex gap-1">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-red-600 transition-colors"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
