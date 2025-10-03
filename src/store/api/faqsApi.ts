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

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const faqsApi = createApi({
  reducerPath: 'faqsApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE, credentials: 'include' }),
  tagTypes: ['Faq'],
  endpoints: (builder) => ({
    getFaqs: builder.query<FaqsResponse, FaqsQueryParams>({
      query: () => ({ url: '/faqs' }),
      transformResponse: (response: { faqs: Faq[] }, _meta, params) => {
        const faqs = response.faqs || [];
        let filtered = faqs;
        if (params?.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(f =>
            f.question.toLowerCase().includes(q) ||
            f.answer.toLowerCase().includes(q) ||
            (f.category || '').toLowerCase().includes(q)
          );
        }
        if (params?.status && params.status !== 'all') {
          filtered = filtered.filter(f => (f.status || '').toLowerCase() === params.status);
        }
        if (params?.category && params.category !== 'all') {
          filtered = filtered.filter(f => (f.category || '').toLowerCase() === params.category.toLowerCase());
        }
        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginated = filtered.slice(start, end);
        return { faqs: paginated, meta: { total: filtered.length, page, limit, totalPages: Math.ceil(filtered.length / limit) } } as FaqsResponse;
      },
      providesTags: ['Faq'],
    }),

    getFaqById: builder.query<Faq, string>({
      query: (id) => ({ url: `/faqs/${id}` }),
      providesTags: (result, error, id) => {
        void result; void error; return [{ type: 'Faq', id }];
      },
    }),

    createFaq: builder.mutation<Faq, CreateFaqRequest>({
      query: (faqData) => ({ url: '/faqs', method: 'POST', body: faqData }),
      invalidatesTags: ['Faq'],
    }),

    updateFaq: builder.mutation<Faq, UpdateFaqRequest>({
      query: ({ id, ...update }) => ({ url: `/faqs/${id}`, method: 'PUT', body: update }),
      invalidatesTags: (result, error, { id }) => {
        void result; void error; return [{ type: 'Faq', id }, 'Faq'];
      },
    }),

    deleteFaq: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({ url: `/faqs/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Faq'],
    }),

    searchFaqs: builder.query<Faq[], string>({
      query: () => ({ url: '/faqs' }),
      transformResponse: (response: { faqs: Faq[] }, _meta, query) => {
        const list = response.faqs || [];
        const q = (query || '').toLowerCase();
        return list.filter(f =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          (f.category || '').toLowerCase().includes(q)
        );
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