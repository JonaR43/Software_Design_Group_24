import { Outlet } from "react-router";
import Sidebar from "~/components/sidebar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-200 via-violet-200 to-slate-100 text-slate-800">
      {/* Single background ornament for entire app */}
      <div className="bg-ornament fixed inset-0 z-0" />

      {/* Sidebar */}
      <div className="fixed top-0 left-0 w-64 h-full z-30">
        <Sidebar />
      </div>

      {/* Main content area */}
      <main className="ml-64 relative z-10 min-h-screen">
        <div className="p-6 w-full">
          <Outlet /> {/* Nested page content renders here */}
        </div>
      </main>
    </div>
  );
}
