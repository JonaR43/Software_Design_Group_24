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
}

// Type definitions matching backend responses
export interface BackendEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  maxVolunteers: number;
  currentVolunteers: number;
  urgencyLevel: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'published' | 'in-progress' | 'completed' | 'cancelled';
  category: {
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
    return {
      id: backendEvent.id,
      title: backendEvent.title,
      date: DataTransformer.formatDate(backendEvent.startDate),
      time: DataTransformer.formatTimeRange(backendEvent.startDate, backendEvent.endDate),
      location: backendEvent.location,
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

    const fullAddress = [
      backendProfile.address,
      backendProfile.city,
      backendProfile.state,
      backendProfile.zipCode
    ].filter(Boolean).join(', ');

    return {
      firstName: backendProfile.firstName,
      lastName: backendProfile.lastName,
      email: '', // Will be set from user data
      phone: backendProfile.phone,
      address: fullAddress,
      bio: backendProfile.bio,
      skills: skillNames,
      emergencyContact: backendProfile.emergencyContact
    };
  }
}

// API Service classes
export class AuthService {
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
          const userHistory = await HistoryService.getMyHistory();
          console.log('Full user history:', userHistory); // Debug log - see all records

          const registeredEventIds = new Set(userHistory.map(record => record.eventId));

          console.log('User registered event IDs:', Array.from(registeredEventIds)); // Debug log
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
          console.warn('Could not fetch user history to check registration status:', historyError);
          return events;
        }
      }

      throw new Error('Failed to fetch events');
    } catch (error) {
      throw new Error(`Failed to fetch events: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        status: string;
        data: BackendProfile;
      }>('/profile');

      console.log('Profile API full response:', response); // Debug log
      if (response.status === 'success' && response.data) {
        const transformedProfile = await DataTransformer.transformProfile(response.data);
        const user = AuthService.getCurrentUser();
        if (user) {
          transformedProfile.email = user.email;
        }
        return transformedProfile;
      }

      throw new Error('Profile not found');
    } catch (error) {
      throw new Error(`Failed to fetch profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateProfile(profileData: Partial<FrontendProfile>): Promise<void> {
    try {
      console.log('Updating profile with data:', profileData); // Debug log

      // First, get the current profile to preserve existing skills and availability
      const currentProfile = await this.getCurrentBackendProfile();

      // Parse address back to components if it exists
      const addressParts = profileData.address ? profileData.address.split(', ') : [];

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
      if (profileData.emergencyContact !== undefined) backendData.emergencyContact = profileData.emergencyContact;

      if (profileData.address !== undefined) {
        backendData.address = addressParts[0] || '';
        backendData.city = addressParts[1] || '';
        backendData.state = addressParts[2] || '';
        backendData.zipCode = addressParts[3] || '';
      }

      console.log('Sending backend data:', backendData); // Debug log
      const response = await HttpClient.put('/profile', backendData);
      console.log('Update response:', response); // Debug log
    } catch (error) {
      console.error('Profile update error:', error); // Debug log
      throw new Error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async getCurrentBackendProfile(): Promise<any> {
    try {
      const response = await HttpClient.get<{
        status: string;
        data: any;
      }>('/profile');

      if (response.status === 'success' && response.data) {
        return response.data;
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

export { TokenManager, HttpClient };