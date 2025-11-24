import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ProfileService, SkillsService } from "~/services/api";
import { showError } from "~/utils/toast";

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  { value: 'morning', label: 'Morning (6 AM - 12 PM)' },
  { value: 'afternoon', label: 'Afternoon (12 PM - 6 PM)' },
  { value: 'evening', label: 'Evening (6 PM - 12 AM)' }
];

const CAUSES = [
  'Education', 'Healthcare', 'Environment', 'Animal Welfare',
  'Community Development', 'Senior Care', 'Youth Programs', 'Food Security'
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Basic Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Step 2: Skills & Interests
  const [availableSkills, setAvailableSkills] = useState<Array<{id: string, name: string}>>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);

  // Step 3: Availability
  const [preferredDays, setPreferredDays] = useState<string[]>([]);
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<string[]>([]);
  const [maxTravelDistance, setMaxTravelDistance] = useState(25);

  // Step 4: Preferences
  const [weekendsOnly, setWeekendsOnly] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [eventReminders, setEventReminders] = useState(true);

  // Load skills
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const skills = await SkillsService.getSkills();
        setAvailableSkills(skills);
      } catch (err) {
        console.error('Failed to load skills:', err);
      }
    };
    loadSkills();
  }, []);

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Build skills array in the format backend expects: { skillId, proficiency }
      const skillsToSave = selectedSkills.map(skillId => ({
        skillId: skillId,
        proficiency: 'beginner' // Default proficiency level for onboarding
      }));

      // Build availability array from selected days and time slots
      const availability = [];
      if (preferredDays.length > 0 && preferredTimeSlots.length > 0) {
        for (const day of preferredDays) {
          for (const slot of preferredTimeSlots) {
            const [startHour, endHour] = getTimeSlotHours(slot);
            // Backend expects HH:MM format (not HH:MM:SS)
            const startTime = `${String(startHour).padStart(2, '0')}:00`;
            const endTime = `${String(endHour).padStart(2, '0')}:00`;
            availability.push({
              dayOfWeek: day, // Keep as string like "MONDAY"
              startTime,
              endTime,
              isRecurring: true
            });
          }
        }
      }

      // Save all profile data including skills and availability
      await ProfileService.updateProfile({
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        zipCode,
        skills: skillsToSave,
        availability
      } as any);

      // Navigate to dashboard
      navigate('/dashboard/home');
    } catch (err) {
      console.error('Failed to save onboarding data:', err);
      showError('Failed to save your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeSlotHours = (slot: string): [number, number] => {
    switch (slot) {
      case 'morning': return [6, 12];
      case 'afternoon': return [12, 18];
      case 'evening': return [18, 24];
      default: return [6, 12];
    }
  };

  const toggleDay = (day: string) => {
    setPreferredDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleTimeSlot = (slot: string) => {
    setPreferredTimeSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId) ? prev.filter(id => id !== skillId) : [...prev, skillId]
    );
  };

  const toggleCause = (cause: string) => {
    setSelectedCauses(prev =>
      prev.includes(cause) ? prev.filter(c => c !== cause) : [...prev, cause]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome to JACS ShiftPilot! 🎉</h1>
          <p className="text-slate-600">Let's set up your volunteer profile in just a few steps</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-medium text-indigo-600">{Math.round(progress)}% Complete</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8 gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-semibold transition-all text-sm sm:text-base ${
                step === currentStep
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white scale-110'
                  : step < currentStep
                  ? 'bg-green-500 text-white'
                  : 'bg-slate-200 text-slate-400'
              }`}>
                {step < currentStep ? '✓' : step}
              </div>
              <span className={`text-xs mt-2 font-medium text-center ${
                step === currentStep ? 'text-indigo-600' : step < currentStep ? 'text-green-600' : 'text-slate-400'
              }`}>
                <span className="hidden sm:inline">
                  {step === 1 && 'Basic Info'}
                  {step === 2 && 'Skills'}
                  {step === 3 && 'Availability'}
                  {step === 4 && 'Preferences'}
                </span>
                <span className="sm:hidden">
                  {step === 1 && 'Info'}
                  {step === 2 && 'Skills'}
                  {step === 3 && 'Available'}
                  {step === 4 && 'Prefs'}
                </span>
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card p-6 sm:p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Tell us about yourself</h2>
                <p className="text-slate-600">This helps us match you with local volunteer opportunities</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-field"
                    placeholder="John"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-field"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-field"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-field"
                    placeholder="Houston"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value.toUpperCase())}
                    className="input-field"
                    placeholder="TX"
                    maxLength={2}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">ZIP Code</label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="input-field"
                  placeholder="77002"
                  maxLength={10}
                />
              </div>
            </div>
          )}

          {/* Step 2: Skills & Interests */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">What are your skills?</h2>
                <p className="text-slate-600">We'll recommend events that match your abilities</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Select Your Skills</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableSkills.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                        selectedSkills.includes(skill.id)
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      {skill.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">What causes interest you?</label>
                <div className="grid grid-cols-2 gap-3">
                  {CAUSES.map((cause) => (
                    <button
                      key={cause}
                      type="button"
                      onClick={() => toggleCause(cause)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                        selectedCauses.includes(cause)
                          ? 'border-violet-600 bg-violet-50 text-violet-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-violet-300'
                      }`}
                    >
                      {cause}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">When are you available?</h2>
                <p className="text-slate-600">This helps us match you with events at convenient times</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Preferred Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                        preferredDays.includes(day)
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">Preferred Time Slots</label>
                <div className="space-y-3">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => toggleTimeSlot(slot.value)}
                      className={`w-full p-4 rounded-lg border-2 text-left transition ${
                        preferredTimeSlots.includes(slot.value)
                          ? 'border-indigo-600 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">{slot.label}</span>
                        {preferredTimeSlots.includes(slot.value) && (
                          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Maximum Travel Distance: {maxTravelDistance} miles
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={maxTravelDistance}
                  onChange={(e) => setMaxTravelDistance(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>5 miles</span>
                  <span>100 miles</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Preferences */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">Customize your experience</h2>
                <p className="text-slate-600">You can always change these settings later</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900">Weekends Only</h3>
                    <p className="text-sm text-slate-600">Only show events on Saturdays and Sundays</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWeekendsOnly(!weekendsOnly)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      weekendsOnly ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      weekendsOnly ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900">Email Notifications</h3>
                    <p className="text-sm text-slate-600">Receive updates about your volunteer activities</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      emailNotifications ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-slate-900">Event Reminders</h3>
                    <p className="text-sm text-slate-600">Get reminded before your scheduled events</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEventReminders(!eventReminders)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      eventReminders ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      eventReminders ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-violet-50 rounded-lg border-2 border-indigo-100">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-slate-900 mb-1">You're all set!</h4>
                    <p className="text-sm text-slate-600">
                      Click "Complete Setup" to start discovering volunteer opportunities that match your profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-2 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed font-medium transition"
            >
              ← Back
            </button>

            <button
              type="button"
              onClick={handleSkipStep}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition"
            >
              {currentStep === totalSteps ? 'Skip' : 'Skip this step'}
            </button>

            {currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 1 && (!firstName || !lastName || !city || !state)}
                className="btn-primary px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting || (!firstName || !lastName || !city || !state)}
                className="btn-primary px-8 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Saving...' : 'Complete Setup 🎉'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
