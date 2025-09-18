export default function Events() {
  const events = [
    {
      id: 1,
      title: "Community Food Drive",
      date: "2024-01-15",
      time: "9:00 AM - 2:00 PM",
      location: "Community Center",
      volunteers: 12,
      maxVolunteers: 15,
      status: "open"
    },
    {
      id: 2,
      title: "Youth Mentorship Program",
      date: "2024-01-18",
      time: "3:00 PM - 5:00 PM",
      location: "Local High School",
      volunteers: 8,
      maxVolunteers: 10,
      status: "registered"
    },
    {
      id: 3,
      title: "Park Cleanup Initiative",
      date: "2024-01-20",
      time: "8:00 AM - 12:00 PM",
      location: "Central Park",
      volunteers: 25,
      maxVolunteers: 30,
      status: "open"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-green-100 text-green-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'full': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Events</h1>
          <p className="text-slate-600 mt-1">Discover and join volunteer opportunities</p>
        </div>
        <button className="btn-primary px-6 py-2 w-auto">
          Filter Events
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{event.title}</h3>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {event.date}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {event.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {event.status === 'registered' ? 'Registered' : event.status === 'open' ? 'Open' : 'Full'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                {event.volunteers}/{event.maxVolunteers} volunteers
              </div>
              {event.status !== 'registered' && (
                <button className="bg-gradient-to-r from-indigo-700 to-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-violet-600 transition">
                  Join Event
                </button>
              )}
              {event.status === 'registered' && (
                <button className="bg-gray-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                  Registered
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
