import { useState, useEffect } from 'react';
import { ProfileService } from '~/services/api';

interface TimeSlot {
  id?: string;
  dayOfWeek?: string;
  specificDate?: string;
  isRecurring?: boolean;
  startTime: string;
  endTime: string;
}

interface DateTimeSlot {
  date: string; // YYYY-MM-DD format
  startTime: string;
  endTime: string;
}

interface RegisteredEvent {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
}

export default function Availability() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<DateTimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [recurringAvailability, setRecurringAvailability] = useState<TimeSlot[]>([]);

  // Load existing availability and events
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load availability from profile
        const backendProfile = await ProfileService.getCurrentBackendProfile();
        const availability = backendProfile?.availability || [];
        setRecurringAvailability(availability);
        console.log('Loaded availability:', availability);

        // Convert loaded availability to selectedDates format for display
        const loadedDateSlots: DateTimeSlot[] = [];
        availability.forEach((slot: TimeSlot) => {
          // Only load specific date availability (not recurring)
          if (!slot.isRecurring && slot.specificDate) {
            // Parse the ISO date string and extract just the date part (YYYY-MM-DD)
            // This avoids timezone conversion issues
            const dateStr = slot.specificDate.split('T')[0];
            loadedDateSlots.push({
              date: dateStr,
              startTime: slot.startTime,
              endTime: slot.endTime
            });
          }
        });

        setSelectedDates(loadedDateSlots);
        console.log('Loaded date slots into UI:', loadedDateSlots);

        // Load registered events
        const response = await fetch('http://localhost:3001/api/events/my-events', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setRegisteredEvents(data.data.events || []);
          console.log('Loaded registered events:', data.data.events);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  // Generate calendar days for current month
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateSelected = (date: Date): boolean => {
    const dateStr = formatDate(date);
    return selectedDates.some(slot => slot.date === dateStr);
  };

  const getTimeSlotsForDate = (date: Date): DateTimeSlot[] => {
    const dateStr = formatDate(date);
    return selectedDates.filter(slot => slot.date === dateStr);
  };

  const hasEventOnDate = (date: Date): boolean => {
    const dateStr = formatDate(date);
    return registeredEvents.some(event => {
      const eventStart = new Date(event.startDate);
      const eventStartStr = formatDate(eventStart);
      return eventStartStr === dateStr;
    });
  };

  const getEventsForDate = (date: Date): RegisteredEvent[] => {
    const dateStr = formatDate(date);
    return registeredEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventStartStr = formatDate(eventStart);
      return eventStartStr === dateStr;
    });
  };

  const hasRecurringAvailability = (date: Date): boolean => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[date.getDay()];

    // Only check for recurring patterns (not specific dates, as those are in selectedDates)
    return recurringAvailability.some(slot => {
      if (slot.isRecurring !== false && slot.dayOfWeek) {
        return slot.dayOfWeek === dayOfWeek;
      }
      return false;
    });
  };

  const getRecurringAvailabilityForDate = (date: Date): TimeSlot[] => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = dayNames[date.getDay()];

    // Only return recurring slots (not specific dates, as those are in selectedDates)
    return recurringAvailability.filter(slot => {
      if (slot.isRecurring !== false && slot.dayOfWeek) {
        return slot.dayOfWeek === dayOfWeek;
      }
      return false;
    });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(formatDate(date));
  };

  const handleAddTimeSlot = () => {
    if (!selectedDate) return;

    const newSlot: DateTimeSlot = {
      date: selectedDate,
      startTime,
      endTime
    };

    setSelectedDates(prev => [...prev, newSlot]);
    setMessage({ type: 'success', text: 'Time slot added' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleRemoveTimeSlot = (index: number) => {
    setSelectedDates(prev => prev.filter((_, i) => i !== index));
    setMessage({ type: 'success', text: 'Time slot removed' });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveAvailability = async () => {
    try {
      setIsSaving(true);

      // Convert selected dates to specific date availability slots
      const availability = selectedDates.map(slot => ({
        specificDate: slot.date + 'T12:00:00Z', // Use noon UTC to avoid timezone shift issues
        isRecurring: false, // Mark as date-specific, not recurring
        startTime: slot.startTime,
        endTime: slot.endTime
      }));

      console.log('Availability data to send:', availability);

      // Get current profile
      const currentProfile = await ProfileService.getProfile();

      // Create a clean profile object without spreading to avoid TypeScript issues
      const profileUpdate = {
        firstName: currentProfile.firstName,
        lastName: currentProfile.lastName,
        phone: currentProfile.phone,
        address: currentProfile.address,
        city: currentProfile.city,
        state: currentProfile.state,
        zipCode: currentProfile.zipCode,
        bio: currentProfile.bio || '',
        skills: currentProfile.skills || [],
        availability: availability as any // Our new specific date availability
      };

      console.log('Profile update payload:', profileUpdate);

      // Update profile with new availability
      await ProfileService.updateProfile(profileUpdate);

      setMessage({ type: 'success', text: 'Availability saved successfully!' });
      setTimeout(() => setMessage(null), 3000);

      // Reload availability after saving
      const backendProfile = await ProfileService.getCurrentBackendProfile();
      const freshAvailability = backendProfile?.availability || [];
      setRecurringAvailability(freshAvailability);

      // Reload the selectedDates from the fresh data to avoid duplicates
      const freshDateSlots: DateTimeSlot[] = [];
      freshAvailability.forEach((slot: TimeSlot) => {
        if (!slot.isRecurring && slot.specificDate) {
          const dateStr = slot.specificDate.split('T')[0];
          freshDateSlots.push({
            date: dateStr,
            startTime: slot.startTime,
            endTime: slot.endTime
          });
        }
      });
      setSelectedDates(freshDateSlots);
    } catch (error) {
      console.error('Failed to save availability:', error);
      setMessage({ type: 'error', text: 'Failed to save availability' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = getDaysInMonth();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
    const hour = String(i).padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Availability</h1>
          <p className="text-slate-600 mt-1">Set your available dates and times for volunteering</p>
        </div>
        <button
          onClick={handleSaveAvailability}
          disabled={isSaving || selectedDates.length === 0}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
        >
          {isSaving ? 'Saving...' : 'Save Availability'}
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-slate-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-100 rounded-lg transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const isToday = date.toDateString() === new Date().toDateString();
              const isPast = date < new Date() && !isToday;
              const isSelected = isDateSelected(date);
              const hasRecurring = hasRecurringAvailability(date);
              const hasEvent = hasEventOnDate(date);
              const dateStr = formatDate(date);
              const isCurrentlySelected = selectedDate === dateStr;
              const timeSlots = getTimeSlotsForDate(date);
              const recurringSlots = getRecurringAvailabilityForDate(date);
              const events = getEventsForDate(date);
              const hasAvailability = isSelected || hasRecurring;

              return (
                <button
                  key={index}
                  onClick={() => !isPast && handleDateClick(date)}
                  disabled={isPast}
                  className={`aspect-square p-2 rounded-lg text-center transition relative ${
                    isCurrentlySelected
                      ? 'bg-indigo-600 text-white'
                      : hasEvent
                      ? 'bg-red-100 text-red-900 border-2 border-red-300 hover:bg-red-200'
                      : hasAvailability
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : isToday
                      ? 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                      : isPast
                      ? 'bg-slate-50 text-slate-400 cursor-not-allowed'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-900'
                  }`}
                  title={hasEvent ? events.map(e => e.title).join(', ') : ''}
                >
                  <div className="font-medium">{date.getDate()}</div>
                  {hasEvent && (
                    <div className="text-xs mt-1 font-bold">
                      {events.length} event{events.length !== 1 ? 's' : ''}
                    </div>
                  )}
                  {!hasEvent && (timeSlots.length > 0 || recurringSlots.length > 0) && (
                    <div className="text-xs mt-1">
                      {timeSlots.length + recurringSlots.length} slot{(timeSlots.length + recurringSlots.length) !== 1 ? 's' : ''}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Legend</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded"></div>
                <span>Event Scheduled</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                <span className="text-white bg-slate-700 px-1 rounded">Selected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Time selection panel */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">
            {selectedDate ? `Date Details` : 'Select a Date'}
          </h3>

          {selectedDate ? (
            <div className="space-y-4">
              {/* Show events for selected date if any */}
              {(() => {
                const selectedDateObj = new Date(selectedDate + 'T00:00:00');
                const eventsOnDate = getEventsForDate(selectedDateObj);

                if (eventsOnDate.length > 0) {
                  return (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="text-sm font-semibold text-red-900 mb-2">
                        Registered Events on this Date
                      </h4>
                      {eventsOnDate.map(event => (
                        <div key={event.id} className="text-sm text-red-800 mb-1">
                          • {event.title}
                        </div>
                      ))}
                      <p className="text-xs text-red-600 mt-2">
                        You cannot add availability on dates with registered events.
                      </p>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Only show time slot controls if no events on this date */}
              {!hasEventOnDate(new Date(selectedDate + 'T00:00:00')) && (
                <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Time
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Time
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {TIME_SLOTS.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAddTimeSlot}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Add Time Slot
              </button>

              {/* Show existing time slots for selected date */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">Time Slots</h4>
                <div className="space-y-2">
                  {selectedDates
                    .filter(slot => slot.date === selectedDate)
                    .map((slot, index) => {
                      const actualIndex = selectedDates.findIndex(s => s === slot);
                      return (
                        <div key={index} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                          <span className="text-sm">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <button
                            onClick={() => handleRemoveTimeSlot(actualIndex)}
                            className="text-red-600 hover:text-red-800 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  {selectedDates.filter(slot => slot.date === selectedDate).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-2">
                      No time slots added yet
                    </p>
                  )}
                </div>
              </div>
                </>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-8">
              Click on a date in the calendar to add time slots
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      {selectedDates.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Availability Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDates.map((slot, index) => {
              // Parse date without timezone conversion
              // slot.date is in YYYY-MM-DD format
              const [year, month, day] = slot.date.split('-').map(Number);
              const dateObj = new Date(year, month - 1, day); // month is 0-indexed

              return (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-900">
                    {dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-sm text-green-700">
                    {slot.startTime} - {slot.endTime}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
