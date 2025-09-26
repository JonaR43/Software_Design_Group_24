import { useState } from 'react';

interface VolunteerHistoryData {
  eventId: string;
  eventName: string;
  eventDescription: string;
  location: string;
  requiredSkills: string[];
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  eventDate: Date;
  participationStatus: 'COMPLETED' | 'NO_SHOW' | 'CANCELLED' | 'UPCOMING';
  hoursWorked?: number;
  feedback?: string;
}

export default function VolunteerHistoryPage() {
  const [filter, setFilter] = useState<'ALL' | 'COMPLETED' | 'UPCOMING' | 'CANCELLED' | 'NO_SHOW'>('ALL');
  const [sortBy, setSortBy] = useState<keyof VolunteerHistoryData>('eventDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock volunteer history data
  const mockHistory: VolunteerHistoryData[] = [
    {
      eventId: '1',
      eventName: 'Community Food Drive',
      eventDescription: 'Help pack and distribute food to families in need',
      location: 'Community Center - 123 Community Center St, Springfield, IL',
      requiredSkills: ['Food Service', 'Manual Labor', 'Customer Service'],
      urgency: 'HIGH',
      eventDate: new Date('2024-01-15'),
      participationStatus: 'COMPLETED',
      hoursWorked: 6,
      feedback: 'Excellent volunteer! Very helpful with food distribution and showed great teamwork.'
    },
    {
      eventId: '2',
      eventName: 'Park Cleanup Initiative',
      eventDescription: 'Clean up and beautify our local community park',
      location: 'Riverside Park - 456 Park Ave, Springfield, IL',
      requiredSkills: ['Manual Labor', 'Environmental Work'],
      urgency: 'MEDIUM',
      eventDate: new Date('2024-01-08'),
      participationStatus: 'COMPLETED',
      hoursWorked: 4,
      feedback: 'Great attitude and worked well with the team. Helped clean up 3 sections of the park.'
    },
    {
      eventId: '3',
      eventName: 'Senior Center Holiday Party',
      eventDescription: 'Help organize and run holiday activities for seniors',
      location: 'Golden Years Senior Center - 789 Elder St, Springfield, IL',
      requiredSkills: ['Event Planning', 'Social Work', 'Entertainment'],
      urgency: 'LOW',
      eventDate: new Date('2023-12-20'),
      participationStatus: 'COMPLETED',
      hoursWorked: 5,
      feedback: 'Wonderful with the seniors! Organized games and brought lots of positive energy.'
    },
    {
      eventId: '4',
      eventName: 'Literacy Program Tutoring',
      eventDescription: 'Help adults improve their reading and writing skills',
      location: 'Public Library - 321 Main St, Springfield, IL',
      requiredSkills: ['Teaching/Training', 'Administrative'],
      urgency: 'MEDIUM',
      eventDate: new Date('2023-12-05'),
      participationStatus: 'NO_SHOW',
      hoursWorked: 0,
      feedback: 'Did not attend scheduled session. Please improve attendance reliability.'
    },
    {
      eventId: '5',
      eventName: 'Emergency Food Kitchen',
      eventDescription: 'Prepare and serve meals to community members in need',
      location: 'St. Mary\'s Church - 555 Faith Ave, Springfield, IL',
      requiredSkills: ['Food Service', 'Customer Service'],
      urgency: 'URGENT',
      eventDate: new Date('2024-02-18'),
      participationStatus: 'UPCOMING',
      hoursWorked: undefined,
      feedback: undefined
    },
    {
      eventId: '6',
      eventName: 'Blood Drive Support',
      eventDescription: 'Assist with registration and support during blood drive',
      location: 'Community Center - 123 Community Center St, Springfield, IL',
      requiredSkills: ['Healthcare', 'Administrative', 'Customer Service'],
      urgency: 'HIGH',
      eventDate: new Date('2024-02-22'),
      participationStatus: 'UPCOMING',
      hoursWorked: undefined,
      feedback: undefined
    }
  ];

  const filteredHistory = mockHistory.filter(item => {
    if (filter === 'ALL') return true;
    return item.participationStatus === filter;
  });

  const sortedHistory = filteredHistory.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    // Handle date sorting
    if (sortBy === 'eventDate') {
      const aDate = new Date(aValue as Date);
      const bDate = new Date(bValue as Date);
      return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
    }
    
    // Handle string sorting
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    
    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'UPCOMING': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      case 'NO_SHOW': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate summary statistics
  const totalEvents = mockHistory.length;
  const completedEvents = mockHistory.filter(e => e.participationStatus === 'COMPLETED').length;
  const totalHours = mockHistory.reduce((sum, event) => sum + (event.hoursWorked || 0), 0);
  const upcomingEvents = mockHistory.filter(e => e.participationStatus === 'UPCOMING').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-800">Volunteer History</h2>
        <p className="text-slate-600 mt-1">Track your volunteer activities and contributions</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Events</p>
              <p className="text-2xl font-semibold text-slate-900">{totalEvents}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-2xl font-semibold text-slate-900">{completedEvents}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Hours</p>
              <p className="text-2xl font-semibold text-slate-900">{totalHours}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Upcoming</p>
              <p className="text-2xl font-semibold text-slate-900">{upcomingEvents}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="card p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="label">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="input"
            >
              <option value="ALL">All Events</option>
              <option value="COMPLETED">Completed</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="NO_SHOW">No Show</option>
            </select>
          </div>
          
          <div>
            <label className="label">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as keyof VolunteerHistoryData)}
              className="input"
            >
              <option value="eventDate">Date</option>
              <option value="eventName">Event Name</option>
              <option value="participationStatus">Status</option>
              <option value="urgency">Urgency</option>
            </select>
          </div>
          
          <button 
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>

          <div className="ml-auto">
            <button className="btn-secondary text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 font-medium text-slate-700">Event Details</th>
                <th className="text-left p-4 font-medium text-slate-700">Date</th>
                <th className="text-left p-4 font-medium text-slate-700">Location</th>
                <th className="text-left p-4 font-medium text-slate-700">Skills Required</th>
                <th className="text-left p-4 font-medium text-slate-700">Urgency</th>
                <th className="text-left p-4 font-medium text-slate-700">Status</th>
                <th className="text-left p-4 font-medium text-slate-700">Hours</th>
                <th className="text-left p-4 font-medium text-slate-700">Feedback</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((item) => (
                <tr key={item.eventId} className="border-t border-slate-200 hover:bg-slate-50">
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-slate-900 mb-1">{item.eventName}</div>
                      <div className="text-sm text-slate-600 line-clamp-2">{item.eventDescription}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-medium text-slate-900">
                        {item.eventDate.toLocaleDateString()}
                      </div>
                      <div className="text-slate-500">
                        {item.eventDate.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-600 max-w-48">
                      {item.location}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {item.requiredSkills.slice(0, 2).map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {item.requiredSkills.length > 2 && (
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">
                          +{item.requiredSkills.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(item.urgency)}`}>
                      {item.urgency}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.participationStatus)}`}>
                      {item.participationStatus.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-medium text-slate-900">
                      {item.hoursWorked ? `${item.hoursWorked}h` : '-'}
                    </div>
                  </td>
                  <td className="p-4">
                    {item.feedback ? (
                      <div className="max-w-64">
                        <p className="text-sm text-slate-600 line-clamp-2">{item.feedback}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-slate-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">No events found</h3>
          <p className="text-slate-500 mb-4">
            {filter !== 'ALL' 
              ? `No events found with status "${filter}". Try adjusting your filter.`
              : 'You haven\'t participated in any events yet. Check out available events to get started!'
            }
          </p>
          <a href="/dashboard/events" className="btn-primary">
            Browse Events
          </a>
        </div>
      )}
    </div>
  );
}