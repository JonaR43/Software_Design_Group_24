import { Outlet } from "react-router";
import Sidebar from "~/components/sidebar";

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-200 via-violet-200 to-slate-100 text-slate-800 flex">
      <div className="bg-ornament" />
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto relative z-10">
        <Outlet /> {/* Nested page content renders here */}
      </main>
    </div>
  );
}
