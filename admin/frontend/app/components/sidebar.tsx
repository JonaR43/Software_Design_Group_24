import { NavLink } from "react-router";

export default function Sidebar() {
  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    `p-3 rounded-xl hover:bg-indigo-100 transition-colors ${isActive ? "bg-indigo-200 font-semibold" : ""}`;

  return (
    <aside className="w-64 bg-white/90 border-r border-indigo-100 shadow-md backdrop-blur flex flex-col h-screen">
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
            <span className="text-xs text-slate-500">Dashboard</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col p-4 space-y-2">
        <NavLink to="home" className={linkClasses}>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </div>
        </NavLink>
        <NavLink to="events" className={linkClasses}>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Events
          </div>
        </NavLink>
        <NavLink to="schedule" className={linkClasses}>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Schedule
          </div>
        </NavLink>
        <NavLink to="profile" className={linkClasses}>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </div>
        </NavLink>
      </nav>
    </aside>
  );
}
