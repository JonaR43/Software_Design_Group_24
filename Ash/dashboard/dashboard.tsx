import { Outlet } from "react-router";
import Sidebar from "~/components/sidebar";
import { withAuth } from "~/contexts/AuthContext";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-200 via-violet-200 to-slate-100 text-slate-800 relative">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 w-64 h-full z-30">
        <Sidebar />
      </div>

      {/* Main content area with background */}
      <main className="ml-64 relative z-10 min-h-screen bg-gradient-to-b from-indigo-200 via-violet-200 to-slate-100">
        {/* Background ornament overlay */}
        <div className="bg-ornament absolute inset-0 z-0" />

        <div className="p-6 w-full relative z-10">
          <Outlet /> {/* Nested page content renders here */}
        </div>
      </main>
    </div>
  );
}

// Protect the entire dashboard with authentication
export default withAuth(DashboardLayout);
