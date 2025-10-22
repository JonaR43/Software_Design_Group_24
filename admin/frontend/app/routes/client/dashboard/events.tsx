import { useState, useEffect } from "react";
import { EventService, AuthService, type FrontendEvent, type EventFilters } from "~/services/api";
import EventsMap from "~/components/EventsMap";

export default function Events() {
  const [events, setEvents] = useState<FrontendEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [joiningEvent, setJoiningEvent] = useState<string | null>(null);

  // Recommended events state
  const [recommendedEvents, setRecommendedEvents] = useState<(FrontendEvent & { matchScore?: number; matchReason?: string })[]>([]);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(true);
  const [currentRecommendedIndex, setCurrentRecommendedIndex] = useState(0);

  // Get current user to check role
  const currentUser = AuthService.getCurrentUser();

  // View state
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Filter state - show only published events by default (exclude drafts)
  const [filters, setFilters] = useState<EventFilters>({ status: 'published' });
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load events from backend
  useEffect(() => {
    const loadEvents = async () => {
      try {
        console.log("🎯 Starting to load events from backend...");
        setIsLoading(true);
        setError("");

        console.log("📡 Making API call to EventService.getEvents() with filters:", filters);
        const eventsData = await EventService.getEvents(filters);

        console.log("✅ Successfully received events data:", eventsData);
        console.log("📊 Number of events:", eventsData.length);

        setEvents(eventsData);
        console.log("🎉 Events state updated successfully");
      } catch (err) {
        console.error("💥 Error loading events:", err);
        console.error("🔍 Error details:", {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : 'No stack trace'
        });
        setError("Failed to load events: " + (err instanceof Error ? err.message : 'Unknown error'));
      } finally {
        setIsLoading(false);
        console.log("🏁 Loading finished");
      }
    };

    loadEvents();
  }, [filters]);

  // Load recommended events based on availability
  useEffect(() => {
    const loadRecommendedEvents = async () => {
      console.log('🔍 Checking for recommended events...');
      console.log('Current user role:', currentUser?.role);

      // Only load for volunteers
      if (currentUser?.role !== 'volunteer') {
        console.log('User is not a volunteer, skipping recommendations');
        setIsLoadingRecommended(false);
        return;
      }

      try {
        setIsLoadingRecommended(true);
        console.log('📡 Fetching recommended events...');
        const recommended = await EventService.getRecommendedEvents(6); // Get top 6
        console.log('✅ Received recommended events:', recommended);
        console.log('Number of recommendations:', recommended.length);
        setRecommendedEvents(recommended);
      } catch (err) {
        console.error('❌ Failed to load recommended events:', err);
        // Don't show error, just fail silently for recommendations
      } finally {
        setIsLoadingRecommended(false);
        console.log('Loading recommended events finished');
      }
    };

    loadRecommendedEvents();
  }, [currentUser?.role]);

  // Carousel navigation
  const nextRecommendation = () => {
    if (currentRecommendedIndex < Math.floor(recommendedEvents.length / 3) - 1) {
      setCurrentRecommendedIndex(prev => prev + 1);
    }
  };

  const prevRecommendation = () => {
    if (currentRecommendedIndex > 0) {
      setCurrentRecommendedIndex(prev => prev - 1);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return 'bg-emerald-100 text-emerald-800';
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'full': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      setJoiningEvent(eventId);
      await EventService.joinEvent(eventId);

      // Update local state to reflect the change
      setEvents(events =>
        events.map(event =>
          event.id === eventId
            ? { ...event, status: 'registered', volunteers: event.volunteers + 1 }
            : event
        )
      );

      // Remove from recommended events
      setRecommendedEvents(prevRecommended =>
        prevRecommended.filter(event => event.id !== eventId)
      );

      // Reset carousel index if we're at the end and removed the last event
      if (recommendedEvents.length > 0) {
        const maxIndex = Math.floor((recommendedEvents.length - 1) / 3) - 1;
        if (currentRecommendedIndex > maxIndex) {
          setCurrentRecommendedIndex(Math.max(0, maxIndex));
        }
      }

      alert('Successfully registered for the event! You will receive a confirmation email shortly.');
    } catch (err) {
      console.error("Error joining event:", err);

      // Check if already registered
      if (err instanceof Error && err.message.includes('already registered')) {
        // Update local state to show as registered
        setEvents(events =>
          events.map(event =>
            event.id === eventId
              ? { ...event, status: 'registered' }
              : event
          )
        );

        // Also remove from recommended events if already registered
        setRecommendedEvents(prevRecommended =>
          prevRecommended.filter(event => event.id !== eventId)
        );

        alert('You are already registered for this event!');
      } else {
        setError("Failed to join event");
      }
    } finally {
      setJoiningEvent(null);
    }
  };

  // Filter functions
  const handleFilterEvents = () => {
    setShowFilters(!showFilters);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value || undefined }));
  };

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setShowFilters(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Recommended Events Carousel - Only for volunteers */}
      {currentUser?.role === 'volunteer' && !isLoadingRecommended && recommendedEvents.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Recommended for You</h2>
              <p className="text-slate-600 text-sm mt-1">Based on your availability and preferences</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevRecommendation}
                disabled={currentRecommendedIndex === 0}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Previous recommendations"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={nextRecommendation}
                disabled={currentRecommendedIndex >= Math.floor(recommendedEvents.length / 3) - 1}
                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                aria-label="Next recommendations"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Carousel */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out gap-4"
              style={{ transform: `translateX(-${currentRecommendedIndex * 100}%)` }}
            >
              {recommendedEvents.map((event) => (
                <div key={event.id} className="min-w-[calc(33.333%-0.67rem)] flex-shrink-0">
                  <div className="border border-indigo-200 rounded-lg p-4 bg-gradient-to-br from-indigo-50 to-white hover:shadow-md transition">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-slate-900 line-clamp-2 flex-1">{event.title}</h3>
                      {event.matchScore && (
                        <span className="ml-2 px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full whitespace-nowrap">
                          {event.matchScore}% match
                        </span>
                      )}
                    </div>

                    <div className="space-y-2 text-sm text-slate-600 mb-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="truncate">{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{event.location}</span>
                      </div>
                      {event.matchReason && (
                        <div className="flex items-start gap-2 text-indigo-600">
                          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-xs">{event.matchReason}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={joiningEvent === event.id || event.status === 'registered'}
                      className="w-full px-4 py-2 bg-gradient-to-r from-indigo-700 to-violet-700 text-white rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {joiningEvent === event.id ? "Joining..." : event.status === 'registered' ? "Already Joined" : "Join Event"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Events</h1>
            <p className="text-slate-600 mt-1">Discover and join volunteer opportunities</p>
          </div>
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="bg-white border border-slate-200 rounded-lg p-1 flex gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-gradient-to-r from-indigo-700 to-violet-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  List
                </div>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  viewMode === 'map'
                    ? 'bg-gradient-to-r from-indigo-700 to-violet-700 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Map
                </div>
              </button>
            </div>
            <button
              onClick={handleFilterEvents}
              className="btn-primary px-6 py-2 w-auto flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              {showFilters ? 'Hide Filters' : 'Filter Events'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {Object.keys(filters).length > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="card p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Categories</option>
                  <option value="community">Community Service</option>
                  <option value="environmental">Environmental</option>
                  <option value="educational">Educational</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="food">Food Distribution</option>
                  <option value="social">Social Services</option>
                  <option value="fundraising">Fundraising</option>
                </select>
              </div>

              {/* Urgency Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Urgency Level</label>
                <select
                  value={filters.urgencyLevel || ''}
                  onChange={(e) => handleFilterChange('urgencyLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Urgency Levels</option>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">All Statuses</option>
                  <option value="published">Open for Registration</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Needs Volunteers Filter */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="needsVolunteers"
                checked={filters.needsVolunteers || false}
                onChange={(e) => handleFilterChange('needsVolunteers', e.target.checked.toString())}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
              />
              <label htmlFor="needsVolunteers" className="ml-2 text-sm text-slate-700">
                Only show events that need volunteers
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading events...</p>
          </div>
        </div>
      )}

      {/* Map View */}
      {!isLoading && !error && viewMode === 'map' && (
        <EventsMap
          events={events}
          onJoinEvent={handleJoinEvent}
          joiningEvent={joiningEvent}
        />
      )}

      {/* Events List */}
      {!isLoading && !error && viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-slate-600">No events available at the moment.</p>
            </div>
          ) : (
            events.map((event) => (
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
              {/* Only show join button for volunteers, not admins */}
              {currentUser?.role === 'volunteer' && (
                <>
                  {event.status === 'full' && (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      Full
                    </button>
                  )}
                  {event.status === 'registered' && (
                    <button
                      disabled
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed opacity-75"
                    >
                      Joined
                    </button>
                  )}
                  {event.status === 'open' && (
                    <button
                      onClick={() => handleJoinEvent(event.id)}
                      disabled={joiningEvent === event.id}
                      className="bg-gradient-to-r from-indigo-700 to-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {joiningEvent === event.id ? "Joining..." : "Join Event"}
                    </button>
                  )}
                </>
              )}
              {/* Show message for admins */}
              {currentUser?.role === 'admin' && (
                <div className="text-sm text-slate-500 italic">
                  Admin users cannot join events
                </div>
              )}
            </div>
          </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
