import React, { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

 /*  const onSubmit = (e) => {
    e.preventDefault();
  }; */

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-200 via-violet-200 to-slate-100 text-slate-800 flex flex-col">
      <style>{`
        .logo-shadow { filter: drop-shadow(0 6px 12px rgba(79, 70, 229, 0.35)); }
        .bg-ornament {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(820px 440px at 10% -10%, rgba(99, 102, 241, 0.30), transparent 60%),
            radial-gradient(720px 400px at 100% 110%, rgba(56, 189, 248, 0.24), transparent 60%),
            radial-gradient(640px 340px at 70% 0%, rgba(232, 121, 249, 0.22), transparent 60%),
            linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.35));
          pointer-events: none;
        }
      `}</style>

      <header className="w-full border-b border-indigo-100/80 bg-white/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
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
              <span className="text-xs text-slate-500">Volunteer Management</span>
            </div>
          </div>
          <div className="hidden sm:block text-sm text-slate-600">
            Helping hands, smarter shifts.
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="bg-ornament" />
        <div className="max-w-6xl mx-auto px-4 py-10 lg:py-16 grid lg:grid-cols-2 gap-10 relative">
          <section className="hidden lg:flex flex-col justify-center">
            <h1 className="text-3xl font-semibold mb-3 text-slate-900">Welcome back, volunteer!</h1>
            <p className="text-slate-700 max-w-lg">Log in to claim shifts, track hours, and coordinate events. Your service makes a real impact.</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-600" />Smart shift matching</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-600" />Hours & impact tracking</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-fuchsia-600" />Coordinator messaging</li>
            </ul>
          </section>

          <section className="w-full flex justify-center">
            <div className="w-full max-w-md bg-white/90 border border-indigo-100 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur">
              <h2 className="text-2xl font-semibold tracking-wide mb-6 bg-gradient-to-r from-indigo-700 to-sky-700 bg-clip-text text-transparent">Login</h2>
              <form className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm text-slate-700">Username or Email</label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    placeholder="you@example.org"
                    className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3 outline-none focus:ring-4 ring-indigo-300/40 focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword((s) => !s)}
                      className="text-xs font-medium text-indigo-700 hover:text-indigo-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3 outline-none focus:ring-4 ring-indigo-300/40 focus:border-indigo-600"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input id="remember" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400" />
                    <span className="text-slate-700">Remember me</span>
                  </label>
                  <a href="#" className="text-indigo-700 hover:text-indigo-600">Forgot password?</a>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 text-white font-semibold py-3 shadow-lg hover:from-indigo-600 hover:via-violet-600 hover:to-sky-600 transition"
                >
                  Log In
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white/90 text-slate-500">or</span>
                  </div>
                </div>

                <a
                  href="/register"
                  className="w-full inline-flex justify-center rounded-xl bg-gradient-to-r from-sky-600 to-fuchsia-600 text-white font-semibold py-3 shadow-lg hover:from-sky-500 hover:to-fuchsia-500 transition"
                >
                  Register
                </a>

                <p className="text-xs text-slate-600 text-center">
                  By continuing you agree to our <a href="/privacy" className="text-indigo-700 hover:text-indigo-600">Privacy Policy</a>.
                </p>
              </form>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-indigo-100/80 bg-white/70">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-slate-800 font-semibold mb-4">Quick Links</div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600">
            <a href="/about" className="hover:text-slate-900">About Us</a>
            <a href="/contact" className="hover:text-slate-900">Contact</a>
            <a href="/privacy" className="hover:text-slate-900">Privacy Policy</a>
          </nav>
          <div className="mt-6 text-xs text-slate-500">© {new Date().getFullYear()} JACS ShiftPilot. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}