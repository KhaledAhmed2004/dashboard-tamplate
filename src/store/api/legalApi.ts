import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface LegalSection {
  id: string;
  title: string;
  body: string;
}

export interface LegalDocument {
  slug: 'privacy' | 'terms';
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}

export interface LegalState {
  privacy: LegalDocument;
  terms: LegalDocument;
}

export interface UpdateLegalRequest {
  slug: 'privacy' | 'terms';
  sections: { title: string; body: string }[];
}



const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export const legalApi = createApi({
  reducerPath: 'legalApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE, credentials: 'include' }),
  tagTypes: ['Legal'],
  endpoints: (builder) => ({
    getLegalBySlug: builder.query<LegalDocument, 'privacy' | 'terms'>({
      query: (slug) => ({ url: `/legal/${slug}` }),
      providesTags: (result, error, slug) => {
        void result; void error; return [{ type: 'Legal', id: slug }];
      },
    }),

    updateLegal: builder.mutation<LegalDocument, UpdateLegalRequest>({
      query: ({ slug, sections }) => ({ url: `/legal/${slug}`, method: 'PUT', body: { sections } }),
      invalidatesTags: (result, error, { slug }) => {
        void result; void error; return [{ type: 'Legal', id: slug }];
      },
    }),
  }),
});

export const { useGetLegalBySlugQuery, useUpdateLegalMutation } = legalApi;