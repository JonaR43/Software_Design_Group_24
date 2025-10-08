# Google Maps Integration Setup Guide

## Overview

The JACS ShiftPilot Events page now includes an interactive Google Maps view that displays volunteer events with their geographic locations. Users can toggle between a traditional list view and an interactive map view.

---

## Features

✅ **Interactive Map View** - See all events plotted on Google Maps
✅ **Event Markers** - Color-coded markers based on event status
✅ **Info Windows** - Click markers to see event details
✅ **Direct Registration** - Join events directly from the map
✅ **View Toggle** - Switch between List and Map views
✅ **Automatic Centering** - Map automatically centers on all events

---

## Map Marker Colors

- 🔵 **Blue** - Open events (available to join)
- 🟢 **Green** - Registered events (you're signed up)
- ⚫ **Gray** - Full events (no spots remaining)

---

## Setup Instructions

### Step 1: Get a Google Maps API Key

1. **Go to Google Cloud Console**
   Visit: https://console.cloud.google.com/

2. **Create or Select a Project**
   - Click "Select a project" → "New Project"
   - Name it "JACS ShiftPilot" (or use existing project)
   - Click "Create"

3. **Enable Required APIs**
   - Go to **APIs & Services** → **Library**
   - Search for and enable:
     - ✅ **Maps JavaScript API**
     - ✅ **Maps Embed API** (optional, for enhanced features)

4. **Create API Credentials**
   - Go to **APIs & Services** → **Credentials**
   - Click **"+ Create Credentials"** → **API Key**
   - Copy the API key (something like: `AIzaSyB...`)

5. **Restrict API Key (Recommended for Production)**
   - Click on the API key you just created
   - Under "Application restrictions":
     - Select **"HTTP referrers (web sites)"**
     - Add: `http://localhost:5173/*` (for development)
     - Add: `https://yourdomain.com/*` (for production)
   - Under "API restrictions":
     - Select **"Restrict key"**
     - Choose: **Maps JavaScript API**
   - Click **"Save"**

### Step 2: Add API Key to Your Project

1. **Open the frontend `.env` file**
   ```bash
   /mnt/d/coding/Group_24/admin/frontend/.env
   ```

2. **Replace the placeholder with your actual API key**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyB_your_actual_api_key_here
   ```

3. **Restart your frontend dev server**
   ```bash
   cd /mnt/d/coding/Group_24/admin/frontend
   npm run dev
   ```

---

## Usage

### Viewing the Map

1. Navigate to the **Events** page in your dashboard
2. Click the **"Map"** button in the top-right corner
3. The map will display all events with geographic coordinates

### Interacting with Events on the Map

- **Click a marker** to see event details
- **View event info** including date, time, location, and volunteers
- **Join an event** directly from the info window
- **Close info window** by clicking the ✕ button

### Switching Back to List View

Click the **"List"** button to return to the traditional card-based event list.

---

## Technical Details

### Files Modified

1. **`/app/services/api.ts`**
   - Updated `FrontendEvent` interface to include `latitude` and `longitude`
   - Modified `transformEvent()` to include coordinates from backend

2. **`/app/components/EventsMap.tsx`** (New)
   - Main map component using `@vis.gl/react-google-maps`
   - Displays events as interactive markers
   - Info windows with event details and registration

3. **`/app/routes/client/dashboard/events.tsx`**
   - Added view mode toggle (List/Map)
   - Conditional rendering for list vs map view
   - Passes events data to map component

4. **`/.env`** (New)
   - Environment variable for Google Maps API key

### Libraries Used

- **@vis.gl/react-google-maps** (v1.x)
  - Modern React wrapper for Google Maps
  - Provides `<Map>`, `<AdvancedMarker>`, and `<InfoWindow>` components
  - Better TypeScript support than alternatives

### Data Flow

```
Backend Event Data (latitude, longitude)
    ↓
transformEvent() in api.ts
    ↓
FrontendEvent with coordinates
    ↓
EventsMap component
    ↓
Google Maps with markers
```

---

## Map Component Props

### EventsMap

```tsx
interface EventsMapProps {
  events: FrontendEvent[];       // Array of events to display
  onJoinEvent?: (eventId: string) => void;  // Callback when joining event
  joiningEvent?: string | null;  // Currently joining event ID
}
```

---

## Error Handling

### No API Key

If no API key is configured, the map shows a helpful message:
- Instructions to add `VITE_GOOGLE_MAPS_API_KEY` to `.env`
- Link to Google Cloud Console

### No Events with Coordinates

If events don't have latitude/longitude data:
- Map shows a "No Events with Locations" message
- Suggests checking event data in backend

### API Key Errors

Common issues and solutions:

**Error: "This page can't load Google Maps correctly"**
- ✅ Check API key is correct in `.env`
- ✅ Ensure Maps JavaScript API is enabled
- ✅ Verify billing is set up (required even for free tier)
- ✅ Check browser console for specific error

**Error: "RefererNotAllowedMapError"**
- ✅ Add `http://localhost:5173/*` to API key restrictions
- ✅ For production, add your domain

---

## Customization

### Change Default Map Center

Edit `/app/components/EventsMap.tsx`:

```tsx
const center = eventsWithCoordinates.length > 0
  ? { /* auto-calculated center */ }
  : { lat: YOUR_LAT, lng: YOUR_LNG }; // Your default location
```

### Change Default Zoom Level

```tsx
<Map
  defaultZoom={11}  // Change this number (1-20)
  // Lower = more zoomed out, Higher = more zoomed in
>
```

### Customize Marker Colors

Edit the `getStatusColor()` function:

```tsx
const getStatusColor = (status: string) => {
  switch (status) {
    case 'registered': return '#10b981'; // Change to your color
    case 'open': return '#3b82f6';
    case 'full': return '#9ca3af';
    default: return '#9ca3af';
  }
};
```

### Add Custom Map Styles

```tsx
<Map
  mapId="jacs-shiftpilot-map"
  styles={[
    // Add custom Google Maps styles here
    // https://developers.google.com/maps/documentation/javascript/styling
  ]}
>
```

---

## Cost Information

### Free Tier

Google Maps provides a generous free tier:
- **$200 free credit per month**
- This covers approximately **28,000 map loads per month**
- More than enough for most volunteer management systems

### Pricing After Free Tier

- **Maps JavaScript API**: $7 per 1,000 loads
- **Your $200 credit covers ~28,500 loads/month**
- Only charged if you exceed the free tier

### How to Monitor Usage

1. Go to Google Cloud Console
2. Navigate to **Billing** → **Reports**
3. View your Maps API usage and costs

---

## Production Checklist

Before deploying to production:

- [ ] Get a Google Maps API key
- [ ] Enable Maps JavaScript API
- [ ] Set up billing in Google Cloud (required even for free tier)
- [ ] Restrict API key to your production domain
- [ ] Add production domain to HTTP referrers
- [ ] Update `.env` or environment variables with API key
- [ ] Test map functionality on production domain
- [ ] Monitor API usage in Google Cloud Console
- [ ] Ensure all events have valid latitude/longitude data

---

## Troubleshooting

### Map Not Showing

**Check 1: Is API key configured?**
```bash
# In frontend directory
cat .env | grep VITE_GOOGLE_MAPS_API_KEY
```

**Check 2: Is frontend server restarted?**
```bash
# Stop and restart
npm run dev
```

**Check 3: Browser console errors?**
- Open Developer Tools (F12)
- Check Console tab for Google Maps errors

### Events Not Appearing on Map

**Check 1: Do events have coordinates?**
- Events need `latitude` and `longitude` fields
- Check backend event data in database

**Check 2: Are coordinates valid?**
- Latitude: -90 to 90
- Longitude: -180 to 180

### Map Loads But Shows Error

**Check 1: API key restrictions**
- Ensure your domain is allowed
- Check HTTP referrer restrictions

**Check 2: Billing enabled**
- Google Maps requires billing even for free tier
- Check Google Cloud Console billing section

---

## Future Enhancements

Potential features to add:

- 🗺️ **Clustering** - Group nearby markers for better performance
- 📍 **User Location** - Show user's current location on map
- 🔍 **Search Box** - Search for locations directly on map
- 🛣️ **Directions** - Get directions to event locations
- 📱 **Mobile Optimization** - Enhanced mobile map controls
- 🎨 **Custom Markers** - Use custom icons for different event types
- 🌐 **Heatmap** - Show event density across regions

---

## Support Links

- **Google Maps Documentation**: https://developers.google.com/maps/documentation
- **@vis.gl/react-google-maps**: https://visgl.github.io/react-google-maps/
- **Google Cloud Console**: https://console.cloud.google.com/
- **Maps JavaScript API**: https://developers.google.com/maps/documentation/javascript

---

## Summary

✅ **Map view added** to Events page
✅ **Toggle between List and Map** views
✅ **Interactive markers** with event details
✅ **Direct event registration** from map
✅ **Color-coded** by event status
✅ **Auto-centering** on all events
✅ **Responsive design** for all screen sizes

**Next Steps:**
1. Get your Google Maps API key
2. Add it to `.env` file
3. Restart frontend server
4. Enjoy the map view! 🎉
