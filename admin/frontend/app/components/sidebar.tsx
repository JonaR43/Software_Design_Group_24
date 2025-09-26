import { NavLink } from "react-router";
import { useState } from "react";
import NotificationCenter from "./NotificationCenter";

export default function Sidebar() {
  // Mock user role - in real app this would come from auth context
  const [userRole, setUserRole] = useState<'VOLUNTEER' | 'ADMIN'>('VOLUNTEER');
  const [unreadNotifications] = useState(3); // Mock notification count

  // Toggle role for testing/demo purposes
  const toggleRole = () => {
    setUserRole(current => current === 'ADMIN' ? 'VOLUNTEER' : 'ADMIN');
  };

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
              {userRole === 'ADMIN' && (
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                  Admin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col p-4 space-y-2">
        {/* Core Navigation */}
        <div className="space-y-1">
          <NavLink 
            to="home" 
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
          
          <NavLink 
            to="events" 
            className={({ isActive }) => 
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-indigo-100 text-indigo-700 font-semibold" 
                  : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Events
          </NavLink>
          
          <NavLink 
            to="schedule" 
            className={({ isActive }) => 
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-indigo-100 text-indigo-700 font-semibold" 
                  : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Schedule
          </NavLink>
          
          <NavLink 
            to="history" 
            className={({ isActive }) => 
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-indigo-100 text-indigo-700 font-semibold" 
                  : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            History
          </NavLink>
          
          <NavLink 
            to="profile1" 
            className={({ isActive }) => 
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-indigo-100 text-indigo-700 font-semibold" 
                  : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              }`
            }
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </NavLink>
        </div>

        {/* Admin Section */}
        {userRole === 'ADMIN' && (
          <>
            <div className="pt-4 pb-2">
              <div className="px-3 py-2 text-xs font-semibold text-slate-600 uppercase tracking-wider border-t border-slate-200">
                Administrator
              </div>
            </div>
            <div className="space-y-1">
              <NavLink 
                to="admin/events" 
                className={({ isActive }) => 
                  `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-indigo-100 text-indigo-700 font-semibold" 
                      : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                  }`
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Event Management
              </NavLink>
              
              <NavLink 
                to="admin/create-event" 
                className={({ isActive }) => 
                  `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-indigo-100 text-indigo-700 font-semibold" 
                      : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                  }`
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Event
              </NavLink>
              
              <NavLink 
                to="admin/matching" 
                className={({ isActive }) => 
                  `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-indigo-100 text-indigo-700 font-semibold" 
                      : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
                  }`
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Volunteer Matching
              </NavLink>
            </div>
          </>
        )}
      </nav>

      {/* Notifications */}
      <div className="px-4 py-2 border-t border-indigo-100/80">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Notifications</span>
          <NotificationCenter />
        </div>
      </div>

      {/* User Info Footer */}
      <div className="p-4 border-t border-indigo-100/80">
        <div className="flex items-center gap-3 text-sm">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-800">{userRole === 'ADMIN' ? 'Admin User' : 'Volunteer User'}</p>
            <p className="text-xs text-slate-500">{userRole.toLowerCase()}</p>
          </div>
          <div className="flex gap-1">
            {/* Role Toggle Button */}
            <button
              onClick={toggleRole}
              className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded transition"
              title={`Switch to ${userRole === 'ADMIN' ? 'Volunteer' : 'Admin'} view`}
            >
              {userRole === 'ADMIN' ? 'Vol' : 'Admin'}
            </button>
            {/* Logout Button */}
            <button className="text-slate-400 hover:text-slate-600">
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
