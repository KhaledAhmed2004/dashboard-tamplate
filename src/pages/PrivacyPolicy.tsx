import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useGetLegalBySlugQuery, useUpdateLegalMutation, type LegalDocument } from '@/store/api/legalApi';
import LegalModal from '@/components/LegalModal';
import { toast } from 'sonner';

const PrivacyPolicy: React.FC = () => {
  const { data: doc, isLoading, refetch } = useGetLegalBySlugQuery('privacy');
  const navigate = useNavigate();
  const [updateLegal, { isLoading: isSaving }] = useUpdateLegalMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const updated = doc ? new Date(doc.updatedAt).toLocaleDateString() : new Date().toLocaleDateString();
  const sections = (doc?.sections || []) as LegalDocument['sections'];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Privacy Policy</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Last updated: {updated}</span>
          <Button variant="outline" onClick={() => navigate('/legal/privacy/edit')} disabled={isLoading}>Edit</Button>
        </div>
      </div>

      {isLoading ? (
        <Card><CardContent>Loading...</CardContent></Card>
      ) : (
        <Card>
          <CardContent>
            <div
              className="text-sm text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: (doc?.sections || []).map(s => s.body).join('<p><br/></p>') }}
            />
          </CardContent>
        </Card>
      )}

      {/* Modal editing disabled; using dedicated edit page */}
    </div>
  );
};

export default PrivacyPolicy;