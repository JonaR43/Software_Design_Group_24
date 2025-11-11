import React, { useState } from "react";
import { useAuth } from "~/contexts/AuthContext";
import { useNavigate } from "react-router";
import { AuthService, API_SERVER_URL } from "~/services/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  // Debug state changes

  const onSubmit = async (e: React.FormEvent) => {
    console.log("🚀 FORM SUBMIT TRIGGERED!", { email, password: password ? "***" : "EMPTY" });
    e.preventDefault();
    setError("");
    setIsLoading(true);

    console.log("Login attempt:", { email, password: "***", emailLength: email.length, passwordLength: password.length });

    try {
      console.log("🔑 Calling login function...");
      const result = await login(email, password);
      console.log("🎯 Login result:", result);

      if (result.success) {
        console.log("✅ Login successful");

        // Get user and profile data
        const currentUser = AuthService.getCurrentUser();
        const currentProfile = AuthService.getCurrentProfile();

        console.log("Profile data:", currentProfile);
        console.log("Profile completeness:", currentProfile?.profileCompleteness);

        // Check if user needs to complete onboarding
        const profileCompleteness = currentProfile?.profileCompleteness || 0;
        const isNewUser = profileCompleteness === 0;

        // Check user role and redirect accordingly
        if (currentUser && currentUser.role === 'admin') {
          console.log("🔑 Admin user detected, redirecting to admin dashboard");
          navigate("/dashboard/admin/metrics");
        } else if (isNewUser) {
          console.log("🆕 New user detected, redirecting to onboarding");
          navigate("/dashboard/onboarding");
        } else {
          console.log("👤 Regular user detected, redirecting to regular dashboard");
          navigate("/dashboard/home");
        }
      } else {
        console.log("❌ Login failed:", result.error);
        setError(result.error || "Login failed");
      }
    } catch (err) {
      console.error("💥 Login error:", err);
      setError("An unexpected error occurred: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

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

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <form className="space-y-5" onSubmit={onSubmit}>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-slate-700">Email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="you@example.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                  disabled={!email.trim() || !password.trim() || isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 text-white font-semibold py-3 shadow-lg hover:from-indigo-600 hover:via-violet-600 hover:to-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Logging In..." : "Log In"}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white/90 text-slate-500">or continue with</span>
                  </div>
                </div>

                {/* OAuth Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => window.location.href = `${API_SERVER_URL}/api/auth/google`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
                    title="Continue with Google"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.location.href = `${API_SERVER_URL}/api/auth/github`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
                    title="Continue with GitHub"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#24292e">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.location.href = `${API_SERVER_URL}/api/auth/microsoft`}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
                    title="Continue with Microsoft"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                      <path fill="#f35325" d="M1 1h10v10H1z"/>
                      <path fill="#81bc06" d="M12 1h10v10H12z"/>
                      <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                      <path fill="#ffba08" d="M12 12h10v10H12z"/>
                    </svg>
                  </button>
                </div>

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