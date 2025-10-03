import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useGetLegalBySlugQuery } from '@/store/api/legalApi';

const TermsAndConditions = () => {
  const { data: doc, isLoading } = useGetLegalBySlugQuery('terms');
  const navigate = useNavigate();
  const updated = doc ? new Date(doc.updatedAt).toLocaleDateString() : new Date().toLocaleDateString();
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Terms & Conditions</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Last updated: {updated}</span>
          <Button variant="outline" onClick={() => navigate('/legal/terms/edit')} disabled={isLoading}>Edit</Button>
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

export default TermsAndConditions;