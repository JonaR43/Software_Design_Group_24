import { useState, useEffect } from 'react';
import { EventService, MatchingService, EventVolunteerService, type VolunteerMatch } from '../../../../services/api';
import { showSuccess, showError } from "~/utils/toast";

interface EventOption {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  maxVolunteers: number;
  currentVolunteers: number;
}

export default function VolunteerMatchingPage() {
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [events, setEvents] = useState<EventOption[]>([]);
  const [matches, setMatches] = useState<VolunteerMatch[]>([]);
  const [assignments, setAssignments] = useState<string[]>([]);
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Fetch events on component mount
  useEffect(() => {
    async function fetchEvents() {
      try {
        setIsLoadingEvents(true);
        const fetchedEvents = await EventService.getEvents({ status: 'published' });

        // Transform to EventOption format
        const eventOptions: EventOption[] = fetchedEvents.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description || '',
          location: event.location,
          startDate: event.date,
          maxVolunteers: event.maxVolunteers,
          currentVolunteers: event.volunteers
        }));

        setEvents(eventOptions);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    }

    fetchEvents();
  }, []);


  const handleEventSelect = async (eventId: string) => {
    setSelectedEvent(eventId);
    setIsGeneratingMatches(true);

    try {
      console.log('Fetching matches for event:', eventId); // Debug log
      // Call the matching API to get volunteer matches for this event
      const volunteerMatches = await MatchingService.findVolunteersForEvent(eventId, {
        limit: 20,
        minScore: 0,
        includeAssigned: false
      });

      console.log('Received matches:', volunteerMatches); // Debug log
      console.log('First match detail:', volunteerMatches[0]); // Debug first match
      console.log('First match profile:', volunteerMatches[0]?.volunteer?.profile); // Debug profile
      console.log('First match reasons:', volunteerMatches[0]?.matchReasons); // Debug reasons
      console.log('First match recommendations:', volunteerMatches[0]?.recommendations); // Debug recommendations
      setMatches(volunteerMatches);
    } catch (error) {
      console.error('Failed to generate matches:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error'); // Debug log
      showError(`Error loading matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setMatches([]);
    } finally {
      setIsGeneratingMatches(false);
    }
  };

  const handleVolunteerAssignment = async (volunteerId: string) => {
    try {
      // Find the match to get the match score
      const match = matches.find(m => m.volunteer.id === volunteerId);

      // Assign volunteer to the event via API
      await EventService.assignVolunteer(selectedEvent, volunteerId, {
        matchScore: match?.matchScore,
        notes: `Auto-assigned via matching algorithm with score: ${match?.matchScore || 0}`
      });

      // Update local state
      setAssignments(prev => [...prev, volunteerId]);
      setMatches(prev => prev.filter(match => match.volunteer.id !== volunteerId));

      showSuccess('Volunteer successfully assigned to event!');
    } catch (error) {
      console.error('Failed to assign volunteer:', error);
      showError(`Failed to assign volunteer: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMatchScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-900 title-gradient">Volunteer Matching</h1>
        <p className="text-slate-600 mt-2">Match volunteers to events based on skills, availability, and preferences</p>
      </div>

      {/* Event Selection */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Select Event for Matching</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="label">Choose Event</label>
            <select
              value={selectedEvent}
              onChange={(e) => handleEventSelect(e.target.value)}
              className="input"
            >
              <option value="">Select an event...</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title} - {event.startDate}
                </option>
              ))}
            </select>
          </div>

          {selectedEvent && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">Event Details</h4>
              {(() => {
                const event = events.find(e => e.id === selectedEvent);
                return event ? (
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {event.title}</p>
                    <p><span className="font-medium">Date:</span> {event.startDate}</p>
                    <p><span className="font-medium">Location:</span> {event.location}</p>
                    <p><span className="font-medium">Volunteers Needed:</span> {event.maxVolunteers - event.currentVolunteers} more</p>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isGeneratingMatches && (
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Generating volunteer matches...</p>
        </div>
      )}

      {/* Assignment Summary */}
      {assignments.length > 0 && (
        <div className="card p-6 bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Recent Assignments</h3>
          <p className="text-green-700">
            {assignments.length} volunteer{assignments.length !== 1 ? 's' : ''} assigned to this event.
          </p>
        </div>
      )}

      {/* Matching Results */}
      {matches.length > 0 && !isGeneratingMatches && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-slate-800">
              Suggested Matches ({matches.length} found)
            </h3>
            <div className="text-sm text-slate-600">
              Sorted by match score (highest first)
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {matches.map((match) => (
            <div key={match.volunteer.id} className="card p-4 md:p-6 hover:shadow-lg transition-shadow">
              {/* Volunteer Info Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-slate-800">
                    {match.volunteer?.profile?.firstName || 'Unknown'} {match.volunteer?.profile?.lastName || 'Volunteer'}
                  </h4>
                  <p className="text-sm text-slate-600">{match.volunteer?.email || 'No email'}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-slate-600">Match:</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className={`h-2 rounded-full ${getMatchScoreBarColor(match.matchScore || 0)}`}
                          style={{ width: `${match.matchScore || 0}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${getMatchScoreColor(match.matchScore || 0)}`}>
                        {match.matchScore || 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Reasons */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-slate-700 mb-2">Why this volunteer matches:</h5>
                <div className="space-y-1">
                  {(match.matchReasons || match.recommendations?.map(r => r.message) || []).map((reason, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                      <p className="text-sm text-slate-600">{typeof reason === 'string' ? reason : (reason as any).message || String(reason)}</p>
                    </div>
                  ))}
                  {(!match.matchReasons || match.matchReasons.length === 0) && (!match.recommendations || match.recommendations.length === 0) && (
                    <p className="text-sm text-slate-500 italic">No specific recommendations available</p>
                  )}
                </div>
              </div>

              {/* Volunteer Details */}
              <div className="space-y-3 mb-4 text-sm">
                <div>
                  <p className="font-medium text-slate-700 mb-1">Match Quality:</p>
                  <span className={`px-3 py-1 text-xs rounded font-medium ${
                    match.matchQuality === 'EXCELLENT' ? 'bg-green-100 text-green-800' :
                    match.matchQuality === 'VERY_GOOD' ? 'bg-blue-100 text-blue-800' :
                    match.matchQuality === 'GOOD' ? 'bg-indigo-100 text-indigo-800' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {match.matchQuality?.replace('_', ' ') || 'Unknown'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-slate-700 mb-1">Location:</p>
                    <p className="text-slate-600">
                      {match.volunteer?.profile?.city || 'N/A'}, {match.volunteer?.profile?.state || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 mb-1">Score Breakdown:</p>
                    <p className="text-slate-600 text-xs">
                      Skills: {match.scoreBreakdown?.skills || 0}%<br/>
                      Location: {match.scoreBreakdown?.location || 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button - Now at bottom of card */}
              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => handleVolunteerAssignment(match.volunteer.id)}
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Assign Volunteer
                </button>
              </div>
            </div>
          ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!selectedEvent && (
        <div className="card p-8 text-center">
          <div className="text-slate-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">Select an Event to Begin Matching</h3>
          <p className="text-slate-500">
            Choose an event from the dropdown above to see suggested volunteer matches based on skills, availability, and location.
          </p>
        </div>
      )}

      {/* No Matches State */}
      {selectedEvent && matches.length === 0 && !isGeneratingMatches && (
        <div className="card p-8 text-center">
          <div className="text-slate-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.678-4.29-3.75 0-2.072 1.95-3.75 4.29-3.75s4.29 1.678 4.29 3.75A7.963 7.963 0 0017 13.291M15 19.5a3 3 0 01-6 0v-7.5a3 3 0 016 0v7.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">No Available Matches Found</h3>
          <p className="text-slate-500">
            All suitable volunteers have already been assigned to events, or no volunteers match the requirements for this event.
          </p>
        </div>
      )}
    </div>
  );
}