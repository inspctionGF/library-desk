import { Plus, BookCopy, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickActionsProps {
  onAddBook: () => void;
  onNewLoan: () => void;
  onAddParticipant: () => void;
}

export function QuickActions({ onAddBook, onNewLoan, onAddParticipant }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Button 
          onClick={onAddBook}
          className="justify-start gap-3 h-12 bg-primary hover:bg-primary/90"
        >
          <Plus className="h-5 w-5" />
          Add New Book
        </Button>
        <Button 
          onClick={onNewLoan}
          variant="outline"
          className="justify-start gap-3 h-12 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground"
        >
          <BookCopy className="h-5 w-5" />
          New Loan
        </Button>
        <Button 
          onClick={onAddParticipant}
          variant="outline"
          className="justify-start gap-3 h-12 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          <UserPlus className="h-5 w-5" />
          Add Participant
        </Button>
      </CardContent>
    </Card>
  );
}
