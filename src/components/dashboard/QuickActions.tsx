import { Plus, BookCopy, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onAddBook: () => void;
  onNewLoan: () => void;
  onAddParticipant: () => void;
}

export function QuickActions({ onAddBook, onNewLoan, onAddParticipant }: QuickActionsProps) {
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-11 border-border text-foreground hover:bg-muted"
          onClick={onAddBook}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          Add New Book
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-11 border-border text-foreground hover:bg-muted"
          onClick={onNewLoan}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
            <BookCopy className="h-4 w-4 text-success" />
          </div>
          Create Loan
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-11 border-border text-foreground hover:bg-muted"
          onClick={onAddParticipant}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <UserPlus className="h-4 w-4 text-accent" />
          </div>
          Add Participant
        </Button>
      </CardContent>
    </Card>
  );
}