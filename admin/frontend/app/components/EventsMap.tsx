import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { useState } from 'react';
import type { FrontendEvent } from '~/services/api';

interface EventsMapProps {
  events: FrontendEvent[];
  onJoinEvent?: (eventId: string) => void;
  joiningEvent?: string | null;
}

export default function EventsMap({ events, onJoinEvent, joiningEvent }: EventsMapProps) {
  const [selectedEvent, setSelectedEvent] = useState<FrontendEvent | null>(null);

  // Get API key from environment variable
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

  // Filter events that have valid coordinates
  const eventsWithCoordinates = events.filter(
    event => event.latitude != null && event.longitude != null
  );

  // Calculate map center (average of all event locations)
  const center = eventsWithCoordinates.length > 0
    ? {
        lat: eventsWithCoordinates.reduce((sum, e) => sum + (e.latitude || 0), 0) / eventsWithCoordinates.length,
        lng: eventsWithCoordinates.reduce((sum, e) => sum + (e.longitude || 0), 0) / eventsWithCoordinates.length,
      }
    : { lat: 40.7128, lng: -74.0060 }; // Default to New York City

  // Get status color for markers
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered': return '#10b981'; // green
      case 'open': return '#3b82f6'; // blue
      case 'full': return '#9ca3af'; // gray
      default: return '#9ca3af';
    }
  };

  if (!apiKey) {
    return (
      <div className="card p-8 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Google Maps API Key Required</h3>
        <p className="text-slate-600 mb-4">
          To view events on the map, you need to add a Google Maps API key to your environment variables.
        </p>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-left">
          <p className="text-sm text-slate-700 mb-2 font-medium">Add to your <code className="bg-slate-200 px-2 py-1 rounded">.env</code> file:</p>
          <code className="text-sm text-slate-800 block bg-white px-3 py-2 rounded border border-slate-200">
            VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
          </code>
        </div>
      </div>
    );
  }

  if (eventsWithCoordinates.length === 0) {
    return (
      <div className="card p-8 text-center">
        <div className="mb-4">
          <svg className="w-16 h-16 mx-auto text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No Events with Locations</h3>
        <p className="text-slate-600">
          There are currently no events with geographic coordinates to display on the map.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg border border-slate-200">
        <Map
          defaultCenter={center}
          defaultZoom={11}
          mapId="jacs-shiftpilot-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
        >
          {eventsWithCoordinates.map((event) => (
            <AdvancedMarker
              key={event.id}
              position={{ lat: event.latitude!, lng: event.longitude! }}
              onClick={() => setSelectedEvent(event)}
            >
              <div
                style={{ backgroundColor: getStatusColor(event.status) }}
                className="w-8 h-8 rounded-full border-4 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
              />
            </AdvancedMarker>
          ))}

          {selectedEvent && selectedEvent.latitude && selectedEvent.longitude && (
            <InfoWindow
              position={{ lat: selectedEvent.latitude, lng: selectedEvent.longitude }}
              onClose={() => setSelectedEvent(null)}
            >
              <div className="p-3 max-w-xs">
                <h3 className="font-semibold text-slate-900 mb-2 text-lg">{selectedEvent.title}</h3>

                <div className="space-y-1 mb-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{selectedEvent.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{selectedEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{selectedEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <span>{selectedEvent.volunteers}/{selectedEvent.maxVolunteers} volunteers</span>
                  </div>
                </div>

                {selectedEvent.status !== 'registered' && onJoinEvent && (
                  <button
                    onClick={() => {
                      onJoinEvent(selectedEvent.id);
                      setSelectedEvent(null);
                    }}
                    disabled={joiningEvent === selectedEvent.id}
                    className="w-full bg-gradient-to-r from-indigo-700 to-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-indigo-600 hover:to-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {joiningEvent === selectedEvent.id ? "Joining..." : "Join Event"}
                  </button>
                )}

                {selectedEvent.status === 'registered' && (
                  <div className="w-full bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium text-center">
                    ✓ Registered
                  </div>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>

      {/* Legend */}
      <div className="mt-4 card p-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-3">Map Legend</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow"></div>
            <span className="text-sm text-slate-600">Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow"></div>
            <span className="text-sm text-slate-600">Registered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-400 border-2 border-white shadow"></div>
            <span className="text-sm text-slate-600">Full</span>
          </div>
        </div>
      </div>
    </APIProvider>
  );
}
