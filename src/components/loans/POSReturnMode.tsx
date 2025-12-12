import { useState, useMemo } from 'react';
import { Search, RotateCcw, AlertTriangle, Clock, History, CheckCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ActiveLoanCard } from './ActiveLoanCard';
import { Loan, Book, Participant, OtherReader } from '@/hooks/useLibraryStore';

interface POSReturnModeProps {
  loans: Loan[];
  books: Book[];
  participants: Participant[];
  otherReaders: OtherReader[];
  getBookById: (id: string) => Book | undefined;
  getParticipantById: (id: string) => Participant | undefined;
  onReturn: (loanId: string) => void;
  onRenew: (loanId: string) => void;
  onReport: (loan: Loan) => void;
}

export function POSReturnMode({
  loans,
  books,
  participants,
  otherReaders,
  getBookById,
  getParticipantById,
  onReturn,
  onRenew,
  onReport,
}: POSReturnModeProps) {
  const [search, setSearch] = useState('');
  const today = new Date().toISOString().split('T')[0];

  // Categorize loans
  const { overdueLoans, activeLoans, returnedLoans } = useMemo(() => {
    const overdue = loans.filter(l => l.status !== 'returned' && l.dueDate < today);
    const active = loans.filter(l => (l.status === 'active' || l.status === 'overdue') && l.dueDate >= today);
    const returned = loans.filter(l => l.status === 'returned');
    
    return {
      overdueLoans: overdue.sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      activeLoans: active.sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
      returnedLoans: returned.sort((a, b) => (b.returnDate || '').localeCompare(a.returnDate || '')).slice(0, 20),
    };
  }, [loans, today]);

  const getBorrowerInfo = (loan: Loan) => {
    if (loan.borrowerType === 'participant') {
      const participant = getParticipantById(loan.borrowerId || loan.participantId || '');
      if (participant) {
        return {
          name: `${participant.firstName} ${participant.lastName}`,
          initials: `${participant.firstName[0]}${participant.lastName[0]}`,
          number: participant.participantNumber,
        };
      }
    } else {
      const reader = otherReaders.find(r => r.id === loan.borrowerId);
      if (reader) {
        return {
          name: `${reader.firstName} ${reader.lastName}`,
          initials: `${reader.firstName[0]}${reader.lastName[0]}`,
          number: reader.readerNumber,
        };
      }
    }
    return {
      name: loan.borrowerName || loan.participantName || 'Inconnu',
      initials: '??',
      number: '',
    };
  };

  // Filter loans by search
  const filterLoans = (loanList: Loan[]) => {
    if (!search) return loanList;
    
    const searchLower = search.toLowerCase();
    return loanList.filter(loan => {
      const book = getBookById(loan.bookId);
      const borrower = getBorrowerInfo(loan);
      
      return (
        book?.title.toLowerCase().includes(searchLower) ||
        book?.author.toLowerCase().includes(searchLower) ||
        borrower.name.toLowerCase().includes(searchLower) ||
        borrower.number.toLowerCase().includes(searchLower)
      );
    });
  };

  const filteredOverdue = filterLoans(overdueLoans);
  const filteredActive = filterLoans(activeLoans);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par livre, emprunteur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <Tabs defaultValue="active" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="overdue" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Retard ({overdueLoans.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="gap-2">
            <Clock className="h-4 w-4" />
            Actifs ({activeLoans.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        {/* Overdue Loans */}
        <TabsContent value="overdue" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            {filteredOverdue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mb-4 text-green-500" />
                <p>Aucun livre en retard</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pb-4">
                {filteredOverdue.map(loan => {
                  const book = getBookById(loan.bookId);
                  const borrower = getBorrowerInfo(loan);
                  
                  return (
                    <ActiveLoanCard
                      key={loan.id}
                      loan={loan}
                      book={book}
                      borrowerName={borrower.name}
                      borrowerInitials={borrower.initials}
                      borrowerNumber={borrower.number}
                      onReturn={onReturn}
                      onRenew={onRenew}
                      onReport={onReport}
                    />
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Active Loans */}
        <TabsContent value="active" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            {filteredActive.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <RotateCcw className="h-12 w-12 mb-4 opacity-50" />
                <p>Aucun prêt actif</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pb-4">
                {filteredActive.map(loan => {
                  const book = getBookById(loan.bookId);
                  const borrower = getBorrowerInfo(loan);
                  
                  return (
                    <ActiveLoanCard
                      key={loan.id}
                      loan={loan}
                      book={book}
                      borrowerName={borrower.name}
                      borrowerInitials={borrower.initials}
                      borrowerNumber={borrower.number}
                      onReturn={onReturn}
                      onRenew={onRenew}
                      onReport={onReport}
                    />
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="flex-1 mt-0">
          <ScrollArea className="h-[calc(100vh-20rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livre</TableHead>
                  <TableHead>Emprunteur</TableHead>
                  <TableHead>Emprunté</TableHead>
                  <TableHead>Retourné</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnedLoans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Aucun retour enregistré
                    </TableCell>
                  </TableRow>
                ) : (
                  returnedLoans.map(loan => {
                    const book = getBookById(loan.bookId);
                    const borrower = getBorrowerInfo(loan);
                    
                    return (
                      <TableRow key={loan.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{book?.title || 'Inconnu'}</p>
                            <p className="text-xs text-muted-foreground">{book?.author}</p>
                          </div>
                        </TableCell>
                        <TableCell>{borrower.name}</TableCell>
                        <TableCell>{format(parseISO(loan.loanDate), 'dd/MM/yyyy')}</TableCell>
                        <TableCell>
                          {loan.returnDate && format(parseISO(loan.returnDate), 'dd/MM/yyyy')}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
