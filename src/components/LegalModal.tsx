import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { LegalDocument, LegalSection } from '@/store/api/legalApi';
import TrixEditor from '@/components/TrixEditor';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: LegalDocument | null;
  onSubmit: (sections: { title: string; body: string }[]) => void;
  isLoading?: boolean;
}

const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, document, onSubmit, isLoading = false }) => {
  const [sections, setSections] = useState<{ title: string; body: string }[]>([]);

  useEffect(() => {
    if (document) {
      const initial = (document.sections || []).map((s: LegalSection) => ({ title: s.title, body: s.body }));
      setSections(initial.length ? initial : [{ title: '', body: '' }]);
    } else {
      setSections([{ title: '', body: '' }]);
    }
  }, [document, isOpen]);

  const updateSection = (index: number, field: 'title' | 'body', value: string) => {
    setSections(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addSection = () => setSections(prev => [...prev, { title: '', body: '' }]);
  const removeSection = (index: number) => setSections(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(sections);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Edit {document?.title || 'Document'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {sections.map((sec, idx) => (
            <div key={idx} className="space-y-3 border rounded-md p-4">
              <div className="flex items-center justify-between">
                <Label>Section {idx + 1}</Label>
                <Button type="button" variant="destructive" size="sm" onClick={() => removeSection(idx)} disabled={sections.length === 1}>Remove</Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`title-${idx}`}>Title</Label>
                <Input id={`title-${idx}`} value={sec.title} onChange={(e) => updateSection(idx, 'title', e.target.value)} placeholder="Section title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`body-${idx}`}>Body</Label>
                <TrixEditor
                  value={sec.body}
                  onChange={(html) => updateSection(idx, 'body', html)}
                  placeholder="Section content"
                />
              </div>
            </div>
          ))}

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={addSection}>Add Section</Button>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LegalModal;