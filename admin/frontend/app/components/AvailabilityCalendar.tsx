import { useState, useEffect } from 'react';

interface TimeSlot {
  id?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface EventBlock {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
}

interface AvailabilityCalendarProps {
  availability: TimeSlot[];
  registeredEvents: EventBlock[];
  isEditing: boolean;
  onAvailabilityChange: (availability: TimeSlot[]) => void;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const TIME_SLOTS = [
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
];

export default function AvailabilityCalendar({
  availability,
  registeredEvents,
  isEditing,
  onAvailabilityChange
}: AvailabilityCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>(availability);
  const [currentWeekDates, setCurrentWeekDates] = useState<Date[]>([]);

  // Calculate the current week's dates (Monday-Sunday)
  useEffect(() => {
    const calculateWeekDates = () => {
      const today = new Date();
      const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Calculate Monday of current week
      const monday = new Date(today);
      const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1; // If Sunday, go back 6 days
      monday.setDate(today.getDate() - daysSinceMonday);
      monday.setHours(0, 0, 0, 0);

      // Generate array of dates for the week (Monday-Sunday)
      const weekDates: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        weekDates.push(date);
      }

      setCurrentWeekDates(weekDates);
    };

    calculateWeekDates();

    // Update daily at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const midnightTimeout = setTimeout(() => {
      calculateWeekDates();
      // Set up daily interval
      const dailyInterval = setInterval(calculateWeekDates, 24 * 60 * 60 * 1000);
      return () => clearInterval(dailyInterval);
    }, timeUntilMidnight);

    return () => clearTimeout(midnightTimeout);
  }, []);

  useEffect(() => {
    setSelectedSlots(availability);
  }, [availability]);

  const handleAddTimeSlot = () => {
    if (!selectedDay) return;

    const newSlot: TimeSlot = {
      dayOfWeek: selectedDay,
      startTime: '09:00',
      endTime: '17:00'
    };

    const updated = [...selectedSlots, newSlot];
    setSelectedSlots(updated);
    onAvailabilityChange(updated);
  };

  const handleRemoveTimeSlot = (index: number) => {
    const updated = selectedSlots.filter((_, i) => i !== index);
    setSelectedSlots(updated);
    onAvailabilityChange(updated);
  };

  const handleUpdateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updated = [...selectedSlots];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedSlots(updated);
    onAvailabilityChange(updated);
  };

  // Get events for a specific day
  const getEventsForDay = (dayName: string) => {
    const dayIndex = DAYS_OF_WEEK.indexOf(dayName);
    return registeredEvents.filter(event => {
      const eventDayIndex = event.date.getDay();
      // Convert Sunday (0) to index 6, Monday (1) to index 0, etc.
      const adjustedEventDay = eventDayIndex === 0 ? 6 : eventDayIndex - 1;
      return adjustedEventDay === dayIndex;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-slate-800">Weekly Availability</h4>
        {isEditing && (
          <span className="text-xs text-slate-500">Click a day to add availability</span>
        )}
      </div>

      {/* Days of week grid */}
      <div className="grid grid-cols-7 gap-1">
        {DAYS_OF_WEEK.map((day, index) => {
          const daySlots = selectedSlots.filter(s => s.dayOfWeek === day);
          const dayEvents = getEventsForDay(day);
          const hasAvailability = daySlots.length > 0;
          const hasEvents = dayEvents.length > 0;
          const dateForDay = currentWeekDates[index];
          const isToday = dateForDay && new Date().toDateString() === dateForDay.toDateString();

          return (
            <button
              key={day}
              onClick={() => isEditing && setSelectedDay(day)}
              disabled={!isEditing}
              className={`p-2 rounded-lg text-center transition ${
                selectedDay === day
                  ? 'bg-indigo-600 text-white'
                  : hasEvents
                  ? 'bg-red-100 text-red-800 border-2 border-red-300'
                  : hasAvailability
                  ? 'bg-green-100 text-green-800'
                  : 'bg-slate-50 text-slate-600'
              } ${isEditing ? 'cursor-pointer hover:bg-indigo-100' : 'cursor-default'} ${
                isToday && selectedDay !== day ? 'ring-2 ring-indigo-400' : ''
              }`}
              title={hasEvents ? `${dayEvents.length} event(s) scheduled` : ''}
            >
              <div className="text-xs font-medium">{day.slice(0, 3)}</div>
              {dateForDay && (
                <div className={`text-xs font-semibold ${isToday ? 'text-indigo-600' : ''}`}>
                  {dateForDay.getDate()}
                </div>
              )}
              {hasAvailability && (
                <div className="text-xs mt-1">
                  {daySlots.length} slot{daySlots.length !== 1 ? 's' : ''}
                </div>
              )}
              {hasEvents && (
                <div className="text-xs mt-1 font-bold">
                  {dayEvents.length} evt
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day time slots */}
      {selectedDay && isEditing && (
        <div className="border-t border-slate-200 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="font-medium text-slate-800">{selectedDay} Availability</h5>
            <button
              onClick={handleAddTimeSlot}
              className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              + Add Time Slot
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedSlots
              .filter(slot => slot.dayOfWeek === selectedDay)
              .map((slot, index) => {
                const actualIndex = selectedSlots.findIndex(
                  (s, i) => s.dayOfWeek === selectedDay && selectedSlots.slice(0, i + 1).filter(x => x.dayOfWeek === selectedDay).length === selectedSlots.slice(0, index + 1).filter(x => x.dayOfWeek === selectedDay).length
                );
                return (
                  <div key={index} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg">
                    <select
                      value={slot.startTime}
                      onChange={(e) => handleUpdateTimeSlot(actualIndex, 'startTime', e.target.value)}
                      className="text-sm px-2 py-1 border border-slate-300 rounded"
                    >
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <span className="text-slate-600">to</span>
                    <select
                      value={slot.endTime}
                      onChange={(e) => handleUpdateTimeSlot(actualIndex, 'endTime', e.target.value)}
                      className="text-sm px-2 py-1 border border-slate-300 rounded"
                    >
                      {TIME_SLOTS.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleRemoveTimeSlot(actualIndex)}
                      className="ml-auto text-red-600 hover:text-red-800 transition"
                      title="Remove time slot"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            {selectedSlots.filter(slot => slot.dayOfWeek === selectedDay).length === 0 && (
              <p className="text-sm text-slate-500 text-center py-4">
                No time slots for {selectedDay}. Click "+ Add Time Slot" to add one.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Registered Events Summary */}
      {registeredEvents.length > 0 && (
        <div className="border-t border-slate-200 pt-4">
          <h5 className="font-medium text-slate-800 mb-2">Registered Events</h5>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {registeredEvents.slice(0, 5).map((event, index) => (
              <div key={index} className="text-xs p-2 bg-red-50 border border-red-200 rounded flex items-center justify-between">
                <span className="font-medium text-red-900">{event.title}</span>
                <span className="text-red-600">
                  {event.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' '}{event.startTime}-{event.endTime}
                </span>
              </div>
            ))}
            {registeredEvents.length > 5 && (
              <p className="text-xs text-slate-500 text-center py-1">
                +{registeredEvents.length - 5} more event(s)
              </p>
            )}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-slate-600 pt-2 border-t border-slate-200">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
          <span>Event Scheduled</span>
        </div>
      </div>
    </div>
  );
}
