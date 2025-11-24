import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { SkillsService, EventService, type FrontendEvent } from "~/services/api";
import { showSuccess, showError, showWarning } from "~/utils/toast";

interface EventFormData {
  eventName: string;
  eventDescription: string;
  location: string;
  requiredSkills: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  eventDate: string;
  eventTime: string;
  volunteersNeeded: number;
}

interface FormErrors {
  eventName?: string;
  eventDescription?: string;
  location?: string;
  requiredSkills?: string;
  urgency?: string;
  eventDate?: string;
  eventTime?: string;
  volunteersNeeded?: string;
}

export default function EditEventPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<EventFormData>({
    eventName: '',
    eventDescription: '',
    location: '',
    requiredSkills: [],
    urgency: 'MEDIUM',
    eventDate: '',
    eventTime: '',
    volunteersNeeded: 1
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
        setAvailableSkills([]);
      }
    };

    loadSkills();
  }, []);

  // Load event data for editing
  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) {
        console.error('No event ID provided');
        navigate('/dashboard/admin/events');
        return;
      }

      try {
        setIsLoading(true);
        // Get all events and find the one we're editing
        const events = await EventService.getEvents();
        const event = events.find(e => e.id === eventId);

        if (!event) {
          showError('Event not found');
          navigate('/dashboard/admin/events');
          return;
        }

        // Parse date and time from the event data
        const eventDateTime = new Date(event.date);
        const eventDate = eventDateTime.toISOString().split('T')[0];
        const eventTime = eventDateTime.toTimeString().slice(0, 5);

        setFormData({
          eventName: event.title,
          eventDescription: event.description || '',
          location: event.location,
          requiredSkills: [], // Would need to fetch from detailed event API
          urgency: 'MEDIUM', // Would need urgency from backend
          eventDate,
          eventTime,
          volunteersNeeded: event.maxVolunteers
        });
      } catch (error) {
        console.error('Failed to load event:', error);
        showError('Failed to load event data');
        navigate('/dashboard/admin/events');
      } finally {
        setIsLoading(false);
      }
    };

    loadEvent();
  }, [eventId, navigate]);

  const validateField = (name: string, value: any): string | null => {
    switch (name) {
      case 'eventName':
        if (!value) return 'Event name is required';
        if (value.length > 100) return 'Event name cannot exceed 100 characters';
        return null;
      case 'eventDescription':
        if (!value) return 'Event description is required';
        if (value.length > 500) return 'Description cannot exceed 500 characters';
        return null;
      case 'location':
        if (!value) return 'Location is required';
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
        if (value > 1000) return 'Cannot exceed 1000 volunteers';
        return null;
      default:
        return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Convert string to number for volunteersNeeded
    const finalValue = name === 'volunteersNeeded' ? parseInt(value) || 0 : value;

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));

    // Clear error for this field if it exists
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Validate field
    const error = validateField(name, finalValue);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
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

    if (!eventId) {
      showWarning('No event ID provided');
      return;
    }

    setIsSubmitting(true);

    try {
      // Combine date and time
      const eventDateTime = new Date(`${formData.eventDate}T${formData.eventTime}:00`);

      const updateData: Partial<FrontendEvent> = {
        title: formData.eventName,
        description: formData.eventDescription,
        location: formData.location,
        date: eventDateTime.toISOString(),
        maxVolunteers: formData.volunteersNeeded,
      };

      await EventService.updateEvent(eventId, updateData);

      setShowSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/admin/events');
      }, 2000);

    } catch (error) {
      console.error('Error updating event:', error);
      showError('Failed to update event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.includes(skill)
        ? prev.requiredSkills.filter(s => s !== skill)
        : [...prev.requiredSkills, skill]
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-green-900 mb-2">Event Updated Successfully!</h2>
          <p className="text-green-700 mb-4">The event has been updated and changes are now live.</p>
          <p className="text-sm text-green-600">Redirecting to event management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/admin/events')}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 title-gradient">Edit Event</h1>
          <p className="text-slate-600 mt-1">Update event details and settings</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-8 space-y-6">
        {/* Event Name */}
        <div>
          <label className="label">Event Name *</label>
          <input
            type="text"
            name="eventName"
            value={formData.eventName}
            onChange={handleInputChange}
            className={`input ${errors.eventName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Enter event name"
          />
          {errors.eventName && <p className="text-red-600 text-sm mt-1">{errors.eventName}</p>}
        </div>

        {/* Event Description */}
        <div>
          <label className="label">Event Description *</label>
          <textarea
            name="eventDescription"
            value={formData.eventDescription}
            onChange={handleInputChange}
            rows={4}
            className={`input resize-none ${errors.eventDescription ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Describe the event, activities, and what volunteers will be doing"
          />
          {errors.eventDescription && <p className="text-red-600 text-sm mt-1">{errors.eventDescription}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="label">Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className={`input ${errors.location ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            placeholder="Enter full address or venue name"
          />
          {errors.location && <p className="text-red-600 text-sm mt-1">{errors.location}</p>}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Event Date *</label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleInputChange}
              className={`input ${errors.eventDate ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.eventDate && <p className="text-red-600 text-sm mt-1">{errors.eventDate}</p>}
          </div>

          <div>
            <label className="label">Start Time *</label>
            <input
              type="time"
              name="eventTime"
              value={formData.eventTime}
              onChange={handleInputChange}
              className={`input ${errors.eventTime ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.eventTime && <p className="text-red-600 text-sm mt-1">{errors.eventTime}</p>}
          </div>
        </div>

        {/* Urgency and Volunteers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Urgency Level</label>
            <select
              name="urgency"
              value={formData.urgency}
              onChange={handleInputChange}
              className="input"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="label">Volunteers Needed *</label>
            <input
              type="number"
              name="volunteersNeeded"
              value={formData.volunteersNeeded}
              onChange={handleInputChange}
              min="1"
              max="1000"
              className={`input ${errors.volunteersNeeded ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.volunteersNeeded && <p className="text-red-600 text-sm mt-1">{errors.volunteersNeeded}</p>}
          </div>
        </div>

        {/* Required Skills */}
        <div>
          <label className="label">Required Skills</label>
          <p className="text-sm text-slate-600 mb-3">Select the skills needed for this event</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-4">
            {availableSkills.map((skill) => (
              <label key={skill} className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={formData.requiredSkills.includes(skill)}
                  onChange={() => handleSkillToggle(skill)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700">{skill}</span>
              </label>
            ))}
          </div>
          {errors.requiredSkills && <p className="text-red-600 text-sm mt-1">{errors.requiredSkills}</p>}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-200">
          <button
            type="button"
            onClick={() => navigate('/dashboard/admin/events')}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary px-8 py-3 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Update Event
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}