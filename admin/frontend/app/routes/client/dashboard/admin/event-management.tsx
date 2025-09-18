import { useState } from 'react';

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
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED';
}

export default function EventManagementPage() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      eventName: 'Community Food Drive',
      eventDescription: 'Help pack and distribute food to families in need',
      location: 'Community Center - 123 Community Center St, Springfield, IL',
      requiredSkills: ['Food Service', 'Manual Labor', 'Customer Service'],
      urgency: 'HIGH',
      eventDate: new Date('2024-02-15'),
      volunteersNeeded: 15,
      volunteersAssigned: 8,
      status: 'PUBLISHED'
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
      volunteersAssigned: 12,
      status: 'PUBLISHED'
    },
    {
      id: '3',
      eventName: 'Senior Center Activity Day',
      eventDescription: 'Organize activities and provide companionship for seniors',
      location: 'Golden Years Senior Center - 789 Elder St, Springfield, IL',
      requiredSkills: ['Social Work', 'Event Planning', 'Entertainment'],
      urgency: 'LOW',
      eventDate: new Date('2024-02-25'),
      volunteersNeeded: 10,
      volunteersAssigned: 6,
      status: 'DRAFT'
    }
  ]);

  const [filter, setFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(event => {
    const matchesFilter = filter === 'ALL' || event.status === filter;
    const matchesSearch = event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      setEvents(events.filter(e => e.id !== eventId));
    }
  };

  const handleStatusChange = (eventId: string, newStatus: Event['status']) => {
    setEvents(events.map(e => 
      e.id === eventId ? { ...e, status: newStatus } : e
    ));
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-blue-100 text-blue-800';
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 title-gradient">Event Management</h1>
          <p className="text-slate-600 mt-2">Create, edit, and manage volunteer events</p>
        </div>
        <a
          href="/dashboard/admin/create-event"
          className="btn-primary w-auto px-6 py-3 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Event
        </a>
      </div>

      {/* Filters and Search */}
      <div className="card p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <label className="label">Search Events</label>
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Filter by Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as typeof filter)}
              className="input"
            >
              <option value="ALL">All Events</option>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
        {filteredEvents.map((event) => (
          <div key={event.id} className="card p-4 md:p-6 hover:shadow-lg transition-shadow">
            {/* Event Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-slate-800 mb-2">
                  {event.eventName}
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  {event.eventDescription}
                </p>
              </div>
              <div className="flex space-x-1 ml-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(event.urgency)}`}>
                  {event.urgency}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-slate-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {event.eventDate.toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{event.location}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {event.volunteersAssigned}/{event.volunteersNeeded} volunteers
              </div>
            </div>

            {/* Required Skills */}
            <div className="mb-4">
              <p className="text-xs text-slate-500 mb-2">Required Skills:</p>
              <div className="flex flex-wrap gap-1">
                {event.requiredSkills.map((skill) => (
                  <span key={skill} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Status</label>
                <select
                  value={event.status}
                  onChange={(e) => handleStatusChange(event.id, e.target.value as Event['status'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="card p-8 text-center">
          <div className="text-slate-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-600 mb-2">No events found</h3>
          <p className="text-slate-500 mb-4">
            {searchTerm || filter !== 'ALL' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first event.'
            }
          </p>
          <a href="/dashboard/admin/create-event" className="btn-primary w-auto px-6 py-3 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Event
          </a>
        </div>
      )}
    </div>
  );
}