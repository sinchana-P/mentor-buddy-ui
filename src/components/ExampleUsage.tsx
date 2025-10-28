// Example component demonstrating your reference pattern usage
// Following your exact pattern: useSelector to read from store + RTK Query for API calls

import { useSelector } from 'react-redux';
import { useGetMentorsQuery, useCreateMentorMutation } from '@/api';
import type { RootState } from '@/store';

export const ExampleUsage = () => {
  // Your exact pattern: useSelector to read from Redux store
  const activityGroups = useSelector(
    (state: RootState) => state.mentors.mentors,
  );
  const selectedItem = useSelector(
    (state: RootState) => state.mentors.selectedMentor,
  );
  const persistedFilters = useSelector(
    (state: RootState) => state.mentors.filters,
  );

  // RTK Query hooks for API calls (following your pattern)
  const { data: mentors = [], isLoading, error } = useGetMentorsQuery({
    domain: 'frontend',
    search: '',
  });

  // Mutation following your pattern: const [createTrigger] = useMutation()
  const [createMentorTrigger] = useCreateMentorMutation();

  const handleCreateMentor = async () => {
    try {
      // Following your reference pattern: await createTrigger(payload).unwrap()
      const response = await createMentorTrigger({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        domainRole: 'frontend',
        expertise: 'React, TypeScript',
        experience: '5+ years in frontend development',
      }).unwrap();
      
      console.log('Mentor created successfully:', response);
      // RTK Query automatically invalidates cache and updates UI
    } catch (error) {
      console.error('Failed to create mentor:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Store Usage Examples</h2>
      
      {/* Display data from Redux store via useSelector */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Redux Store Data (useSelector)</h3>
        <p>Mentors in store: {activityGroups.length}</p>
        <p>Selected mentor: {selectedItem?.name || 'None'}</p>
        <p>Persisted filters: {JSON.stringify(persistedFilters)}</p>
      </div>

      {/* Display RTK Query data */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">RTK Query Data</h3>
        {isLoading && <p>Loading mentors from API...</p>}
        {error && <p>Error: {JSON.stringify(error)}</p>}
        <p>Mentors from API: {mentors.length}</p>
        {mentors.slice(0, 3).map((mentor) => (
          <div key={mentor.id} className="p-2 border rounded mb-2">
            <p><strong>{mentor.name}</strong> - {mentor.domainRole}</p>
            <p>{mentor.email}</p>
          </div>
        ))}
      </div>

      {/* Action button */}
      <button
        onClick={handleCreateMentor}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Test Mentor (RTK Query)
      </button>
    </div>
  );
};