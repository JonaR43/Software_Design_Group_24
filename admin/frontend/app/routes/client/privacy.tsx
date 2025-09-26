import React from "react";

export default function PrivacyPage() {
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
            Your privacy matters to us.
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="bg-ornament" />
        <div className="max-w-4xl mx-auto px-4 py-10 lg:py-16 relative">

          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-lg text-slate-700 max-w-3xl mx-auto leading-relaxed">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="text-slate-600 mt-4 max-w-3xl mx-auto">
              At JACS ShiftPilot, we are committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data.
            </p>
          </section>

          {/* Table of Contents */}
          <section className="mb-12">
            <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
              <h2 className="text-2xl font-semibold mb-6 text-slate-900">Table of Contents</h2>
              <nav className="grid md:grid-cols-2 gap-3">
                <a href="#information-we-collect" className="text-indigo-600 hover:text-indigo-700 transition">1. Information We Collect</a>
                <a href="#how-we-use" className="text-indigo-600 hover:text-indigo-700 transition">2. How We Use Your Information</a>
                <a href="#information-sharing" className="text-indigo-600 hover:text-indigo-700 transition">3. Information Sharing</a>
                <a href="#data-security" className="text-indigo-600 hover:text-indigo-700 transition">4. Data Security</a>
                <a href="#your-rights" className="text-indigo-600 hover:text-indigo-700 transition">5. Your Rights</a>
                <a href="#cookies" className="text-indigo-600 hover:text-indigo-700 transition">6. Cookies and Tracking</a>
                <a href="#data-retention" className="text-indigo-600 hover:text-indigo-700 transition">7. Data Retention</a>
                <a href="#contact-us" className="text-indigo-600 hover:text-indigo-700 transition">8. Contact Us</a>
              </nav>
            </div>
          </section>

          {/* Privacy Policy Sections */}
          <div className="space-y-12">

            {/* Information We Collect */}
            <section id="information-we-collect">
              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
                <h2 className="text-2xl font-semibold mb-6 text-slate-900">1. Information We Collect</h2>

                <h3 className="text-xl font-semibold mb-4 text-slate-800">Personal Information</h3>
                <p className="text-slate-700 mb-4">We collect personal information that you provide to us when you:</p>
                <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
                  <li>Create an account on our platform</li>
                  <li>Fill out your volunteer profile</li>
                  <li>Register for events or volunteer opportunities</li>
                  <li>Contact us for support or inquiries</li>
                  <li>Participate in surveys or feedback forms</li>
                </ul>

                <p className="text-slate-700 mb-4">This information may include:</p>
                <div className="grid md:grid-cols-2 gap-4 text-slate-700 mb-6">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Mailing address</li>
                  </ul>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Skills and interests</li>
                    <li>Availability preferences</li>
                    <li>Emergency contact information</li>
                    <li>Volunteer history and hours</li>
                  </ul>
                </div>

                <h3 className="text-xl font-semibold mb-4 text-slate-800">Automatically Collected Information</h3>
                <p className="text-slate-700 mb-4">We automatically collect certain information when you use our platform:</p>
                <ul className="list-disc list-inside text-slate-700 space-y-2">
                  <li>IP address and location information</li>
                  <li>Device and browser information</li>
                  <li>Usage patterns and preferences</li>
                  <li>Log files and analytics data</li>
                </ul>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section id="how-we-use">
              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
                <h2 className="text-2xl font-semibold mb-6 text-slate-900">2. How We Use Your Information</h2>

                <p className="text-slate-700 mb-4">We use your information to:</p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-800">Service Delivery</h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-2">
                      <li>Create and manage your account</li>
                      <li>Match you with volunteer opportunities</li>
                      <li>Process event registrations</li>
                      <li>Track your volunteer hours and impact</li>
                      <li>Send notifications and updates</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-800">Platform Improvement</h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-2">
                      <li>Analyze usage patterns</li>
                      <li>Improve our matching algorithms</li>
                      <li>Enhance user experience</li>
                      <li>Develop new features</li>
                      <li>Provide customer support</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Information Sharing */}
            <section id="information-sharing">
              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
                <h2 className="text-2xl font-semibold mb-6 text-slate-900">3. Information Sharing</h2>

                <p className="text-slate-700 mb-6">We do not sell, rent, or trade your personal information. We may share your information only in the following circumstances:</p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-800">Partner Organizations</h3>
                    <p className="text-slate-700">We share necessary contact and skill information with approved partner organizations when you register for their volunteer opportunities. This enables them to coordinate volunteer activities and communicate important updates.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-800">Service Providers</h3>
                    <p className="text-slate-700">We may share information with trusted third-party service providers who help us operate our platform, such as hosting services, email providers, and analytics tools. These providers are bound by confidentiality agreements.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-800">Legal Requirements</h3>
                    <p className="text-slate-700">We may disclose your information if required by law, regulation, legal process, or governmental request, or to protect the rights, property, or safety of our users or the public.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Security */}
            <section id="data-security">
              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
                <h2 className="text-2xl font-semibold mb-6 text-slate-900">4. Data Security</h2>

                <p className="text-slate-700 mb-6">We implement comprehensive security measures to protect your personal information:</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-800">Technical Safeguards</h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-2">
                      <li>SSL/TLS encryption for data transmission</li>
                      <li>Encrypted data storage</li>
                      <li>Regular security audits</li>
                      <li>Multi-factor authentication options</li>
                      <li>Secure backup systems</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-slate-800">Operational Safeguards</h3>
                    <ul className="list-disc list-inside text-slate-700 space-y-2">
                      <li>Access controls and user permissions</li>
                      <li>Employee training on data protection</li>
                      <li>Regular software updates</li>
                      <li>Incident response procedures</li>
                      <li>Third-party security assessments</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Your Rights */}
            <section id="your-rights">
              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
                <h2 className="text-2xl font-semibold mb-6 text-slate-900">5. Your Rights</h2>

                <p className="text-slate-700 mb-6">You have the following rights regarding your personal information:</p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-600 mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Access</h3>
                      <p className="text-slate-700">Request a copy of the personal information we hold about you.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-sky-600 mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Correction</h3>
                      <p className="text-slate-700">Update or correct any inaccurate or incomplete information.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-violet-600 mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Deletion</h3>
                      <p className="text-slate-700">Request deletion of your personal information, subject to legal requirements.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-fuchsia-600 mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Portability</h3>
                      <p className="text-slate-700">Receive your data in a structured, commonly used format.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-600 mt-2 flex-shrink-0"></div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">Restriction</h3>
                      <p className="text-slate-700">Limit how we process your information in certain circumstances.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-indigo-800 text-sm">
                    <strong>To exercise these rights:</strong> Contact us at privacy@jacsshiftpilot.com or through your account settings. We will respond to your request within 30 days.
                  </p>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section id="cookies">
              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
                <h2 className="text-2xl font-semibold mb-6 text-slate-900">6. Cookies and Tracking</h2>

                <p className="text-slate-700 mb-6">We use cookies and similar technologies to enhance your experience on our platform:</p>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-800">Essential Cookies</h3>
                    <p className="text-slate-700">Required for basic platform functionality, such as login sessions and security features.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-800">Analytics Cookies</h3>
                    <p className="text-slate-700">Help us understand how users interact with our platform to improve performance and user experience.</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-800">Preference Cookies</h3>
                    <p className="text-slate-700">Remember your settings and preferences to provide a personalized experience.</p>
                  </div>
                </div>

                <p className="text-slate-700 mt-6">You can control cookie settings through your browser, but disabling certain cookies may affect platform functionality.</p>
              </div>
            </section>

            {/* Data Retention */}
            <section id="data-retention">
              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
                <h2 className="text-2xl font-semibold mb-6 text-slate-900">7. Data Retention</h2>

                <p className="text-slate-700 mb-4">We retain your personal information for as long as necessary to:</p>
                <ul className="list-disc list-inside text-slate-700 mb-6 space-y-2">
                  <li>Provide our services to you</li>
                  <li>Comply with legal obligations</li>
                  <li>Resolve disputes and enforce agreements</li>
                  <li>Maintain accurate volunteer records</li>
                </ul>

                <p className="text-slate-700 mb-4">Specifically:</p>
                <div className="space-y-3 text-slate-700">
                  <div><strong>Active accounts:</strong> Data retained while account is active plus 3 years after last activity</div>
                  <div><strong>Volunteer records:</strong> Historical volunteer hours and activities retained for 7 years for verification purposes</div>
                  <div><strong>Communication records:</strong> Support tickets and communications retained for 3 years</div>
                </div>
              </div>
            </section>

            {/* Contact Information */}
            <section id="contact-us">
              <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-sky-600 rounded-2xl p-8 text-white">
                <h2 className="text-2xl font-semibold mb-6">8. Contact Us</h2>

                <p className="text-indigo-100 mb-6">If you have questions about this Privacy Policy or our data practices, please contact us:</p>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Privacy Officer</h3>
                    <div className="space-y-2 text-indigo-100">
                      <div>📧 privacy@jacsshiftpilot.com</div>
                      <div>📞 (555) 123-JACS ext. 101</div>
                      <div>📬 123 Community Drive, Suite 100<br />Volunteer City, VC 12345</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Response Time</h3>
                    <div className="space-y-2 text-indigo-100">
                      <div>• Privacy inquiries: 1-2 business days</div>
                      <div>• Data access requests: Up to 30 days</div>
                      <div>• Account deletion requests: 3-5 business days</div>
                      <div>• Security concerns: Immediate response</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/20 rounded-lg">
                  <p className="text-sm">
                    <strong>Policy Updates:</strong> We may update this Privacy Policy periodically. We will notify users of significant changes via email or platform notifications 30 days before they take effect.
                  </p>
                </div>
              </div>
            </section>

          </div>
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