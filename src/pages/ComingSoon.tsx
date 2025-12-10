import { Construction } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';

interface ComingSoonProps {
  title: string;
  description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
        <Card className="max-w-md text-center">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="rounded-full bg-accent/10 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Construction className="h-10 w-10 text-accent" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <p className="text-muted-foreground">{description}</p>
            <p className="text-sm text-muted-foreground mt-4">
              This feature will be available in Phase 2.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
