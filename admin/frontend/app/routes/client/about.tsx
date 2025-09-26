import React from "react";

export default function AboutPage() {
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
            Learn more about our mission.
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="bg-ornament" />
        <div className="max-w-4xl mx-auto px-4 py-10 lg:py-16 relative">

          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 bg-clip-text text-transparent">
              About JACS ShiftPilot
            </h1>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
              Empowering communities through intelligent volunteer management. We connect passionate volunteers with meaningful opportunities that make a real difference.
            </p>
          </section>

          {/* Mission Section */}
          <section className="mb-16">
            <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
              <h2 className="text-2xl font-semibold mb-6 text-slate-900">Our Mission</h2>
              <p className="text-slate-700 text-lg leading-relaxed mb-6">
                JACS ShiftPilot was founded on the belief that volunteer management should be simple, efficient, and rewarding for everyone involved. We bridge the gap between organizations needing help and individuals ready to serve their communities.
              </p>
              <p className="text-slate-700 text-lg leading-relaxed">
                Through our intelligent matching system, we ensure that volunteers are connected with opportunities that align with their skills, interests, and availability, creating more meaningful and impactful experiences for all.
              </p>
            </div>
          </section>

          {/* Values Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-semibold mb-10 text-center text-slate-900">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-6 shadow-xl backdrop-blur text-center">
                <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Community First</h3>
                <p className="text-slate-600">Every decision we make prioritizes the well-being and growth of the communities we serve.</p>
              </div>

              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-6 shadow-xl backdrop-blur text-center">
                <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-sky-600 to-fuchsia-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Innovation</h3>
                <p className="text-slate-600">We leverage technology to make volunteer coordination smarter, faster, and more effective.</p>
              </div>

              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-6 shadow-xl backdrop-blur text-center">
                <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900">Trust & Integrity</h3>
                <p className="text-slate-600">We maintain the highest standards of reliability and transparency in all our operations.</p>
              </div>
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-16">
            <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
              <h2 className="text-2xl font-semibold mb-6 text-slate-900">Our Story</h2>
              <p className="text-slate-700 text-lg leading-relaxed mb-4">
                Founded in 2024, JACS ShiftPilot emerged from the recognition that traditional volunteer coordination methods were often inefficient and frustrating for both organizations and volunteers. Our founders, who had extensive experience in community service and technology, saw an opportunity to revolutionize how volunteer work is organized and managed.
              </p>
              <p className="text-slate-700 text-lg leading-relaxed mb-4">
                Today, we serve organizations of all sizes, from local community centers to large non-profits, helping them streamline their volunteer operations and maximize their impact. Our platform has facilitated thousands of volunteer hours and continues to grow as more communities discover the power of smart volunteer management.
              </p>
              <p className="text-slate-700 text-lg leading-relaxed">
                We're proud to be part of a movement that recognizes volunteer work as a cornerstone of healthy, thriving communities.
              </p>
            </div>
          </section>

          {/* Stats Section */}
          <section className="mb-16">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">10,000+</div>
                <div className="text-slate-600">Active Volunteers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-sky-600 mb-2">500+</div>
                <div className="text-slate-600">Partner Organizations</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-violet-600 mb-2">100,000+</div>
                <div className="text-slate-600">Volunteer Hours</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-fuchsia-600 mb-2">50+</div>
                <div className="text-slate-600">Cities Served</div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 rounded-2xl p-8 text-white">
              <h2 className="text-2xl font-semibold mb-4">Ready to Make a Difference?</h2>
              <p className="text-indigo-100 mb-6 text-lg">Join thousands of volunteers who are already making an impact in their communities.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/register" className="inline-flex justify-center rounded-xl bg-white text-indigo-700 font-semibold px-6 py-3 hover:bg-indigo-50 transition">
                  Sign Up as Volunteer
                </a>
                <a href="/login" className="inline-flex justify-center rounded-xl border border-white/30 text-white font-semibold px-6 py-3 hover:bg-white/10 transition">
                  Login to Dashboard
                </a>
              </div>
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