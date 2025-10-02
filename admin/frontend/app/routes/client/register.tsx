import React, { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'VOLUNTEER' as 'VOLUNTEER' | 'ADMIN'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    // TODO: Replace with actual API call
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Registration data:', formData);
      alert('Registration successful! Please check your email for verification.');
    } catch (error) {
      setErrors({ general: 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['bg-red-500', 'bg-red-400', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];
    
    return {
      strength: score,
      label: labels[Math.min(score, 4)],
      color: colors[Math.min(score, 4)]
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

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
            Join our volunteer community today.
          </div>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <div className="bg-ornament" />
        <div className="max-w-6xl mx-auto px-4 py-10 lg:py-16 grid lg:grid-cols-2 gap-10 relative">
          <section className="hidden lg:flex flex-col justify-center">
            <h1 className="text-3xl font-semibold mb-3 text-slate-900">Join Our Community!</h1>
            <p className="text-slate-700 max-w-lg">Create your volunteer account to start making a difference in your community. Connect with meaningful opportunities that match your skills and schedule.</p>
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-indigo-600" />Personalized event matching</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-sky-600" />Track your volunteer impact</li>
              <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-fuchsia-600" />Connect with organizations</li>
            </ul>
          </section>

          <section className="w-full flex justify-center">
            <div className="w-full max-w-md bg-white/90 border border-indigo-100 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur">
              <h2 className="text-2xl font-semibold tracking-wide mb-6 bg-gradient-to-r from-indigo-700 to-sky-700 bg-clip-text text-transparent">Create Account</h2>
              
              {errors.general && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {errors.general}
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-slate-700">Email Address *</label>
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

                {/* Role Selection */}
                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm text-slate-700">I am registering as *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="VOLUNTEER"
                        checked={formData.role === 'VOLUNTEER'}
                        onChange={handleInputChange}
                        className="text-indigo-600 focus:ring-indigo-400"
                      />
                      <span className="text-sm text-slate-700">Volunteer</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value="ADMIN"
                        checked={formData.role === 'ADMIN'}
                        onChange={handleInputChange}
                        className="text-indigo-600 focus:ring-indigo-400"
                      />
                      <span className="text-sm text-slate-700">Administrator</span>
                    </label>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm text-slate-700">Password *</label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-xs font-medium text-indigo-700 hover:text-indigo-600"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full rounded-xl bg-white border px-4 py-3 outline-none focus:ring-4 ring-indigo-300/40 transition ${
                      errors.password ? 'border-red-300 focus:border-red-600 ring-red-300/40' : 'border-slate-200 focus:border-indigo-600'
                    }`}
                  />
                  
                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-full rounded-full transition-all ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-600">{passwordStrength.label}</span>
                      </div>
                    </div>
                  )}
                  
                  {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="confirmPassword" className="text-sm text-slate-700">Confirm Password *</label>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-xs font-medium text-indigo-700 hover:text-indigo-600"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className={`w-full rounded-xl bg-white border px-4 py-3 outline-none focus:ring-4 ring-indigo-300/40 transition ${
                      errors.confirmPassword ? 'border-red-300 focus:border-red-600 ring-red-300/40' : 'border-slate-200 focus:border-indigo-600'
                    }`}
                  />
                  {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start gap-3">
                  <input 
                    id="terms" 
                    type="checkbox" 
                    required
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400" 
                  />
                  <label htmlFor="terms" className="text-sm text-slate-700">
                    I agree to the <a href="/privacy" className="text-indigo-700 hover:text-indigo-600">Terms of Service</a> and <a href="/privacy" className="text-indigo-700 hover:text-indigo-600">Privacy Policy</a>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-indigo-700 via-violet-700 to-sky-700 text-white font-semibold py-3 shadow-lg hover:from-indigo-600 hover:via-violet-600 hover:to-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
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
                  href="/login"
                  className="w-full inline-flex justify-center rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold py-3 hover:bg-slate-50 transition"
                >
                  Already have an account? Sign In
                </a>

                <p className="text-xs text-slate-600 text-center">
                  By creating an account, you agree to help make your community better through volunteer service.
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