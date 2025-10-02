import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
}

export interface FaqsResponse {
  faqs: Faq[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateFaqRequest {
  question: string;
  answer: string;
  category: string;
  status: 'published' | 'draft';
}

export interface UpdateFaqRequest {
  id: string;
  question?: string;
  answer?: string;
  category?: string;
  status?: 'published' | 'draft';
}

export interface FaqsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'published' | 'draft';
  category?: string | 'all';
}

// Local storage helpers for mock persistence
const getStoredFaqs = (): Faq[] | null => {
  const stored = localStorage.getItem('mockFaqs');
  return stored ? JSON.parse(stored) : null;
};

const setStoredFaqs = (faqs: Faq[]): void => {
  localStorage.setItem('mockFaqs', JSON.stringify(faqs));
};

const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

export const faqsApi = createApi({
  reducerPath: 'faqsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Faq'],
  endpoints: (builder) => ({
    getFaqs: builder.query<FaqsResponse, FaqsQueryParams>({
      queryFn: async (params) => {
        try {
          let faqs = getStoredFaqs();
          if (!faqs) {
            const response = await fetch('/api/faqs.json');
            const data = await response.json();
            faqs = data.faqs as Faq[];
            setStoredFaqs(faqs);
          }

          let filteredFaqs = faqs;

          if (params.search) {
            const q = params.search.toLowerCase();
            filteredFaqs = filteredFaqs.filter(f =>
              f.question.toLowerCase().includes(q) ||
              f.answer.toLowerCase().includes(q) ||
              (f.category || '').toLowerCase().includes(q)
            );
          }

          if (params.status && params.status !== 'all') {
            filteredFaqs = filteredFaqs.filter(f => (f.status || '').toLowerCase() === params.status);
          }

          if (params.category && params.category !== 'all') {
            filteredFaqs = filteredFaqs.filter(f => (f.category || '').toLowerCase() === params.category?.toLowerCase());
          }

          const page = params.page || 1;
          const limit = params.limit || 10;
          const start = (page - 1) * limit;
          const end = start + limit;
          const paginated = filteredFaqs.slice(start, end);

          return {
            data: {
              faqs: paginated,
              meta: {
                total: filteredFaqs.length,
                page,
                limit,
                totalPages: Math.ceil(filteredFaqs.length / limit),
              },
            },
          };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to fetch FAQs' } };
        }
      },
      providesTags: ['Faq'],
    }),

    getFaqById: builder.query<Faq, string>({
      queryFn: async (id) => {
        try {
          let faqs = getStoredFaqs();
          if (!faqs) {
            const response = await fetch('/api/faqs.json');
            const data = await response.json();
            faqs = data.faqs as Faq[];
            setStoredFaqs(faqs);
          }

          const faq = (faqs || []).find(f => f.id === id);
          if (!faq) {
            return { error: { status: 404, data: 'FAQ not found' } } as any;
          }
          return { data: faq };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to fetch FAQ' } };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Faq', id }],
    }),

    createFaq: builder.mutation<Faq, CreateFaqRequest>({
      queryFn: async (faqData) => {
        try {
          let faqs = getStoredFaqs() || [];
          if (faqs.length === 0) {
            const response = await fetch('/api/faqs.json');
            const data = await response.json();
            faqs = data.faqs as Faq[];
          }

          const now = new Date().toISOString();
          const newFaq: Faq = {
            id: generateId(),
            question: faqData.question,
            answer: faqData.answer,
            category: faqData.category,
            status: faqData.status,
            createdAt: now,
            updatedAt: now,
          };

          const updated = [newFaq, ...faqs];
          setStoredFaqs(updated);
          return { data: newFaq };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to create FAQ' } };
        }
      },
      invalidatesTags: ['Faq'],
    }),

    updateFaq: builder.mutation<Faq, UpdateFaqRequest>({
      queryFn: async ({ id, ...update }) => {
        try {
          let faqs = getStoredFaqs();
          if (!faqs) {
            const response = await fetch('/api/faqs.json');
            const data = await response.json();
            faqs = data.faqs as Faq[];
          }

          const idx = faqs.findIndex(f => f.id === id);
          if (idx === -1) {
            return { error: { status: 404, data: 'FAQ not found' } } as any;
          }

          const now = new Date().toISOString();
          const updatedFaq = { ...faqs[idx], ...update, updatedAt: now } as Faq;
          faqs[idx] = updatedFaq;
          setStoredFaqs(faqs);
          return { data: updatedFaq };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to update FAQ' } };
        }
      },
      invalidatesTags: (result, error, { id }) => [{ type: 'Faq', id }, 'Faq'],
    }),

    deleteFaq: builder.mutation<{ success: boolean }, string>({
      queryFn: async (id) => {
        try {
          let faqs = getStoredFaqs();
          if (!faqs) {
            const response = await fetch('/api/faqs.json');
            const data = await response.json();
            faqs = data.faqs as Faq[];
          }

          const idx = faqs.findIndex(f => f.id === id);
          if (idx === -1) {
            return { error: { status: 404, data: 'FAQ not found' } } as any;
          }

          faqs.splice(idx, 1);
          setStoredFaqs(faqs);
          return { data: { success: true } };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to delete FAQ' } };
        }
      },
      invalidatesTags: ['Faq'],
    }),

    searchFaqs: builder.query<Faq[], string>({
      queryFn: async (query) => {
        try {
          let faqs = getStoredFaqs();
          if (!faqs) {
            const response = await fetch('/api/faqs.json');
            const data = await response.json();
            faqs = data.faqs as Faq[];
            setStoredFaqs(faqs);
          }

          const q = (query || '').toLowerCase();
          const results = faqs.filter(f =>
            f.question.toLowerCase().includes(q) ||
            f.answer.toLowerCase().includes(q) ||
            (f.category || '').toLowerCase().includes(q)
          );
          return { data: results };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to search FAQs' } };
        }
      },
    }),
  }),
});

export const {
  useGetFaqsQuery,
  useGetFaqByIdQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
  useLazySearchFaqsQuery,
} = faqsApi;

export type { Faq };