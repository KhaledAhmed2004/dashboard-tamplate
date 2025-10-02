import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Faq } from '@/store/api/faqsApi';

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (faqData: Partial<Faq>) => void;
  faq?: Faq | null;
  mode: 'create' | 'edit';
  isLoading?: boolean;
}

const FaqModal: React.FC<FaqModalProps> = ({ isOpen, onClose, onSubmit, faq, mode, isLoading = false }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    status: 'published' as 'published' | 'draft',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' && faq) {
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: (faq.category || 'general').toLowerCase(),
        status: (faq.status || 'draft'),
      });
    } else if (mode === 'create') {
      setFormData({ question: '', answer: '', category: 'general', status: 'published' });
    }
    setErrors({});
  }, [mode, faq, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.question.trim()) newErrors.question = 'Question is required';
    if (!formData.answer.trim()) newErrors.answer = 'Answer is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const now = new Date().toISOString();
    const faqData: Partial<Faq> = {
      ...formData,
      ...(mode === 'create' && { createdAt: now, updatedAt: now }),
    };
    onSubmit(faqData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New FAQ' : 'Edit FAQ'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question *</Label>
            <Input id="question" value={formData.question} onChange={(e) => handleChange('question', e.target.value)} placeholder="Enter question" className={errors.question ? 'border-red-500' : ''} />
            {errors.question && <p className="text-sm text-red-500">{errors.question}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="answer">Answer *</Label>
            <textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => handleChange('answer', e.target.value)}
              placeholder="Enter detailed answer"
              className={`w-full rounded-md border px-3 py-2 text-sm ${errors.answer ? 'border-red-500' : ''}`}
              rows={5}
            />
            {errors.answer && <p className="text-sm text-red-500">{errors.answer}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={formData.category} onChange={(e) => handleChange('category', e.target.value)} placeholder="e.g., account, billing, support" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : mode === 'create' ? 'Create FAQ' : 'Update FAQ'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FaqModal;