import { api } from './api';
import type { PortfolioRO, CreatePortfolioDTO, UpdatePortfolioDTO } from './dto';

export const portfolioApi = api.injectEndpoints({
  endpoints: (build) => ({
    // Get all portfolio items for a buddy
    getPortfoliosByBuddyId: build.query<PortfolioRO[], string>({
      query: (buddyId) => `/api/buddies/${buddyId}/portfolios`,
      providesTags: (result, error, buddyId) => [
        { type: 'Portfolios', id: buddyId },
        'Portfolios',
      ],
    }),

    // Create a new portfolio item
    createPortfolio: build.mutation<PortfolioRO, { buddyId: string; data: CreatePortfolioDTO }>({
      query: ({ buddyId, data }) => ({
        url: `/api/buddies/${buddyId}/portfolio`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (_, __, { buddyId }) => [
        { type: 'Portfolios', id: buddyId },
        'Portfolios',
      ],
    }),

    // Update a portfolio item
    updatePortfolio: build.mutation<PortfolioRO, { id: string; data: UpdatePortfolioDTO }>({
      query: ({ id, data }) => ({
        url: `/api/portfolios/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result) => [
        { type: 'Portfolios', id: result?.buddyId },
        'Portfolios',
      ],
    }),

    // Delete a portfolio item
    deletePortfolio: build.mutation<void, string>({
      query: (id) => ({
        url: `/api/portfolios/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Portfolios'],
    }),
  }),
});

export const {
  useGetPortfoliosByBuddyIdQuery,
  useLazyGetPortfoliosByBuddyIdQuery,
  useCreatePortfolioMutation,
  useUpdatePortfolioMutation,
  useDeletePortfolioMutation,
} = portfolioApi;
