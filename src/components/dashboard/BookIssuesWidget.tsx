import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, BookX } from 'lucide-react';
import { useLibraryStore } from '@/hooks/useLibraryStore';

interface BookIssuesWidgetProps {
  onViewAll: () => void;
}

export function BookIssuesWidget({ onViewAll }: BookIssuesWidgetProps) {
  const { getBookIssueStats, getOpenBookIssues, getBookById } = useLibraryStore();
  const stats = getBookIssueStats();
  const openIssues = getOpenBookIssues().slice(0, 3);

  if (stats.open === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BookX className="h-4 w-4" />
            Problèmes de livres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="rounded-full bg-green-500/10 p-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-muted-foreground">Aucun problème signalé</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const issueTypeLabels: Record<string, string> = {
    not_returned: 'Non retourné',
    damaged: 'Endommagé',
    torn: 'Déchiré',
    lost: 'Perdu',
    other: 'Autre',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <BookX className="h-4 w-4" />
            Problèmes de livres
          </CardTitle>
          <Badge variant="destructive" className="font-medium">
            {stats.open} ouvert{stats.open > 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {openIssues.map((issue) => {
          const book = getBookById(issue.bookId);
          return (
            <div
              key={issue.id}
              className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {book?.title || 'Livre inconnu'}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{issueTypeLabels[issue.issueType]}</span>
                  <span>•</span>
                  <span>{issue.quantity} ex.</span>
                </div>
              </div>
            </div>
          );
        })}

        <Button
          variant="ghost"
          className="w-full justify-between text-sm"
          onClick={onViewAll}
        >
          Voir tous les problèmes
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}