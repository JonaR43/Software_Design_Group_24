import React, { useState } from "react";

// Assignment 2 required fields interface
interface ProfileFormData {
  fullName: string;          // 50 chars, required
  address1: string;          // 100 chars, required  
  address2?: string;         // 100 chars, optional
  city: string;              // 100 chars, required
  state: string;             // 2-char state code, dropdown, required
  zipCode: string;           // 9 chars, min 5 chars, required
  skills: string[];          // Multi-select dropdown, required
  preferences?: string;      // Text area, optional
  availability: Date[];      // Date picker, multiple dates, required
}

const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
];

const AVAILABLE_SKILLS = [
  'Event Planning', 'Public Speaking', 'Marketing', 'Fundraising', 'Food Service', 
  'Manual Labor', 'Administrative', 'Teaching/Training', 'Healthcare', 'Technology',
  'Customer Service', 'Transportation', 'Photography', 'Writing', 'Design', 
  'Social Media', 'Languages', 'Leadership', 'Project Management', 'Data Entry',
  'Research', 'Counseling', 'Arts & Crafts', 'Music', 'Sports & Recreation'
];

export default function Profile() {
  const [profile, setProfile] = useState<ProfileFormData>({
    fullName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    skills: [],
    preferences: '',
    availability: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [hasProfile, setHasProfile] = useState(false); // Track if profile exists

  // Validation function
  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'fullName':
        if (!value || value.trim() === '') return 'Full name is required';
        if (value.length > 50) return 'Full name cannot exceed 50 characters';
        break;
      case 'address1':
        if (!value || value.trim() === '') return 'Address 1 is required';
        if (value.length > 100) return 'Address 1 cannot exceed 100 characters';
        break;
      case 'address2':
        if (value && value.length > 100) return 'Address 2 cannot exceed 100 characters';
        break;
      case 'city':
        if (!value || value.trim() === '') return 'City is required';
        if (value.length > 100) return 'City cannot exceed 100 characters';
        break;
      case 'state':
        if (!value || value.trim() === '') return 'State selection is required';
        break;
      case 'zipCode':
        if (!value || value.trim() === '') return 'Zip code is required';
        if (value.length > 9) return 'Zip code cannot exceed 9 characters';
        if (value.replace('-', '').length < 5) return 'Zip code must be at least 5 digits';
        if (!/^\d{5}(-\d{4})?$/.test(value)) return 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
        break;
      case 'skills':
        if (!Array.isArray(value) || value.length === 0) return 'At least one skill must be selected';
        break;
      case 'availability':
        if (!Array.isArray(value) || value.length === 0) return 'At least one availability date must be selected';
        break;
    }
    return null;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(profile).forEach(key => {
      const error = validateField(key, profile[key as keyof ProfileFormData]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
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

  // Handle skills multi-select
  const handleSkillToggle = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill) 
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));

    // Clear skills error when user makes selection
    if (errors.skills) {
      setErrors(prev => ({
        ...prev,
        skills: ''
      }));
    }
  };

  // Handle availability date toggle
  const handleAvailabilityToggle = (date: Date) => {
    setProfile(prev => {
      const dateStr = date.toDateString();
      const existingIndex = prev.availability.findIndex(d => d.toDateString() === dateStr);
      
      if (existingIndex >= 0) {
        // Remove date
        return {
          ...prev,
          availability: prev.availability.filter((_, i) => i !== existingIndex)
        };
      } else {
        // Add date
        return {
          ...prev,
          availability: [...prev.availability, date]
        };
      }
    });

    // Clear availability error when user makes selection
    if (errors.availability) {
      setErrors(prev => ({
        ...prev,
        availability: ''
      }));
    }
  };

  // Generate calendar dates (next 60 days)
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const calendarDates = generateCalendarDates();

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
      console.log('Profile data:', profile);
      setHasProfile(true);
      alert('Profile saved successfully!');
    } catch (error) {
      setErrors({ general: 'Failed to save profile. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">User Profile Management</h1>
          <p className="text-slate-600 mt-1">Complete your profile to get matched with volunteer opportunities</p>
        </div>
        {hasProfile && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Profile Complete
          </div>
        )}
      </div>

      {errors.general && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <div className="card p-6">
          <h2 className="title-gradient mb-6">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="md:col-span-2">
              <label htmlFor="fullName" className="label">Full Name *</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                maxLength={50}
                value={profile.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={`input ${errors.fullName ? 'border-red-300 focus:border-red-600' : ''}`}
              />
              {errors.fullName && <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>}
              <p className="text-xs text-slate-500 mt-1">{profile.fullName.length}/50 characters</p>
            </div>

            {/* Address 1 */}
            <div className="md:col-span-2">
              <label htmlFor="address1" className="label">Address 1 *</label>
              <input
                id="address1"
                name="address1"
                type="text"
                maxLength={100}
                value={profile.address1}
                onChange={handleInputChange}
                placeholder="Street address, P.O. box, company name, c/o"
                className={`input ${errors.address1 ? 'border-red-300 focus:border-red-600' : ''}`}
              />
              {errors.address1 && <p className="text-sm text-red-600 mt-1">{errors.address1}</p>}
              <p className="text-xs text-slate-500 mt-1">{profile.address1.length}/100 characters</p>
            </div>

            {/* Address 2 */}
            <div className="md:col-span-2">
              <label htmlFor="address2" className="label">Address 2 (Optional)</label>
              <input
                id="address2"
                name="address2"
                type="text"
                maxLength={100}
                value={profile.address2 || ''}
                onChange={handleInputChange}
                placeholder="Apartment, suite, unit, building, floor, etc."
                className={`input ${errors.address2 ? 'border-red-300 focus:border-red-600' : ''}`}
              />
              {errors.address2 && <p className="text-sm text-red-600 mt-1">{errors.address2}</p>}
              <p className="text-xs text-slate-500 mt-1">{(profile.address2 || '').length}/100 characters</p>
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="label">City *</label>
              <input
                id="city"
                name="city"
                type="text"
                maxLength={100}
                value={profile.city}
                onChange={handleInputChange}
                placeholder="Enter your city"
                className={`input ${errors.city ? 'border-red-300 focus:border-red-600' : ''}`}
              />
              {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
              <p className="text-xs text-slate-500 mt-1">{profile.city.length}/100 characters</p>
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="label">State *</label>
              <select
                id="state"
                name="state"
                value={profile.state}
                onChange={handleInputChange}
                className={`input ${errors.state ? 'border-red-300 focus:border-red-600' : ''}`}
              >
                <option value="">Select a state</option>
                {US_STATES.map(state => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
              </select>
              {errors.state && <p className="text-sm text-red-600 mt-1">{errors.state}</p>}
            </div>

            {/* Zip Code */}
            <div>
              <label htmlFor="zipCode" className="label">Zip Code *</label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                maxLength={10}
                value={profile.zipCode}
                onChange={handleInputChange}
                placeholder="12345 or 12345-6789"
                className={`input ${errors.zipCode ? 'border-red-300 focus:border-red-600' : ''}`}
              />
              {errors.zipCode && <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>}
              <p className="text-xs text-slate-500 mt-1">At least 5 digits required</p>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="card p-6">
          <h2 className="title-gradient mb-6">Skills *</h2>
          <p className="text-sm text-slate-600 mb-4">Select all skills that apply to you (multi-select dropdown)</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-4">
            {AVAILABLE_SKILLS.map(skill => (
              <label key={skill} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={profile.skills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                />
                <span className="text-sm text-slate-700">{skill}</span>
              </label>
            ))}
          </div>
          
          {profile.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-slate-600 mb-2">Selected skills ({profile.skills.length}):</p>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium flex items-center gap-2">
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {errors.skills && <p className="text-sm text-red-600 mt-2">{errors.skills}</p>}
        </div>

        {/* Preferences Section */}
        <div className="card p-6">
          <h2 className="title-gradient mb-6">Preferences (Optional)</h2>
          <p className="text-sm text-slate-600 mb-4">Tell us about your volunteer preferences, interests, or any special considerations</p>
          
          <textarea
            name="preferences"
            value={profile.preferences || ''}
            onChange={handleInputChange}
            rows={4}
            placeholder="e.g., I prefer outdoor activities, working with children, weekend events only, etc."
            className="input"
          />
          <p className="text-xs text-slate-500 mt-1">{(profile.preferences || '').length} characters</p>
        </div>

        {/* Availability Section */}
        <div className="card p-6">
          <h2 className="title-gradient mb-6">Availability *</h2>
          <p className="text-sm text-slate-600 mb-4">Select multiple dates when you're available to volunteer (next 60 days)</p>
          
          <div className="grid grid-cols-7 gap-2 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-4">
            {/* Calendar Header */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-600 p-2">
                {day}
              </div>
            ))}
            
            {/* Calendar Dates */}
            {calendarDates.map(date => {
              const isSelected = profile.availability.some(d => d.toDateString() === date.toDateString());
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={date.toDateString()}
                  type="button"
                  onClick={() => handleAvailabilityToggle(date)}
                  className={`p-2 text-sm rounded border transition ${
                    isSelected 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : isToday
                      ? 'bg-slate-100 border-slate-300 text-slate-900 font-medium'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          
          {profile.availability.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-slate-600 mb-2">Selected dates ({profile.availability.length}):</p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {profile.availability
                  .sort((a, b) => a.getTime() - b.getTime())
                  .map(date => (
                  <span key={date.toDateString()} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-2">
                    {date.toLocaleDateString()}
                    <button
                      type="button"
                      onClick={() => handleAvailabilityToggle(date)}
                      className="text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {errors.availability && <p className="text-sm text-red-600 mt-2">{errors.availability}</p>}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary px-8 py-3 w-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Saving Profile...' : hasProfile ? 'Update Profile' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}