// Optimistic update utilities for better UX
import { store } from '../store';
import { apiSlice } from '../api/apiSlice';

// Helper to manually invalidate and refetch data after mutations
export function invalidateAndRefetch(tags: string[]) {
  const dispatch = store.dispatch;
  
  // Invalidate the specified tags
  dispatch(apiSlice.util.invalidateTags(tags));
  
  // Optionally force refetch of currently subscribed queries
  tags.forEach(tag => {
    dispatch(apiSlice.util.invalidateTags([tag]));
  });
}

// Helper to optimistically update list data
export function optimisticListUpdate<T extends { id: string }>(
  endpoint: string,
  newItem: T,
  operation: 'add' | 'update' | 'delete'
) {
  const dispatch = store.dispatch;
  
  // Get current cached data
  const currentData = apiSlice.endpoints[endpoint as keyof typeof apiSlice.endpoints]?.select(undefined)(store.getState());
  
  if (currentData?.data) {
    let updatedData: T[];
    
    switch (operation) {
      case 'add':
        updatedData = [...currentData.data, newItem];
        break;
      case 'update':
        updatedData = currentData.data.map((item: T) => 
          item.id === newItem.id ? { ...item, ...newItem } : item
        );
        break;
      case 'delete':
        updatedData = currentData.data.filter((item: T) => item.id !== newItem.id);
        break;
    }
    
    // Update the cache optimistically
    dispatch(
      apiSlice.util.upsertQueryData(endpoint as string, undefined, updatedData)
    );
  }
}

// Helper to show loading states and handle errors
export async function withOptimisticUpdate<T>(
  mutationPromise: Promise<T>,
  optimisticUpdate?: () => void,
  onError?: (error: unknown) => void
): Promise<T> {
  try {
    // Apply optimistic update immediately
    if (optimisticUpdate) {
      optimisticUpdate();
    }
    
    // Wait for the actual mutation
    const result = await mutationPromise;
    
    return result;
  } catch (error) {
    // Revert optimistic update on error
    console.error('Mutation failed, reverting optimistic update:', error);
    
    if (onError) {
      onError(error);
    }
    
    throw error;
  }
}