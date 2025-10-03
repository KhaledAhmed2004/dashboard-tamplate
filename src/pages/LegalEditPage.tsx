import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import TipTapEditor from '@/components/TipTapEditor';
import { useGetLegalBySlugQuery, useUpdateLegalMutation, type LegalSection } from '@/store/api/legalApi';
import { toast } from 'sonner';

const slugToTitle: Record<string, string> = {
  privacy: 'Privacy Policy',
  terms: 'Terms & Conditions',
};

const slugToViewPath: Record<string, string> = {
  privacy: '/privacy',
  terms: '/terms',
};

const LegalEditPage = () => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const slugKey: 'privacy' | 'terms' = slug === 'privacy' || slug === 'terms' ? slug : 'privacy';
  const { data: doc, isLoading } = useGetLegalBySlugQuery(slugKey);
  const [updateLegal, { isLoading: isSaving }] = useUpdateLegalMutation();

  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (doc) {
      const combined = (doc.sections || [])
        .map((s: LegalSection) => s.body || '')
        .join('<p><br/></p>');
      setContent(combined);
    }
  }, [doc]);

  // Single document editing; no section management

  const handleSave = async () => {
    try {
      // Save as a single section containing the whole document body
      await updateLegal({ slug: slugKey, sections: [{ title: '', body: content }] }).unwrap();
      toast.success(`${slugToTitle[slugKey] || 'Document'} updated`);
      navigate(slugToViewPath[slugKey] || '/');
    } catch (e) {
      toast.error('Failed to save changes');
    }
  };

  const handleCancel = () => {
    navigate(slugToViewPath[slug] || '/');
  };

  const title = slugToTitle[slugKey] || doc?.title || 'Document';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit {title}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>{isSaving ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </div>

      {isLoading ? (
        <Card><CardContent>Loading...</CardContent></Card>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Content</Label>
                <TipTapEditor value={content} onChange={setContent} placeholder="Write the full document content..." />
              </div>
            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
};

export default LegalEditPage;