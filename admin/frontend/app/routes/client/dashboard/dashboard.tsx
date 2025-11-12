import { Outlet } from "react-router";
import { useState } from "react";
import Sidebar from "~/components/sidebar";
import { withAuth } from "~/contexts/AuthContext";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-200 via-violet-200 to-slate-100 text-slate-800 relative">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-lg shadow-lg border border-indigo-100 hover:bg-indigo-50 transition"
        aria-label="Toggle menu"
      >
        {isSidebarOpen ? (
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile by default, slides in when opened */}
      <div className={`fixed top-0 left-0 w-64 h-full z-50 transform transition-transform duration-300 ease-in-out lg:transform-none lg:z-30 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main content area - No left margin on mobile, has margin on desktop */}
      <main className="lg:ml-64 relative z-10 min-h-screen bg-gradient-to-b from-indigo-200 via-violet-200 to-slate-100">
        {/* Background ornament overlay */}
        <div className="bg-ornament absolute inset-0 z-0" />

        <div className="p-4 sm:p-6 w-full relative z-10 pt-16 lg:pt-6">
          <Outlet /> {/* Nested page content renders here */}
        </div>
      </main>
    </div>
  );
}

// Protect the entire dashboard with authentication
export default withAuth(DashboardLayout);
