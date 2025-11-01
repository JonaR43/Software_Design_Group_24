import { useState, useEffect, useRef } from 'react';
import { SkillsService, EventService } from "~/services/api";

interface EventFormData {
  eventName: string;
  eventDescription: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  requiredSkills: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  eventDate: string;
  eventTime: string;
  volunteersNeeded: number;
}

interface FormErrors {
  eventName?: string;
  eventDescription?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  requiredSkills?: string;
  urgency?: string;
  category?: string;
  eventDate?: string;
  eventTime?: string;
  volunteersNeeded?: string;
}

export default function CreateEventPage() {
  const [formData, setFormData] = useState<EventFormData>({
    eventName: '',
    eventDescription: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    requiredSkills: [],
    urgency: 'MEDIUM',
    category: 'community',
    eventDate: '',
    eventTime: '09:00',
    volunteersNeeded: 1
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load skills from backend
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const skills = await SkillsService.getSkills();
        setAvailableSkills(skills.map(skill => skill.name));
      } catch (error) {
        console.error('Failed to load skills:', error);
        // Fallback to empty array
        setAvailableSkills([]);
      }
    };

    loadSkills();
  }, []);

  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'eventName':
        if (!value) return 'Event name is required';
        if (value.length > 100) return 'Event name cannot exceed 100 characters';
        return null;
      
      case 'eventDescription':
        if (!value) return 'Event description is required';
        return null;

      case 'address':
        if (!value) return 'Street address is required';
        return null;

      case 'city':
        if (!value) return 'City is required';
        return null;

      case 'state':
        if (!value) return 'State is required';
        if (value.length !== 2) return 'State must be 2 characters (e.g., TX)';
        return null;

      case 'zipCode':
        if (!value) return 'ZIP code is required';
        if (!/^\d{5}(-\d{4})?$/.test(value)) return 'Invalid ZIP code format';
        return null;

      case 'requiredSkills':
        if (!Array.isArray(value) || value.length === 0) {
          return 'At least one required skill must be selected';
        }
        return null;
      
      case 'urgency':
        if (!value) return 'Urgency level is required';
        return null;

      case 'category':
        if (!value) return 'Category is required';
        return null;

      case 'eventDate':
        if (!value) return 'Event date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return 'Event date cannot be in the past';
        return null;

      case 'eventTime':
        if (!value) return 'Event time is required';
        return null;
      
      case 'volunteersNeeded':
        if (!value || value < 1) return 'At least 1 volunteer is required';
        if (value > 100) return 'Maximum 100 volunteers allowed';
        return null;
      
      default:
        return null;
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSkillToggle = (skill: string) => {
    const currentSkills = formData.requiredSkills;
    const newSkills = currentSkills.includes(skill)
      ? currentSkills.filter(s => s !== skill)
      : [...currentSkills, skill];

    handleInputChange('requiredSkills', newSkills);
  };

  // Enhanced date picker functions
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(selectedYear, selectedMonth, day);
    const dateString = selectedDate.toISOString().split('T')[0];
    handleInputChange('eventDate', dateString);
    setShowDatePicker(false);
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    }
  };

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return 'Select date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);
    const today = new Date();
    const currentDate = formData.eventDate ? new Date(formData.eventDate) : null;

    const days = [];
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Add the actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(selectedYear, selectedMonth, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = currentDate && date.toDateString() === currentDate.toDateString();
      const isPast = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isPast && handleDateSelect(day)}
          disabled={isPast}
          className={`w-8 h-8 text-sm rounded-full transition-colors ${
            isSelected
              ? 'bg-indigo-600 text-white'
              : isToday
              ? 'bg-blue-100 text-blue-600 font-semibold'
              : isPast
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div ref={datePickerRef} className="absolute top-full left-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg p-4 z-50">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => handleMonthChange('prev')}
            className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex space-x-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="text-sm border border-slate-300 rounded px-2 py-1"
            >
              {monthNames.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="text-sm border border-slate-300 rounded px-2 py-1"
            >
              {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => handleMonthChange('next')}
            className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="mb-3">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="w-8 h-8 text-xs font-medium text-slate-600 flex items-center justify-center">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days}
          </div>
        </div>

        {/* Today Button */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              setSelectedMonth(today.getMonth());
              setSelectedYear(today.getFullYear());
              handleDateSelect(today.getDate());
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setShowDatePicker(false)}
            className="text-xs text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof EventFormData]);
      if (error) {
        newErrors[key as keyof FormErrors] = error;
      }
    });
    
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
      // Combine date and time into startDate
      const startDateTime = new Date(`${formData.eventDate}T${formData.eventTime}`);
      // Set end date to 4 hours after start for now (can be made configurable)
      const endDateTime = new Date(startDateTime.getTime() + 4 * 60 * 60 * 1000);

      // Get skill IDs from skill names
      const allSkills = await SkillsService.getSkills();
      const skillNameToId = new Map(allSkills.map(skill => [skill.name, skill.id]));
      const requiredSkillsArray = formData.requiredSkills
        .map(skillName => {
          const skillId = skillNameToId.get(skillName);
          if (skillId) {
            return {
              skillId: skillId,
              minLevel: 'beginner',
              required: true
            };
          }
          return null;
        })
        .filter(skill => skill !== null);

      // Map urgency level to match Prisma enum values (LOW, MEDIUM, HIGH, CRITICAL)
      const urgencyMap: Record<string, string> = {
        'LOW': 'low',
        'MEDIUM': 'medium',
        'HIGH': 'high',
        'URGENT': 'critical'
      };

      // Create the event
      await EventService.createEvent({
        title: formData.eventName,
        description: formData.eventDescription,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        maxVolunteers: formData.volunteersNeeded,
        urgencyLevel: urgencyMap[formData.urgency] || 'medium',
        requiredSkills: requiredSkillsArray as any,
        category: formData.category
      });

      setShowSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData({
          eventName: '',
          eventDescription: '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          requiredSkills: [],
          urgency: 'MEDIUM',
          category: 'community',
          eventDate: '',
          eventTime: '09:00',
          volunteersNeeded: 1
        });
        setShowSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error creating event:', error);
      alert(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCharacterCount = (text: string, max: number) => {
    return `${text.length}/${max}`;
  };

  const getCharacterCountColor = (text: string, max: number) => {
    const ratio = text.length / max;
    if (ratio >= 0.9) return 'text-red-600';
    if (ratio >= 0.7) return 'text-yellow-600';
    return 'text-slate-500';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 title-gradient">Create New Event</h1>
          <p className="text-slate-600 mt-2">Set up a new volunteer opportunity</p>
        </div>
        <a
          href="/dashboard/admin/events"
          className="btn-secondary w-auto px-6 py-3 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Events
        </a>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="card p-6 bg-green-50 border-green-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Event Created Successfully!</h3>
              <p className="text-sm text-green-700 mt-1">
                Your event has been created and is ready for volunteer registration.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Event Creation Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h3>
          
          {/* Event Name */}
          <div className="mb-4">
            <label className="label">
              Event Name *
              <span className={`text-xs ml-2 ${getCharacterCountColor(formData.eventName, 100)}`}>
                {getCharacterCount(formData.eventName, 100)}
              </span>
            </label>
            <input
              type="text"
              value={formData.eventName}
              onChange={(e) => handleInputChange('eventName', e.target.value)}
              className={`input ${errors.eventName ? 'border-red-500' : ''}`}
              placeholder="Enter event name"
              maxLength={100}
            />
            {errors.eventName && (
              <p className="text-sm text-red-600 mt-1">{errors.eventName}</p>
            )}
          </div>

          {/* Event Description */}
          <div className="mb-4">
            <label className="label">Event Description *</label>
            <textarea
              value={formData.eventDescription}
              onChange={(e) => handleInputChange('eventDescription', e.target.value)}
              className={`input min-h-24 ${errors.eventDescription ? 'border-red-500' : ''}`}
              placeholder="Describe the event, activities, and what volunteers will be doing"
              rows={4}
            />
            {errors.eventDescription && (
              <p className="text-sm text-red-600 mt-1">{errors.eventDescription}</p>
            )}
          </div>

          {/* Address */}
          <div className="mb-4">
            <label className="label">Street Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`input ${errors.address ? 'border-red-500' : ''}`}
              placeholder="123 Main St"
            />
            {errors.address && (
              <p className="text-sm text-red-600 mt-1">{errors.address}</p>
            )}
          </div>

          {/* City, State, ZIP in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">City *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`input ${errors.city ? 'border-red-500' : ''}`}
                placeholder="Houston"
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">{errors.city}</p>
              )}
            </div>

            <div>
              <label className="label">State *</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value.toUpperCase())}
                className={`input ${errors.state ? 'border-red-500' : ''}`}
                placeholder="TX"
                maxLength={2}
              />
              {errors.state && (
                <p className="text-sm text-red-600 mt-1">{errors.state}</p>
              )}
            </div>

            <div>
              <label className="label">ZIP Code *</label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className={`input ${errors.zipCode ? 'border-red-500' : ''}`}
                placeholder="77001"
              />
              {errors.zipCode && (
                <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Event Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Event Date */}
            <div className="relative">
              <label className="label">Event Date *</label>
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className={`input w-full text-left flex items-center justify-between ${errors.eventDate ? 'border-red-500' : ''}`}
              >
                <span className={formData.eventDate ? 'text-slate-900' : 'text-slate-500'}>
                  {formatDisplayDate(formData.eventDate)}
                </span>
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>

              {/* Custom Calendar Picker */}
              {showDatePicker && renderCalendar()}

              {errors.eventDate && (
                <p className="text-sm text-red-600 mt-1">{errors.eventDate}</p>
              )}
            </div>

            {/* Event Time */}
            <div>
              <label className="label">Event Time *</label>
              <input
                type="time"
                value={formData.eventTime}
                onChange={(e) => handleInputChange('eventTime', e.target.value)}
                className={`input ${errors.eventTime ? 'border-red-500' : ''}`}
              />
              {errors.eventTime && (
                <p className="text-sm text-red-600 mt-1">{errors.eventTime}</p>
              )}
            </div>

            {/* Urgency */}
            <div>
              <label className="label">Urgency Level *</label>
              <select
                value={formData.urgency}
                onChange={(e) => handleInputChange('urgency', e.target.value)}
                className={`input ${errors.urgency ? 'border-red-500' : ''}`}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              {errors.urgency && (
                <p className="text-sm text-red-600 mt-1">{errors.urgency}</p>
              )}
            </div>
          </div>

          {/* Category - Separate row */}
          <div className="mt-4">
            <div className="max-w-xs">
              <label className="label">Event Category *</label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className={`input ${errors.category ? 'border-red-500' : ''}`}
              >
                <option value="community">Community</option>
                <option value="environmental">Environmental</option>
                <option value="educational">Educational</option>
                <option value="healthcare">Healthcare</option>
                <option value="food">Food</option>
                <option value="disaster">Disaster Relief</option>
                <option value="fundraising">Fundraising</option>
                <option value="administrative">Administrative</option>
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Volunteers Needed - Separate row */}
          <div className="mt-4">
            <div className="max-w-xs">
              <label className="label">Volunteers Needed *</label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.volunteersNeeded}
                onChange={(e) => handleInputChange('volunteersNeeded', parseInt(e.target.value) || 0)}
                className={`input ${errors.volunteersNeeded ? 'border-red-500' : ''}`}
                placeholder="Number of volunteers"
              />
              {errors.volunteersNeeded && (
                <p className="text-sm text-red-600 mt-1">{errors.volunteersNeeded}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">Maximum 100 volunteers per event</p>
            </div>
          </div>
        </div>

        {/* Required Skills */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Required Skills *
            <span className="text-sm font-normal text-slate-600 ml-2">
              ({formData.requiredSkills.length} selected)
            </span>
          </h3>
          
          {errors.requiredSkills && (
            <p className="text-sm text-red-600 mb-4">{errors.requiredSkills}</p>
          )}
          
          {/* Skills Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            {availableSkills.map((skill) => (
              <label key={skill} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.requiredSkills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">{skill}</span>
              </label>
            ))}
          </div>

          {/* Selected Skills Display */}
          {formData.requiredSkills.length > 0 && (
            <div>
              <p className="text-sm text-slate-600 mb-2">Selected Skills:</p>
              <div className="flex flex-wrap gap-2">
                {formData.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 pt-4 border-t border-slate-200">
          <a
            href="/dashboard/admin/events"
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors text-center"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-indigo-400 text-white opacity-50 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating Event...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Create Event
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}