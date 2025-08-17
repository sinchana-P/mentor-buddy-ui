const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.PROD 
    ? 'https://mentor-buddy-backend.onrender.com' 
    : 'http://localhost:3000'
);

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async health() {
    return this.request('/api/health');
  }

  // Users
  async getUsers() {
    return this.request('/api/users');
  }

  // Mentors
  async getMentors() {
    return this.request('/api/mentors');
  }

  // Buddies
  async getBuddies() {
    return this.request('/api/buddies');
  }

  // Tasks
  async getTasks(params?: { buddyId?: string }) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`/api/tasks${query}`);
  }

  // Resources
  async getResources() {
    return this.request('/api/resources');
  }

  // Dashboard
  async getDashboardStats() {
    return this.request('/api/dashboard/stats');
  }

  async getDashboardActivity() {
    return this.request('/api/dashboard/activity');
  }
}

export const apiClient = new ApiClient();