import { format, parseISO, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Book, CheckCircle, RefreshCw, Flag, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Loan, Book as BookType, Participant, OtherReader } from '@/hooks/useLibraryStore';
import { cn } from '@/lib/utils';

interface ActiveLoanCardProps {
  loan: Loan;
  book: BookType | undefined;
  borrowerName: string;
  borrowerInitials: string;
  borrowerNumber: string;
  onReturn: (loanId: string) => void;
  onRenew: (loanId: string) => void;
  onReport: (loan: Loan) => void;
}

export function ActiveLoanCard({
  loan,
  book,
  borrowerName,
  borrowerInitials,
  borrowerNumber,
  onReturn,
  onRenew,
  onReport,
}: ActiveLoanCardProps) {
  const today = new Date();
  const dueDate = parseISO(loan.dueDate);
  const daysUntilDue = differenceInDays(dueDate, today);
  
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue >= 0 && daysUntilDue <= 3;

  const getStatusColor = () => {
    if (isOverdue) return 'border-destructive bg-destructive/5';
    if (isDueSoon) return 'border-orange-500 bg-orange-500/5';
    return 'border-border';
  };

  const getStatusBadge = () => {
    if (isOverdue) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          {Math.abs(daysUntilDue)}j retard
        </Badge>
      );
    }
    if (isDueSoon) {
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600 gap-1">
          <Clock className="h-3 w-3" />
          {daysUntilDue}j restant
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="gap-1">
        <Clock className="h-3 w-3" />
        {daysUntilDue}j
      </Badge>
    );
  };

  return (
    <Card className={cn("p-4 transition-all hover:shadow-md", getStatusColor())}>
      <div className="flex gap-3">
        {/* Book Cover */}
        <div 
          className="h-20 w-16 rounded-md bg-primary/20 flex items-center justify-center shrink-0"
        >
          {book?.coverUrl ? (
            <img 
              src={book.coverUrl} 
              alt={book.title}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <Book className="h-6 w-6 text-primary" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Book Title */}
          <h4 className="font-semibold text-sm line-clamp-1">
            {book?.title || 'Livre inconnu'}
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {book?.author}
          </p>

          {/* Borrower */}
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px]">
                {borrowerInitials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{borrowerName}</p>
              <p className="text-[10px] text-muted-foreground">{borrowerNumber}</p>
            </div>
          </div>

          {/* Dates & Status */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              Retour: {format(dueDate, 'dd/MM/yyyy')}
            </span>
            {getStatusBadge()}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-3 pt-3 border-t">
        {isOverdue && (
          <Button 
            size="sm" 
            variant="destructive" 
            className="flex-1 h-8"
            onClick={() => onReport(loan)}
          >
            <Flag className="h-3 w-3 mr-1" />
            Signaler
          </Button>
        )}
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 h-8"
          onClick={() => onRenew(loan.id)}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Renouveler
        </Button>
        <Button 
          size="sm" 
          className="flex-1 h-8"
          onClick={() => onReturn(loan.id)}
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Retour
        </Button>
      </div>
    </Card>
  );
}
