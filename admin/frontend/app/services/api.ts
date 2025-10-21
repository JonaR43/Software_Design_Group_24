/**
 * API Service Layer for JACS ShiftPilot Frontend
 * Handles all backend communication and data transformation
 */

const API_BASE_URL = 'http://localhost:3001/api';

// Auth token management
class TokenManager {
  static getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  static setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  static removeToken(): void {
    localStorage.removeItem('authToken');
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// HTTP client with auth headers
class HttpClient {
  private static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = TokenManager.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  static async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Try to get the error details from the response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        if (errorData.errors) {
          console.error('Validation errors:', errorData.errors);
        }
        if (errorData.message) {
          errorMessage = errorData.message;
          if (errorData.errors && errorData.errors.length > 0) {
            errorMessage += ': ' + errorData.errors.map((err: any) => err.message || err).join(', ');
          }
        }
      } catch (e) {
        // If we can't parse the error response, use the status
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  static async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      // Try to get the error details from the response
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        console.error('Backend error response:', errorData);
        if (errorData.errors) {
          console.error('Validation errors:', errorData.errors);
        }
        if (errorData.message) {
          errorMessage = errorData.message;
          if (errorData.errors && errorData.errors.length > 0) {
            errorMessage += ': ' + errorData.errors.map((err: any) => err.message || err).join(', ');
          }
        }
      } catch (e) {
        // If we can't parse the error response, use the status
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  static async download(endpoint: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.blob();
  }
}

// Type definitions matching backend responses
export interface BackendEvent {
  id: string;
  title: string;
  description: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  startDate: string;
  endDate: string;
  maxVolunteers: number;
  currentVolunteers: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'published' | 'in-progress' | 'completed' | 'cancelled';
  category: string | {
    id: string;
    name: string;
    description: string;
  };
  requiredSkills: Array<{
    skillId: string;
    minLevel: string;
    required: boolean;
    skillName: string;
    skillCategory: string;
    skillDescription: string;
  }>;
  spotsRemaining: number;
  fillPercentage: number;
  timeStatus: string;
}

export interface FrontendEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  latitude?: number;
  longitude?: number;
  volunteers: number;
  maxVolunteers: number;
  status: 'open' | 'registered' | 'full';
  description?: string;
  spotsRemaining?: number;
  urgencyLevel?: string;
}

export interface BackendProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bio: string;
  skills: Array<{
    skillId: string;
    proficiency: string;
  }>;
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
  }>;
  preferences: {
    causes: string[];
    maxDistance: number;
    weekdaysOnly: boolean;
    preferredTimeSlots: string[];
  };
  emergencyContact: string;
}

export interface FrontendProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  bio: string;
  skills: string[];
  emergencyContact: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'volunteer';
  verified: boolean;
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    user: User;
    token: string;
    profile: BackendProfile;
  };
}

export interface DashboardStats {
  overview: {
    totalVolunteers: number;
    totalEvents: number;
    totalHours: number;
    averageReliability: number;
  };
  recentActivity: {
    last30Days: number;
    completedLast30Days: number;
    hoursLast30Days: number;
    activities: Array<{
      eventTitle: string;
      eventDate: string;
      status: string;
      hoursWorked?: number;
    }>;
  };
  topPerformers: Array<{
    volunteerId: string;
    name: string;
    reliabilityScore: number;
    totalHours: number;
    completedEvents: number;
  }>;
}

// Data transformation utilities
export class DataTransformer {
  static formatTimeRange(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return `${start.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })} - ${end.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })}`;
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  static mapEventStatus(backendStatus: string): 'open' | 'registered' | 'full' {
    switch (backendStatus) {
      case 'published':
        return 'open';
      case 'in-progress':
        return 'registered';
      case 'completed':
      case 'cancelled':
        return 'full';
      default:
        return 'open';
    }
  }

  static transformEvent(backendEvent: BackendEvent): FrontendEvent {
    // Build location string from address components if location not provided
    let location = backendEvent.location;
    if (!location && backendEvent.address) {
      location = `${backendEvent.address}, ${backendEvent.city || ''}, ${backendEvent.state || ''} ${backendEvent.zipCode || ''}`.trim();
    }

    return {
      id: backendEvent.id,
      title: backendEvent.title,
      date: DataTransformer.formatDate(backendEvent.startDate),
      time: DataTransformer.formatTimeRange(backendEvent.startDate, backendEvent.endDate),
      location: location || 'Location TBD',
      latitude: backendEvent.latitude,
      longitude: backendEvent.longitude,
      volunteers: backendEvent.currentVolunteers,
      maxVolunteers: backendEvent.maxVolunteers,
      status: backendEvent.spotsRemaining === 0 ? 'full' : DataTransformer.mapEventStatus(backendEvent.status),
      description: backendEvent.description,
      spotsRemaining: backendEvent.spotsRemaining,
      urgencyLevel: backendEvent.urgencyLevel
    };
  }

  static async transformProfile(backendProfile: BackendProfile): Promise<FrontendProfile> {
    // Get skill names instead of IDs
    const skills = await SkillsService.getSkills();
    const skillMap = new Map(skills.map(skill => [skill.id, skill.name]));
    const skillNames = backendProfile.skills?.map(skill =>
      skillMap.get(skill.skillId) || skill.skillId
    ) || [];

    return {
      firstName: backendProfile.firstName,
      lastName: backendProfile.lastName,
      email: '', // Will be set from user data
      phone: backendProfile.phone,
      address: backendProfile.address,
      city: backendProfile.city,
      state: backendProfile.state,
      zipCode: backendProfile.zipCode,
      bio: backendProfile.bio,
      skills: skillNames,
      emergencyContact: backendProfile.emergencyContact
    };
  }
}

// API Service classes
export class AuthService {
  static async register(username: string, email: string, password: string, role: string): Promise<AuthResponse> {
    try {
      const response = await HttpClient.post<AuthResponse>('/auth/register', {
        username,
        email,
        password,
        role: role.toLowerCase()
      });

      if (response.status === 'success') {
        TokenManager.setToken(response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('profile', JSON.stringify(response.data.profile));
      }

      return response;
    } catch (error) {
      throw new Error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await HttpClient.post<AuthResponse>('/auth/login', {
        email,
        password
      });

      if (response.status === 'success') {
        TokenManager.setToken(response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('profile', JSON.stringify(response.data.profile));
      }

      return response;
    } catch (error) {
      throw new Error(`Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async logout(): Promise<void> {
    TokenManager.removeToken();
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
  }

  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static getCurrentProfile(): BackendProfile | null {
    const profileStr = localStorage.getItem('profile');
    return profileStr ? JSON.parse(profileStr) : null;
  }

  static isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  }
}

export interface EventFilters {
  status?: string;
  category?: string;
  urgencyLevel?: string;
  startDate?: string;
  endDate?: string;
  needsVolunteers?: boolean;
  search?: string;
}

export interface EventPagination {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class EventService {
  static async getEvents(filters?: EventFilters, pagination?: EventPagination): Promise<FrontendEvent[]> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();

      // Add filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      // Add pagination
      if (pagination) {
        Object.entries(pagination).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/events?${queryString}` : '/events';

      const response = await HttpClient.get<{
        status: string;
        data: {
          events: BackendEvent[];
        };
      }>(endpoint);

      if (response.status === 'success') {
        const events = response.data.events.map(DataTransformer.transformEvent);

        // Check user's registration status for each event
        try {
          // Fetch both history records (completed events) and active assignments (upcoming events)
          const [userHistory, myEventsResponse] = await Promise.all([
            HistoryService.getMyHistory(),
            fetch('http://localhost:3001/api/events/my-events', {
              headers: {
                'Authorization': `Bearer ${TokenManager.getToken()}`,
                'Content-Type': 'application/json'
              }
            }).catch(() => null)
          ]);

          console.log('Full user history:', userHistory); // Debug log

          // Get event IDs from history
          const registeredEventIds = new Set(userHistory.map(record => record.eventId));

          // Get event IDs from active assignments
          if (myEventsResponse && myEventsResponse.ok) {
            const myEventsData = await myEventsResponse.json();
            console.log('My events data:', myEventsData); // Debug log

            if (myEventsData.data?.events) {
              myEventsData.data.events.forEach((event: any) => {
                registeredEventIds.add(event.id);
              });
            }
          }

          console.log('User registered event IDs (history + assignments):', Array.from(registeredEventIds)); // Debug log
          console.log('Available events:', events.map(e => ({ id: e.id, title: e.title, status: e.status }))); // Debug log

          const updatedEvents = events.map(event => {
            const isRegistered = registeredEventIds.has(event.id);
            console.log(`Event ${event.id} (${event.title}): registered=${isRegistered}`); // Debug log
            return {
              ...event,
              status: isRegistered ? 'registered' as const : event.status
            };
          });

          console.log('Final events with status:', updatedEvents.map(e => ({ id: e.id, title: e.title, status: e.status }))); // Debug log
          return updatedEvents;
        } catch (historyError) {
          console.warn('Could not fetch user registration status:', historyError);
          return events;
        }
      }

      throw new Error('Failed to fetch events');
    } catch (error) {
      throw new Error(`Failed to fetch events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async createEvent(eventData: {
    title: string;
    description: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    startDate: string;
    endDate: string;
    maxVolunteers: number;
    urgencyLevel: string;
    requiredSkills: Array<{ skillId: string; minLevel: string; required: boolean }>;
    category: string;
  }): Promise<any> {
    try {
      const response = await HttpClient.post('/events', eventData);
      console.log('Create event response:', response);
      return response;
    } catch (error) {
      throw new Error(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async joinEvent(eventId: string): Promise<void> {
    try {
      console.log('Joining event:', eventId); // Debug log
      const response = await HttpClient.post(`/events/${eventId}/join`, {});
      console.log('Join event response:', response); // Debug log
    } catch (error) {
      console.error('Join event error:', error); // Debug log

      // Handle specific error cases
      if (error instanceof Error && error.message.includes('already assigned')) {
        throw new Error('You are already registered for this event');
      }

      throw new Error(`Failed to join event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateEvent(eventId: string, eventData: Partial<FrontendEvent>): Promise<void> {
    try {
      const response = await HttpClient.put(`/events/${eventId}`, {
        title: eventData.title,
        description: eventData.description,
        location: eventData.location,
        status: eventData.status,
        // Add other fields as needed
      });
      console.log('Update event response:', response);
    } catch (error) {
      throw new Error(`Failed to update event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteEvent(eventId: string): Promise<void> {
    try {
      const response = await HttpClient.delete(`/events/${eventId}`);
      console.log('Delete event response:', response);
    } catch (error) {
      throw new Error(`Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateEventStatus(eventId: string, status: string): Promise<void> {
    try {
      const response = await HttpClient.put(`/events/${eventId}`, { status });
      console.log('Update event status response:', response);
    } catch (error) {
      throw new Error(`Failed to update event status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export class ProfileService {
  static async getProfile(): Promise<FrontendProfile> {
    try {
      console.log('Calling profile API at /profile'); // Debug log
      const response = await HttpClient.get<{
        status?: string;
        success?: boolean;
        data: {
          profile?: BackendProfile;
        } | BackendProfile;
      }>('/profile');

      console.log('Profile API full response:', response); // Debug log

      // Handle both response formats
      const isSuccess = response.status === 'success' || response.success === true;
      if (isSuccess && response.data) {
        // Check if data is wrapped in profile object or direct
        const profileData = ('profile' in response.data) ? response.data.profile : response.data as BackendProfile;

        if (!profileData) {
          throw new Error('Profile not found');
        }

        console.log('Profile data being transformed:', profileData); // Debug log
        const transformedProfile = await DataTransformer.transformProfile(profileData);
        const user = AuthService.getCurrentUser();
        if (user) {
          transformedProfile.email = user.email;
        }
        console.log('Transformed profile:', transformedProfile); // Debug log
        return transformedProfile;
      }

      throw new Error('Profile not found');
    } catch (error) {
      console.error('Profile fetch error:', error); // Debug log
      throw new Error(`Failed to fetch profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateProfile(profileData: Partial<FrontendProfile> & {
    availability?: Array<{dayOfWeek: string; startTime: string; endTime: string}>
  }): Promise<void> {
    try {
      console.log('Updating profile with data:', profileData); // Debug log

      // First, get the current profile to preserve existing skills and availability
      const currentProfile = await this.getCurrentBackendProfile();

      // Transform frontend data back to backend format - include existing required fields
      const backendData: any = {
        // Preserve existing required fields
        skills: currentProfile.skills || [],
        availability: currentProfile.availability || [],
      };

      // Update only the fields being changed
      if (profileData.firstName !== undefined) backendData.firstName = profileData.firstName;
      if (profileData.lastName !== undefined) backendData.lastName = profileData.lastName;
      if (profileData.phone !== undefined) backendData.phone = profileData.phone;
      if (profileData.bio !== undefined) backendData.bio = profileData.bio;
      // Note: emergencyContact is not in the database schema yet, so we skip it
      // if (profileData.emergencyContact !== undefined) backendData.emergencyContact = profileData.emergencyContact;
      if (profileData.address !== undefined) backendData.address = profileData.address;
      if (profileData.city !== undefined) backendData.city = profileData.city;
      if (profileData.state !== undefined) backendData.state = profileData.state;
      if (profileData.zipCode !== undefined) backendData.zipCode = profileData.zipCode;

      // Update availability if provided
      if (profileData.availability !== undefined) {
        // Keep day names as strings (database schema expects strings)
        backendData.availability = profileData.availability.map(slot => ({
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime
        }));
      }

      // Convert skill names to skill IDs if skills are being updated
      if (profileData.skills !== undefined) {
        let allSkills = await SkillsService.getSkills();
        let skillNameToId = new Map(allSkills.map(skill => [skill.name, skill.id]));

        // Create custom skills that don't exist in the database
        const newSkills: string[] = [];
        for (const skillName of profileData.skills) {
          if (!skillNameToId.has(skillName)) {
            newSkills.push(skillName);
          }
        }

        // Create new skills in the database
        if (newSkills.length > 0) {
          console.log('Creating new custom skills:', newSkills);
          for (const skillName of newSkills) {
            try {
              const newSkillResponse = await HttpClient.post<{
                status: string;
                data: { skill: { id: string; name: string } };
              }>('/profile/create-skill', {
                name: skillName,
                category: 'custom',
                description: `Custom skill: ${skillName}`
              });

              if (newSkillResponse.status === 'success' && newSkillResponse.data.skill) {
                // Add the newly created skill to our mapping
                skillNameToId.set(skillName, newSkillResponse.data.skill.id);
                console.log(`Created custom skill: ${skillName} with ID: ${newSkillResponse.data.skill.id}`);
              }
            } catch (error) {
              console.error(`Failed to create custom skill "${skillName}":`, error);
            }
          }

          // Refresh skills cache
          SkillsService.clearCache();
        }

        backendData.skills = profileData.skills.map(skillName => {
          const skillId = skillNameToId.get(skillName);
          if (!skillId) {
            console.warn(`Skill name "${skillName}" not found in database, skipping`);
            return null;
          }
          return {
            skillId: skillId,
            proficiency: 'intermediate' // Default proficiency level
          };
        }).filter(skill => skill !== null); // Remove null entries
      }

      console.log('Sending backend data:', backendData); // Debug log
      const response = await HttpClient.put('/profile', backendData);
      console.log('Update response:', response); // Debug log
    } catch (error) {
      console.error('Profile update error:', error); // Debug log
      throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCurrentBackendProfile(): Promise<any> {
    try {
      const response = await HttpClient.get<{
        status?: string;
        success?: boolean;
        data: {
          profile?: any;
        } | any;
      }>('/profile');

      const isSuccess = response.status === 'success' || response.success === true;
      if (isSuccess && response.data) {
        // Check if data is wrapped in profile object or direct
        const profileData = ('profile' in response.data) ? response.data.profile : response.data;
        return profileData || { skills: [], availability: [] };
      }

      // Return empty defaults if profile not found
      return { skills: [], availability: [] };
    } catch (error) {
      console.warn('Could not fetch current profile, using defaults:', error);
      return { skills: [], availability: [] };
    }
  }
}

export interface VolunteerHistoryRecord {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDescription: string;
  location: string;
  eventDate: string;
  participationStatus: 'COMPLETED' | 'NO_SHOW' | 'CANCELLED' | 'UPCOMING';
  hoursWorked?: number;
  feedback?: string;
  urgencyLevel: string;
  requiredSkills: string[];
}

function mapBackendStatusToFrontend(backendStatus: string): 'COMPLETED' | 'NO_SHOW' | 'CANCELLED' | 'UPCOMING' {
  switch (backendStatus) {
    case 'completed':
      return 'COMPLETED';
    case 'no_show':
      return 'NO_SHOW';
    case 'cancelled':
      return 'CANCELLED';
    case 'in_progress':
    case 'assigned':
    case 'confirmed':
      return 'UPCOMING';
    default:
      return 'UPCOMING';
  }
}

export class SkillsService {
  private static skillsCache: Array<{id: string, name: string}> | null = null;

  static async getSkills(): Promise<Array<{id: string, name: string}>> {
    if (this.skillsCache) {
      return this.skillsCache;
    }

    try {
      console.log('Calling skills API at /profile/skills'); // Debug log
      const response = await HttpClient.get<{
        data: {
          skills: Array<{id: string, name: string, category: string, description: string}>;
        };
        status: string;
      }>('/profile/skills');

      console.log('Skills API full response:', response); // Debug log
      if (response.status === 'success' && response.data?.skills) {
        console.log('Skills API response:', response.data.skills.slice(0, 5)); // Debug log
        this.skillsCache = response.data.skills.map(skill => ({
          id: skill.id,
          name: skill.name
        }));
        console.log('Skills cache created:', this.skillsCache.slice(0, 5)); // Debug log
        return this.skillsCache;
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      return [];
    }
  }

  static async getSkillName(skillId: string): Promise<string> {
    const skills = await this.getSkills();
    const skill = skills.find(s => s.id === skillId);
    return skill ? skill.name : skillId;
  }

  static clearCache(): void {
    this.skillsCache = null;
  }
}

export class ScheduleService {
  static async getMySchedule(): Promise<VolunteerHistoryRecord[]> {
    try {
      // Get all history and filter for upcoming events
      const allHistory = await HistoryService.getMyHistory();

      // Filter for upcoming events (confirmed, in_progress, or upcoming status)
      const upcomingEvents = allHistory.filter(record => {
        const eventDate = new Date(record.eventDate);
        const now = new Date();

        // Include events that are in the future or currently happening
        return (eventDate >= now || record.participationStatus === 'UPCOMING') &&
               record.participationStatus !== 'COMPLETED' &&
               record.participationStatus !== 'CANCELLED' &&
               record.participationStatus !== 'NO_SHOW';
      });

      return upcomingEvents;
    } catch (error) {
      throw new Error(`Failed to fetch schedule: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export class HistoryService {
  static async getMyHistory(): Promise<VolunteerHistoryRecord[]> {
    try {
      const response = await HttpClient.get<{
        success: boolean;
        message: string;
        history: any[];
        pagination?: any;
      }>('/history/my-history');

      if (response.success && response.history) {
        // Fetch skills mapping first
        const skills = await SkillsService.getSkills();
        const skillMap = new Map(skills.map(skill => [skill.id, skill.name]));
        console.log('Skill map created:', Array.from(skillMap.entries()).slice(0, 5)); // Debug log

        return response.history.map(record => ({
          id: record.id,
          eventId: record.eventId,
          eventTitle: record.event ? record.event.title : 'Unknown Event',
          eventDescription: record.event ? record.event.description : 'No description available',
          location: record.event ? record.event.location : 'Unknown Location',
          eventDate: record.participationDate,
          participationStatus: mapBackendStatusToFrontend(record.status),
          hoursWorked: record.hoursWorked,
          feedback: record.feedback,
          urgencyLevel: record.event ? record.event.urgencyLevel : 'NORMAL',
          requiredSkills: record.event
            ? (record.event.requiredSkills || []).map((skill: any) => {
                if (typeof skill === 'string') return skill;
                const skillId = skill.skillId || skill.id;
                const skillName = skillMap.get(skillId);
                console.log(`Mapping skill ${skillId} to ${skillName}`); // Debug log
                return skillName || skillId || 'Unknown Skill';
              })
            : []
        }));
      }

      throw new Error('Failed to fetch volunteer history');
    } catch (error) {
      throw new Error(`Failed to fetch volunteer history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export class DashboardService {
  static async getDashboardStats(): Promise<DashboardStats> {
    try {
      const user = AuthService.getCurrentUser();

      if (user?.role === 'admin') {
        const response = await HttpClient.get<{
          success: boolean;
          data: DashboardStats;
        }>('/history/admin/dashboard');

        if (response.success) {
          return response.data;
        }
      } else {
        // For volunteers, get their personal stats and recent history
        const [statsResponse, historyResponse] = await Promise.all([
          HttpClient.get<{
            success: boolean;
            data: any;
          }>('/history/my-stats'),
          HttpClient.get<{
            success: boolean;
            data: VolunteerHistoryRecord[];
          }>('/history/my-history')
        ]);

        if (statsResponse.success) {
          // Get recent activities (last 3 events)
          let activities: Array<{
            eventTitle: string;
            eventDate: string;
            status: string;
            hoursWorked?: number;
          }> = [];

          if (historyResponse.success && historyResponse.data) {
            activities = historyResponse.data
              .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
              .slice(0, 3)
              .map(record => ({
                eventTitle: record.eventTitle,
                eventDate: record.eventDate,
                status: record.participationStatus,
                hoursWorked: record.hoursWorked
              }));
          }

          // Transform volunteer stats to dashboard format
          return {
            overview: {
              totalVolunteers: 1,
              totalEvents: statsResponse.data.totalEvents || 0,
              totalHours: statsResponse.data.totalHours || 0,
              averageReliability: statsResponse.data.reliabilityScore || 0
            },
            recentActivity: {
              last30Days: statsResponse.data.eventsLast30Days || 0,
              completedLast30Days: statsResponse.data.completedLast30Days || 0,
              hoursLast30Days: statsResponse.data.hoursLast30Days || 0,
              activities
            },
            topPerformers: []
          };
        }
      }

      throw new Error('Failed to fetch dashboard stats');
    } catch (error) {
      throw new Error(`Failed to fetch dashboard stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'volunteer';
  verified: boolean;
  createdAt: string;
  lastLogin?: string;
  profile?: {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    state: string;
  };
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'volunteer';
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  role?: 'admin' | 'volunteer';
  verified?: boolean;
  password?: string;
}

export class UserService {
  static async getAllUsers(): Promise<UserData[]> {
    try {
      const response = await HttpClient.get<{
        status: string;
        data: {
          users: UserData[];
        };
      }>('/admin/users');

      if (response.status === 'success') {
        return response.data.users;
      }

      throw new Error('Failed to fetch users');
    } catch (error) {
      throw new Error(`Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getUserById(userId: string): Promise<UserData> {
    try {
      const response = await HttpClient.get<{
        status: string;
        data: UserData;
      }>(`/admin/users/${userId}`);

      if (response.status === 'success') {
        return response.data;
      }

      throw new Error('User not found');
    } catch (error) {
      throw new Error(`Failed to fetch user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async createUser(userData: CreateUserData): Promise<UserData> {
    try {
      const response = await HttpClient.post<{
        status: string;
        data: UserData;
      }>('/admin/users', userData);

      if (response.status === 'success') {
        return response.data;
      }

      throw new Error('Failed to create user');
    } catch (error) {
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateUser(userId: string, userData: UpdateUserData): Promise<UserData> {
    try {
      const response = await HttpClient.put<{
        status: string;
        data: UserData;
      }>(`/admin/users/${userId}`, userData);

      if (response.status === 'success') {
        return response.data;
      }

      throw new Error('Failed to update user');
    } catch (error) {
      throw new Error(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    try {
      const response = await HttpClient.delete<{
        status: string;
        message: string;
      }>(`/admin/users/${userId}`);

      if (response.status !== 'success') {
        throw new Error('Failed to delete user');
      }
    } catch (error) {
      throw new Error(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getVolunteerMetrics(userId: string): Promise<any> {
    try {
      const response = await HttpClient.get<{
        status: string;
        data: any;
      }>(`/admin/users/${userId}/metrics`);

      if (response.status === 'success') {
        return response.data;
      }

      throw new Error('Failed to fetch volunteer metrics');
    } catch (error) {
      throw new Error(`Failed to fetch volunteer metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export interface EventVolunteer {
  id: string;
  volunteerId: string;
  volunteerName: string;
  volunteerEmail: string;
  status: string;
  hoursWorked?: number;
  performanceRating?: number;
  feedback?: string;
  adminNotes?: string;
  participationDate: string;
  completionDate?: string;
}

export interface VolunteerMatch {
  volunteer: {
    id: string;
    username: string;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      city?: string;
      state?: string;
      phone?: string;
      skills?: any[];
      availability?: any[];
      preferences?: any;
    };
  };
  matchScore: number;
  matchQuality: string;
  matchReasons?: string[];
  recommendations?: Array<{ message: string; type: string }>;
  scoreBreakdown: {
    skills: number;
    location: number;
    availability: number;
    reliability: number;
    preferences: number;
  };
}

export class MatchingService {
  static async findVolunteersForEvent(eventId: string, options?: {
    limit?: number;
    minScore?: number;
    includeAssigned?: boolean;
  }): Promise<VolunteerMatch[]> {
    try {
      const queryParams = new URLSearchParams();
      if (options?.limit) queryParams.append('limit', options.limit.toString());
      if (options?.minScore) queryParams.append('minScore', options.minScore.toString());
      if (options?.includeAssigned) queryParams.append('includeAssigned', 'true');

      const queryString = queryParams.toString();
      const endpoint = queryString
        ? `/matching/event/${eventId}/volunteers?${queryString}`
        : `/matching/event/${eventId}/volunteers`;

      const response = await HttpClient.post<{
        status: string;
        data: {
          eventId: string;
          matches: VolunteerMatch[];
          totalMatches: number;
        };
      }>(endpoint, {});

      if (response.status === 'success') {
        return response.data.matches;
      }

      throw new Error('Failed to find volunteer matches');
    } catch (error) {
      throw new Error(`Failed to find volunteer matches: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getAlgorithmInfo(): Promise<any> {
    try {
      const response = await HttpClient.get<{
        status: string;
        data: any;
      }>('/matching/algorithm-info');

      if (response.status === 'success') {
        return response.data;
      }

      throw new Error('Failed to get algorithm info');
    } catch (error) {
      throw new Error(`Failed to get algorithm info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export class EventVolunteerService {
  static async getEventVolunteers(eventId: string): Promise<EventVolunteer[]> {
    try {
      const response = await HttpClient.get<{
        status: string;
        data: {
          assignments: any[];
        };
      }>(`/events/${eventId}/assignments`);

      if (response.status === 'success') {
        return response.data.assignments;
      }

      throw new Error('Failed to fetch event volunteers');
    } catch (error) {
      throw new Error(`Failed to fetch event volunteers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateVolunteerReview(eventId: string, volunteerId: string, reviewData: {
    status?: string;
    hoursWorked?: number;
    performanceRating?: number;
    feedback?: string;
    adminNotes?: string;
  }): Promise<void> {
    try {
      const response = await HttpClient.put<{
        status: string;
        message: string;
      }>(`/events/${eventId}/volunteers/${volunteerId}/review`, reviewData);

      if (response.status !== 'success') {
        throw new Error('Failed to update volunteer review');
      }
    } catch (error) {
      throw new Error(`Failed to update volunteer review: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'assignment' | 'event-assignment' | 'event-update' | 'reminder' | 'cancellation' | 'system' | 'matching-suggestion';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  relatedEventId?: string;
  relatedUserId?: string;
  createdAt: string;
  readAt?: string;
}

export class NotificationService {
  static async getNotifications(filters?: {
    type?: string;
    priority?: string;
    read?: boolean;
    limit?: number;
  }): Promise<Notification[]> {
    try {
      const queryParams = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/notifications?${queryString}` : '/notifications';

      console.log('Fetching notifications from:', endpoint);

      const response = await HttpClient.get<{
        status: string;
        data: {
          notifications: Notification[];
          total: number;
          unreadCount: number;
        };
      }>(endpoint);

      console.log('Notifications API response:', response);

      if (response.status === 'success') {
        console.log('Notifications count:', response.data.notifications.length);
        return response.data.notifications;
      }

      throw new Error('Failed to fetch notifications');
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw new Error(`Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async markAsRead(notificationId: string): Promise<void> {
    try {
      await HttpClient.put(`/notifications/${notificationId}/read`, {});
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async markAllAsRead(): Promise<void> {
    try {
      await HttpClient.put('/notifications/all/read', {});
    } catch (error) {
      throw new Error(`Failed to mark all notifications as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await HttpClient.delete(`/notifications/${notificationId}`);
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export { TokenManager, HttpClient };