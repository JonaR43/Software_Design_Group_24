import { useState } from 'react';

interface EventFormData {
  eventName: string;
  eventDescription: string;
  location: string;
  requiredSkills: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  eventDate: string;
  volunteersNeeded: number;
}

interface FormErrors {
  eventName?: string;
  eventDescription?: string;
  location?: string;
  requiredSkills?: string;
  urgency?: string;
  eventDate?: string;
  volunteersNeeded?: string;
}

export default function CreateEventPage() {
  const [formData, setFormData] = useState<EventFormData>({
    eventName: '',
    eventDescription: '',
    location: '',
    requiredSkills: [],
    urgency: 'MEDIUM',
    eventDate: '',
    volunteersNeeded: 1
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Available skills list (same as profile)
  const availableSkills = [
    'Event Planning', 'Public Speaking', 'Marketing', 'Fundraising',
    'Food Service', 'Manual Labor', 'Administrative', 'Teaching/Training',
    'Healthcare', 'Technology', 'Customer Service', 'Transportation',
    'Photography', 'Social Media', 'Writing', 'Translation',
    'Environmental Work', 'Construction', 'Childcare', 'Elder Care',
    'Animal Care', 'Arts & Crafts', 'Music & Entertainment', 'Sports Coaching',
    'Legal Services'
  ];

  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'eventName':
        if (!value) return 'Event name is required';
        if (value.length > 100) return 'Event name cannot exceed 100 characters';
        return null;
      
      case 'eventDescription':
        if (!value) return 'Event description is required';
        return null;
      
      case 'location':
        if (!value) return 'Location is required';
        return null;
      
      case 'requiredSkills':
        if (!Array.isArray(value) || value.length === 0) {
          return 'At least one required skill must be selected';
        }
        return null;
      
      case 'urgency':
        if (!value) return 'Urgency level is required';
        return null;
      
      case 'eventDate':
        if (!value) return 'Event date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) return 'Event date cannot be in the past';
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
      // Mock API call - in real app would make actual request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setFormData({
          eventName: '',
          eventDescription: '',
          location: '',
          requiredSkills: [],
          urgency: 'MEDIUM',
          eventDate: '',
          volunteersNeeded: 1
        });
        setShowSuccess(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error creating event:', error);
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

          {/* Location */}
          <div>
            <label className="label">Location *</label>
            <textarea
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className={`input min-h-20 ${errors.location ? 'border-red-500' : ''}`}
              placeholder="Enter full address and any specific location details"
              rows={3}
            />
            {errors.location && (
              <p className="text-sm text-red-600 mt-1">{errors.location}</p>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Event Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Event Date */}
            <div>
              <label className="label">Event Date *</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => handleInputChange('eventDate', e.target.value)}
                className={`input ${errors.eventDate ? 'border-red-500' : ''}`}
              />
              {errors.eventDate && (
                <p className="text-sm text-red-600 mt-1">{errors.eventDate}</p>
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

            {/* Volunteers Needed */}
            <div>
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