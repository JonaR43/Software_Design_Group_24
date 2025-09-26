import React, { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    contactType: 'general'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Contact form data:', formData);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        contactType: 'general'
      });
    } catch (error) {
      setErrors({ general: 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
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
            We're here to help you succeed.
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="bg-ornament" />
        <div className="max-w-4xl mx-auto px-4 py-10 lg:py-16 relative">

          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 bg-clip-text text-transparent">
              Contact Us
            </h1>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
              Have a question, need support, or want to learn more about how JACS ShiftPilot can help your organization? We'd love to hear from you.
            </p>
          </section>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">

            {/* Contact Form */}
            <section>
              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
                <h2 className="text-2xl font-semibold mb-6 text-slate-900">Send us a Message</h2>

                {isSubmitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    <div className="flex items-center gap-2">
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.
                    </div>
                  </div>
                )}

                {errors.general && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {errors.general}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Type */}
                  <div className="space-y-2">
                    <label htmlFor="contactType" className="text-sm font-medium text-slate-700">I'm contacting you about *</label>
                    <select
                      id="contactType"
                      name="contactType"
                      value={formData.contactType}
                      onChange={handleInputChange}
                      className="w-full rounded-xl bg-white border border-slate-200 px-4 py-3 outline-none focus:ring-4 ring-indigo-300/40 focus:border-indigo-600"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="volunteer">Volunteer Support</option>
                      <option value="organization">Organization Partnership</option>
                      <option value="technical">Technical Support</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="media">Media & Press</option>
                    </select>
                  </div>

                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name *</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                      className={`w-full rounded-xl bg-white border px-4 py-3 outline-none focus:ring-4 ring-indigo-300/40 transition ${
                        errors.name ? 'border-red-300 focus:border-red-600 ring-red-300/40' : 'border-slate-200 focus:border-indigo-600'
                      }`}
                    />
                    {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address *</label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.org"
                      className={`w-full rounded-xl bg-white border px-4 py-3 outline-none focus:ring-4 ring-indigo-300/40 transition ${
                        errors.email ? 'border-red-300 focus:border-red-600 ring-red-300/40' : 'border-slate-200 focus:border-indigo-600'
                      }`}
                    />
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-sm font-medium text-slate-700">Subject *</label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Brief description of your inquiry"
                      className={`w-full rounded-xl bg-white border px-4 py-3 outline-none focus:ring-4 ring-indigo-300/40 transition ${
                        errors.subject ? 'border-red-300 focus:border-red-600 ring-red-300/40' : 'border-slate-200 focus:border-indigo-600'
                      }`}
                    />
                    {errors.subject && <p className="text-sm text-red-600">{errors.subject}</p>}
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium text-slate-700">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      placeholder="Please provide details about your inquiry..."
                      className={`w-full rounded-xl bg-white border px-4 py-3 outline-none focus:ring-4 ring-indigo-300/40 transition resize-none ${
                        errors.message ? 'border-red-300 focus:border-red-600 ring-red-300/40' : 'border-slate-200 focus:border-indigo-600'
                      }`}
                    />
                    {errors.message && <p className="text-sm text-red-600">{errors.message}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 text-white font-semibold py-3 shadow-lg hover:from-indigo-600 hover:via-violet-600 hover:to-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </section>

            {/* Contact Information */}
            <section className="space-y-8">
              {/* Contact Details */}
              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
                <h2 className="text-2xl font-semibold mb-6 text-slate-900">Get in Touch</h2>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                      <p className="text-slate-600">support@jacsshiftpilot.com</p>
                      <p className="text-sm text-slate-500">We typically respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Phone</h3>
                      <p className="text-slate-600">(555) 123-JACS</p>
                      <p className="text-sm text-slate-500">Monday - Friday, 9AM - 6PM EST</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">Address</h3>
                      <p className="text-slate-600">123 Community Drive<br />Suite 100<br />Volunteer City, VC 12345</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Office Hours</h2>
                <div className="space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-white/90 border border-indigo-100 rounded-2xl p-8 shadow-xl backdrop-blur">
                <h2 className="text-xl font-semibold mb-4 text-slate-900">Need Help?</h2>
                <div className="space-y-3">
                  <a href="#" className="block text-indigo-600 hover:text-indigo-700 transition">
                    📚 Browse our FAQ
                  </a>
                  <a href="#" className="block text-indigo-600 hover:text-indigo-700 transition">
                    📖 Read our documentation
                  </a>
                  <a href="#" className="block text-indigo-600 hover:text-indigo-700 transition">
                    🎥 Watch tutorial videos
                  </a>
                  <a href="#" className="block text-indigo-600 hover:text-indigo-700 transition">
                    💬 Join our community forum
                  </a>
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