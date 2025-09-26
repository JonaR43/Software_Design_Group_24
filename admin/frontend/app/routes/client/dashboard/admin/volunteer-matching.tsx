import { useState } from 'react';

interface Volunteer {
  id: string;
  fullName: string;
  skills: string[];
  availability: Date[];
  location: string;
  email: string;
  completionRate: number;
}

interface Event {
  id: string;
  eventName: string;
  eventDescription: string;
  location: string;
  requiredSkills: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  eventDate: Date;
  volunteersNeeded: number;
  volunteersAssigned: number;
}

interface VolunteerMatch {
  volunteer: Volunteer;
  event: Event;
  matchScore: number;
  matchReasons: string[];
}

export default function VolunteerMatchingPage() {
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [matches, setMatches] = useState<VolunteerMatch[]>([]);
  const [assignments, setAssignments] = useState<string[]>([]);
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);

  // Mock data
  const mockEvents: Event[] = [
    {
      id: '1',
      eventName: 'Community Food Drive',
      eventDescription: 'Help pack and distribute food to families in need',
      location: 'Community Center - 123 Community Center St, Springfield, IL',
      requiredSkills: ['Food Service', 'Manual Labor', 'Customer Service'],
      urgency: 'HIGH',
      eventDate: new Date('2024-02-15'),
      volunteersNeeded: 15,
      volunteersAssigned: 8
    },
    {
      id: '2',
      eventName: 'Park Cleanup Initiative',
      eventDescription: 'Clean up and beautify our local community park',
      location: 'Riverside Park - 456 Park Ave, Springfield, IL',
      requiredSkills: ['Manual Labor', 'Environmental Work'],
      urgency: 'MEDIUM',
      eventDate: new Date('2024-02-20'),
      volunteersNeeded: 20,
      volunteersAssigned: 12
    }
  ];

  const mockVolunteers: Volunteer[] = [
    {
      id: '1',
      fullName: 'John Smith',
      skills: ['Food Service', 'Manual Labor', 'Customer Service'],
      availability: [new Date('2024-02-15'), new Date('2024-02-16')],
      location: 'Springfield, IL',
      email: 'john.smith@email.com',
      completionRate: 95
    },
    {
      id: '2',
      fullName: 'Maria Garcia',
      skills: ['Food Service', 'Event Planning', 'Administrative'],
      availability: [new Date('2024-02-15'), new Date('2024-02-20')],
      location: 'Springfield, IL',
      email: 'maria.garcia@email.com',
      completionRate: 88
    },
    {
      id: '3',
      fullName: 'David Johnson',
      skills: ['Manual Labor', 'Environmental Work', 'Construction'],
      availability: [new Date('2024-02-20'), new Date('2024-02-21')],
      location: 'Springfield, IL',
      email: 'david.johnson@email.com',
      completionRate: 92
    },
    {
      id: '4',
      fullName: 'Sarah Wilson',
      skills: ['Customer Service', 'Social Media', 'Public Speaking'],
      availability: [new Date('2024-02-15')],
      location: 'Springfield, IL',
      email: 'sarah.wilson@email.com',
      completionRate: 78
    }
  ];

  const calculateMatchScore = (volunteer: Volunteer, event: Event): number => {
    let score = 0;
    const weights = {
      skills: 40,
      availability: 30,
      location: 20,
      reliability: 10
    };

    // Skills matching (40% weight)
    const skillMatches = volunteer.skills.filter(skill => 
      event.requiredSkills.includes(skill)
    ).length;
    const skillsScore = event.requiredSkills.length > 0 
      ? (skillMatches / event.requiredSkills.length) * weights.skills
      : 0;
    score += skillsScore;

    // Availability matching (30% weight)
    const isAvailable = volunteer.availability.some(date => 
      date.toDateString() === event.eventDate.toDateString()
    );
    score += isAvailable ? weights.availability : 0;

    // Location proximity (20% weight) - simplified same city check
    const locationMatch = volunteer.location.includes('Springfield') && 
                         event.location.includes('Springfield');
    score += locationMatch ? weights.location : 10;

    // Reliability score (10% weight)
    const reliabilityScore = (volunteer.completionRate / 100) * weights.reliability;
    score += reliabilityScore;

    return Math.round(score);
  };

  const generateMatchReasons = (volunteer: Volunteer, event: Event, score: number): string[] => {
    const reasons: string[] = [];
    
    const skillMatches = volunteer.skills.filter(skill => 
      event.requiredSkills.includes(skill)
    );
    
    if (skillMatches.length > 0) {
      reasons.push(`Has ${skillMatches.length}/${event.requiredSkills.length} required skills: ${skillMatches.join(', ')}`);
    }
    
    const isAvailable = volunteer.availability.some(date => 
      date.toDateString() === event.eventDate.toDateString()
    );
    if (isAvailable) {
      reasons.push('Available on event date');
    }
    
    if (volunteer.location.includes('Springfield')) {
      reasons.push('Located in same city');
    }
    
    if (volunteer.completionRate >= 90) {
      reasons.push(`High reliability rate (${volunteer.completionRate}%)`);
    } else if (volunteer.completionRate >= 80) {
      reasons.push(`Good reliability rate (${volunteer.completionRate}%)`);
    }

    return reasons;
  };

  const handleEventSelect = async (eventId: string) => {
    setSelectedEvent(eventId);
    setIsGeneratingMatches(true);
    
    const event = mockEvents.find(e => e.id === eventId);
    if (!event) return;
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const eventMatches = mockVolunteers
      .filter(volunteer => !assignments.includes(volunteer.id))
      .map(volunteer => ({
        volunteer,
        event,
        matchScore: calculateMatchScore(volunteer, event),
        matchReasons: generateMatchReasons(volunteer, event, 0)
      }))
      .sort((a, b) => b.matchScore - a.matchScore);
    
    setMatches(eventMatches);
    setIsGeneratingMatches(false);
  };

  const handleVolunteerAssignment = (volunteerId: string) => {
    setAssignments(prev => [...prev, volunteerId]);
    setMatches(prev => prev.filter(match => match.volunteer.id !== volunteerId));
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
              {mockEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.eventName} - {event.eventDate.toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
          
          {selectedEvent && (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-medium text-indigo-900 mb-2">Event Details</h4>
              {(() => {
                const event = mockEvents.find(e => e.id === selectedEvent);
                return event ? (
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Name:</span> {event.eventName}</p>
                    <p><span className="font-medium">Date:</span> {event.eventDate.toLocaleDateString()}</p>
                    <p><span className="font-medium">Location:</span> {event.location}</p>
                    <p><span className="font-medium">Volunteers Needed:</span> {event.volunteersNeeded - event.volunteersAssigned} more</p>
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
                    {match.volunteer.fullName}
                  </h4>
                  <p className="text-sm text-slate-600">{match.volunteer.email}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-slate-600">Match:</span>
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className={`h-2 rounded-full ${getMatchScoreBarColor(match.matchScore)}`}
                          style={{ width: `${match.matchScore}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${getMatchScoreColor(match.matchScore)}`}>
                        {match.matchScore}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Match Reasons */}
              <div className="mb-4">
                <h5 className="text-sm font-medium text-slate-700 mb-2">Why this volunteer matches:</h5>
                <div className="space-y-1">
                  {match.matchReasons.map((reason, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                      <p className="text-sm text-slate-600">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volunteer Details */}
              <div className="space-y-3 mb-4 text-sm">
                <div>
                  <p className="font-medium text-slate-700 mb-1">Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {match.volunteer.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className={`px-2 py-1 text-xs rounded ${
                          match.event.requiredSkills.includes(skill)
                            ? 'bg-green-100 text-green-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                    {match.volunteer.skills.length > 3 && (
                      <span className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-600">
                        +{match.volunteer.skills.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-slate-700 mb-1">Location:</p>
                    <p className="text-slate-600">{match.volunteer.location}</p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-700 mb-1">Completion Rate:</p>
                    <p className="text-slate-600">{match.volunteer.completionRate}%</p>
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