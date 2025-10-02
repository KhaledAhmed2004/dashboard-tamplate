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

const getStoredLegal = (): LegalState | null => {
  const stored = localStorage.getItem('mockLegal');
  return stored ? JSON.parse(stored) : null;
};

const setStoredLegal = (legal: LegalState): void => {
  localStorage.setItem('mockLegal', JSON.stringify(legal));
};

const genId = (): string => Date.now().toString() + Math.random().toString(36).slice(2, 8);

export const legalApi = createApi({
  reducerPath: 'legalApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  tagTypes: ['Legal'],
  endpoints: (builder) => ({
    getLegalBySlug: builder.query<LegalDocument, 'privacy' | 'terms'>({
      queryFn: async (slug) => {
        try {
          let legal = getStoredLegal();
          if (!legal) {
            const resp = await fetch('/api/legal.json');
            const data = await resp.json();
            // Ensure section IDs exist
            const withIds: LegalState = {
              privacy: {
                ...data.privacy,
                sections: (data.privacy.sections || []).map((s: any) => ({ id: s.id || genId(), title: s.title, body: s.body })),
              },
              terms: {
                ...data.terms,
                sections: (data.terms.sections || []).map((s: any) => ({ id: s.id || genId(), title: s.title, body: s.body })),
              },
            };
            setStoredLegal(withIds);
            legal = withIds;
          }
          const doc = slug === 'privacy' ? legal.privacy : legal.terms;
          return { data: doc };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to fetch legal document' } };
        }
      },
      providesTags: (result, error, slug) => [{ type: 'Legal', id: slug }],
    }),

    updateLegal: builder.mutation<LegalDocument, UpdateLegalRequest>({
      queryFn: async ({ slug, sections }) => {
        try {
          let legal = getStoredLegal();
          if (!legal) {
            const resp = await fetch('/api/legal.json');
            const data = await resp.json();
            legal = {
              privacy: data.privacy,
              terms: data.terms,
            } as LegalState;
          }

          const now = new Date().toISOString();
          const normalizedSections: LegalSection[] = sections.map(s => ({ id: genId(), title: s.title, body: s.body }));

          if (slug === 'privacy') {
            legal.privacy = { ...legal.privacy, sections: normalizedSections, updatedAt: now };
          } else {
            legal.terms = { ...legal.terms, sections: normalizedSections, updatedAt: now };
          }

          setStoredLegal(legal);
          return { data: slug === 'privacy' ? legal.privacy : legal.terms };
        } catch (error) {
          return { error: { status: 'FETCH_ERROR', error: 'Failed to update legal document' } };
        }
      },
      invalidatesTags: (result, error, { slug }) => [{ type: 'Legal', id: slug }],
    }),
  }),
});

export const { useGetLegalBySlugQuery, useUpdateLegalMutation } = legalApi;
export type { LegalDocument, LegalSection };