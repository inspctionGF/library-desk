import { useState, useMemo } from 'react';
import { addDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ShoppingCart, RotateCcw, BookOpen, AlertTriangle, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookSearchGrid } from './BookSearchGrid';
import { CheckoutCart } from './CheckoutCart';
import { POSReturnMode } from './POSReturnMode';
import { useAuditedLibraryStore } from '@/hooks/useAuditedLibraryStore';
import { BorrowerType, Loan } from '@/hooks/useLibraryStore';

interface POSLoanInterfaceProps {
  onReturnDialogOpen: (loanId: string) => void;
  onRenewDialogOpen: (loanId: string) => void;
  onReportIssue: (loan: Loan) => void;
}

export function POSLoanInterface({
  onReturnDialogOpen,
  onRenewDialogOpen,
  onReportIssue,
}: POSLoanInterfaceProps) {
  const { 
    books, 
    categories, 
    participants, 
    otherReaders,
    loans,
    addLoan,
    getBookById,
    getParticipantById,
    getActiveLoansForParticipant,
    getActiveLoansForOtherReader,
    getLoanStats,
  } = useAuditedLibraryStore();

  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState<{ type: BorrowerType; id: string } | null>(null);
  const [dueDate, setDueDate] = useState<Date>(addDays(new Date(), 14));
  const [mode, setMode] = useState<'checkout' | 'return'>('checkout');

  const stats = getLoanStats();
  const today = new Date().toISOString().split('T')[0];

  // Available books (with copies available)
  const availableBooks = useMemo(() => 
    books.filter(b => b.availableCopies > 0),
    [books]
  );

  // Get active loans count for selected borrower
  const activeLoansCount = useMemo(() => {
    if (!selectedBorrower || !selectedBorrower.id) return 0;
    if (selectedBorrower.type === 'participant') {
      return getActiveLoansForParticipant(selectedBorrower.id).length;
    } else {
      return getActiveLoansForOtherReader(selectedBorrower.id).length;
    }
  }, [selectedBorrower, getActiveLoansForParticipant, getActiveLoansForOtherReader]);

  const maxLoans = 3;

  const handleSelectBook = (bookId: string) => {
    if (selectedBooks.includes(bookId)) return;
    
    // Check if adding would exceed limit
    if (selectedBorrower && (activeLoansCount + selectedBooks.length + 1) > maxLoans) {
      toast.error(`Limite de ${maxLoans} prêts atteinte`);
      return;
    }
    
    setSelectedBooks(prev => [...prev, bookId]);
  };

  const handleRemoveBook = (bookId: string) => {
    setSelectedBooks(prev => prev.filter(id => id !== bookId));
  };

  const handleClearCart = () => {
    setSelectedBooks([]);
  };

  const handleSelectBorrower = (type: BorrowerType, id: string) => {
    if (!id) {
      setSelectedBorrower(null);
      return;
    }
    setSelectedBorrower({ type, id });
  };

  const handleCheckout = () => {
    if (!selectedBorrower || selectedBooks.length === 0) return;

    let borrowerName = '';
    if (selectedBorrower.type === 'participant') {
      const participant = participants.find(p => p.id === selectedBorrower.id);
      borrowerName = participant ? `${participant.firstName} ${participant.lastName}` : '';
    } else {
      const reader = otherReaders.find(r => r.id === selectedBorrower.id);
      borrowerName = reader ? `${reader.firstName} ${reader.lastName}` : '';
    }

    // Create loans for each selected book
    selectedBooks.forEach(bookId => {
      addLoan({
        bookId,
        borrowerType: selectedBorrower.type,
        borrowerId: selectedBorrower.id,
        borrowerName,
        participantId: selectedBorrower.type === 'participant' ? selectedBorrower.id : undefined,
        participantName: selectedBorrower.type === 'participant' ? borrowerName : undefined,
        dueDate: format(dueDate, 'yyyy-MM-dd'),
        returnDate: null,
      });
    });

    toast.success(`${selectedBooks.length} livre(s) emprunté(s) avec succès`);
    
    // Reset
    setSelectedBooks([]);
    setSelectedBorrower(null);
    setDueDate(addDays(new Date(), 14));
  };

  const overdueCount = loans.filter(l => l.status !== 'returned' && l.dueDate < today).length;
  const activeCount = loans.filter(l => l.status === 'active' || l.status === 'overdue').length;

  return (
    <div className="h-[calc(100vh-12rem)]">
      {/* Mode Toggle & Stats Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'checkout' | 'return')}>
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="checkout" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Prêt
            </TabsTrigger>
            <TabsTrigger value="return" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Retour
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span>{activeCount} actifs</span>
          </div>
          {overdueCount > 0 && (
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{overdueCount} en retard</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      {mode === 'checkout' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left: Book Grid (2/3 width on desktop) */}
          <div className="lg:col-span-2 h-full min-h-[400px]">
            <BookSearchGrid
              books={availableBooks}
              categories={categories}
              selectedBooks={selectedBooks}
              onSelectBook={handleSelectBook}
              onRemoveBook={handleRemoveBook}
            />
          </div>

          {/* Right: Checkout Cart (1/3 width on desktop) */}
          <div className="h-full min-h-[400px]">
            <CheckoutCart
              books={books}
              participants={participants}
              otherReaders={otherReaders}
              selectedBooks={selectedBooks}
              selectedBorrower={selectedBorrower}
              dueDate={dueDate}
              activeLoansCount={activeLoansCount}
              maxLoans={maxLoans}
              onRemoveBook={handleRemoveBook}
              onClearCart={handleClearCart}
              onSelectBorrower={handleSelectBorrower}
              onDueDateChange={setDueDate}
              onCheckout={handleCheckout}
              getBookById={getBookById}
            />
          </div>
        </div>
      ) : (
        <POSReturnMode
          loans={loans}
          books={books}
          participants={participants}
          otherReaders={otherReaders}
          getBookById={getBookById}
          getParticipantById={getParticipantById}
          onReturn={onReturnDialogOpen}
          onRenew={onRenewDialogOpen}
          onReport={onReportIssue}
        />
      )}
    </div>
  );
}
