// Service layer for MentorBuddy API with RTK Query integration
// This provides a centralized way to handle API calls and updates Redux store
import { store } from '../index';
import { 
  useGetMentorsQuery,
  useCreateMentorMutation,
  useUpdateMentorMutation,
  useDeleteMentorMutation,
} from '@/api/mentorsApi';
import {
  useGetBuddiesQuery,
  useCreateBuddyMutation,
  useUpdateBuddyMutation,
  useDeleteBuddyMutation,
} from '@/api/buddiesApi';
import {
  useGetResourcesQuery,
  useCreateResourceMutation,
  useUpdateResourceMutation,
  useDeleteResourceMutation,
} from '@/api/resourcesApi';
import type {
  MentorDTO,
  BuddyDTO,
  ResourceDTO,
} from '@/api/dto';

export class MentorBuddyService {
  private store = store;

  // ===================
  // MENTORS
  // ===================
  
  async fetchMentors() {
    // RTK Query will handle this automatically through hooks
    // This method is for imperative calls if needed
    return this.store.dispatch(
      store.getState().mentorBuddyApi.endpoints.getMentors.initiate({})
    );
  }

  async createMentor(mentorData: MentorDTO) {
    return this.store.dispatch(
      store.getState().mentorBuddyApi.endpoints.createMentor.initiate(mentorData)
    );
  }

  async updateMentorById(id: string, mentorData: Partial<MentorDTO>) {
    return this.store.dispatch(
      store.getState().mentorBuddyApi.endpoints.updateMentor.initiate({ id, ...mentorData })
    );
  }

  async deleteMentorById(id: string) {
    return this.store.dispatch(
      store.getState().mentorBuddyApi.endpoints.deleteMentor.initiate(id)
    );
  }

  // ===================
  // BUDDIES
  // ===================
  
  async fetchBuddies() {
    return this.store.dispatch(
      store.getState().mentorBuddyApi.endpoints.getBuddies.initiate({})
    );
  }

  async createBuddy(buddyData: BuddyDTO) {
    return this.store.dispatch(
      store.getState().mentorBuddyApi.endpoints.createBuddy.initiate(buddyData)
    );
  }

  async updateBuddyById(id: string, buddyData: Partial<BuddyDTO>) {
    return this.store.dispatch(
      store.getState().mentorBuddyApi.endpoints.updateBuddy.initiate({ id, ...buddyData })
    );
  }

  async deleteBuddyById(id: string) {
    return this.store.dispatch(
      store.getState().mentorBuddyApi.endpoints.deleteBuddy.initiate(id)
    );
  }

  // ===================
  // RESOURCES
  // ===================
  
  async fetchResources() {
    return this.store.dispatch(
      store.getState().mentorBuddyApi.endpoints.getResources.initiate({})
    );
  }

  async createResource(resourceData: ResourceDTO) {
    return this.store.dispatch(
      store.getState().mentorBuddyApi.endpoints.createResource.initiate(resourceData)
    );
  }

  async updateResourceById(id: string, resourceData: Partial<ResourceDTO>) {
    return this.store.dispatch(
      store.getState().mentorBuddyApi.endpoints.updateResource.initiate({ id, ...resourceData })
    );
  }

  async deleteResourceById(id: string) {
    return this.store.dispatch(
      store.getState().mentorBuddyApi.endpoints.deleteResource.initiate(id)
    );
  }

  // ===================
  // UTILITY METHODS
  // ===================
  
  // Invalidate specific tags to refetch data
  invalidateTags(tags: string[]) {
    tags.forEach(tag => {
      this.store.dispatch(
        store.getState().mentorBuddyApi.util.invalidateTags([tag])
      );
    });
  }

  // Reset API state
  resetApiState() {
    this.store.dispatch(
      store.getState().mentorBuddyApi.util.resetApiState()
    );
  }

  // Get cached data
  getCachedData<T>(endpoint: string, args?: unknown): T | undefined {
    const state = this.store.getState();
    return state.mentorBuddyApi.queries[`${endpoint}(${JSON.stringify(args || {})})`]?.data;
  }
}

// Export singleton instance
export const mentorBuddyService = new MentorBuddyService();

// Export hooks for components to use directly (preferred approach)
export const useMentorBuddyService = () => ({
  // Mentor hooks
  mentors: {
    useGetMentorsQuery,
    useCreateMentorMutation,
    useUpdateMentorMutation,
    useDeleteMentorMutation,
  },
  // Buddy hooks
  buddies: {
    useGetBuddiesQuery,
    useCreateBuddyMutation,
    useUpdateBuddyMutation,
    useDeleteBuddyMutation,
  },
  // Resource hooks
  resources: {
    useGetResourcesQuery,
    useCreateResourceMutation,
    useUpdateResourceMutation,
    useDeleteResourceMutation,
  },
});