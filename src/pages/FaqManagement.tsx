import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { useGetFaqsQuery, useCreateFaqMutation, useUpdateFaqMutation, useDeleteFaqMutation, type Faq } from '@/store/api/faqsApi';
import FaqModal from '@/components/FaqModal';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';
import { Plus, Edit, Trash2 } from 'lucide-react';

const FaqManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [category, setCategory] = useState<string | 'all'>('all');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, refetch } = useGetFaqsQuery({ page, limit, search, status, category });
  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [currentFaq, setCurrentFaq] = useState<Faq | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);

  const faqs = data?.faqs || [];
  const meta = data?.meta;

  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach(f => { if (f.category) set.add(f.category.toLowerCase()); });
    return Array.from(set);
  }, [faqs]);

  const openCreate = () => {
    setModalMode('create');
    setCurrentFaq(null);
    setIsModalOpen(true);
  };

  const openEdit = (faq: Faq) => {
    setModalMode('edit');
    setCurrentFaq(faq);
    setIsModalOpen(true);
  };

  const handleSubmit = async (payload: Partial<Faq>) => {
    try {
      if (modalMode === 'create') {
        await createFaq({
          question: payload.question || '',
          answer: payload.answer || '',
          category: (payload.category || 'general').toLowerCase(),
          status: (payload.status || 'published') as 'published' | 'draft',
        }).unwrap();
        toast.success('FAQ created');
      } else if (currentFaq) {
        await updateFaq({
          id: currentFaq.id,
          question: payload.question,
          answer: payload.answer,
          category: payload.category?.toLowerCase(),
          status: payload.status as 'published' | 'draft',
        }).unwrap();
        toast.success('FAQ updated');
      }
      setIsModalOpen(false);
      refetch();
    } catch (e) {
      toast.error('Failed to save FAQ');
    }
  };

  const confirmDelete = (faq: Faq) => setDeleteTarget(faq);
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFaq(deleteTarget.id).unwrap();
      setDeleteTarget(null);
      toast.success('FAQ deleted');
      refetch();
    } catch (e) {
      toast.error('Failed to delete FAQ');
    }
  };

  const statusColors: Record<string, string> = {
    published: 'bg-green-200 text-green-900',
    draft: 'bg-gray-200 text-gray-900',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">FAQ Management</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>FAQs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Input placeholder="Search question, answer, category" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            <Select value={status} onValueChange={(v) => { setStatus(v as any); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={(v) => { setCategory(v as any); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map(c => (
                  <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Question</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5}>Loading...</TableCell>
                  </TableRow>
                ) : faqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>No FAQs found</TableCell>
                  </TableRow>
                ) : (
                  faqs.map(faq => (
                    <TableRow key={faq.id}>
                      <TableCell className="max-w-xl">
                        <div className="font-medium">{faq.question}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</div>
                      </TableCell>
                      <TableCell>{faq.category ? faq.category.charAt(0).toUpperCase() + faq.category.slice(1) : '-'}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[faq.status] || ''}>{faq.status.charAt(0).toUpperCase() + faq.status.slice(1)}</Badge>
                      </TableCell>
                      <TableCell>{new Date(faq.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(faq)} disabled={isUpdating}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => confirmDelete(faq)} disabled={isDeleting}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</Button>
              <span className="text-sm">Page {page} of {meta.totalPages}</span>
              <Button variant="outline" onClick={() => setPage(Math.min(meta.totalPages, page + 1))} disabled={page === meta.totalPages}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <FaqModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        faq={currentFaq || undefined}
        mode={modalMode}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete FAQ"
        description="This action cannot be undone. This will permanently delete the FAQ."
        loading={isDeleting}
      />
    </div>
  );
};

export default FaqManagement;