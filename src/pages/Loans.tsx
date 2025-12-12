import { useState, useMemo } from 'react';
import { format, addDays, isBefore, parseISO, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BookOpen, RotateCcw, AlertTriangle, Clock, User, Calendar, Eye, EyeOff, RefreshCw, CheckCircle, Flag } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuditedLibraryStore } from '@/hooks/useAuditedLibraryStore';
import { Loan } from '@/hooks/useLibraryStore';
import { usePagination } from '@/hooks/usePagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { LoanFormDialog } from '@/components/loans/LoanFormDialog';
import { ReturnLoanDialog } from '@/components/loans/ReturnLoanDialog';
import { RenewLoanDialog } from '@/components/loans/RenewLoanDialog';
import { BookIssueFormDialog } from '@/components/book-issues/BookIssueFormDialog';
import { StatCard } from '@/components/dashboard/StatCard';
import { useInitialLoading } from '@/hooks/useLoadingState';
import { TabsPageSkeleton } from '@/components/skeletons';

export default function Loans() {
  const { loans, books, participants, getBookById, getParticipantById, getLoanStats, getActiveLoansForParticipant } = useAuditedLibraryStore();
  const isLoading = useInitialLoading(400);

  if (isLoading) {
    return (
      <AdminLayout>
        <TabsPageSkeleton />
      </AdminLayout>
    );
  }
  const [showStats, setShowStats] = useState(true);
  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [issuePrefilledData, setIssuePrefilledData] = useState<{
    bookId?: string;
    issueType?: 'not_returned';
    borrowerName?: string;
    loanId?: string;
    notes?: string;
  } | undefined>(undefined);

  const stats = getLoanStats();
  const today = new Date().toISOString().split('T')[0];

  // Categorize loans
  const overdueLoans = useMemo(() => 
    loans.filter(l => l.status !== 'returned' && l.dueDate < today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [loans, today]
  );

  const activeLoans = useMemo(() => 
    loans.filter(l => (l.status === 'active' || l.status === 'overdue') && l.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [loans, today]
  );

  const returnedLoans = useMemo(() => 
    loans.filter(l => l.status === 'returned')
      .sort((a, b) => (b.returnDate || '').localeCompare(a.returnDate || '')),
    [loans]
  );

  const getLoanStatusBadge = (loan: typeof loans[0]) => {
    if (loan.status === 'returned') {
      return <Badge variant="secondary">Retourné</Badge>;
    }
    
    const daysUntilDue = differenceInDays(parseISO(loan.dueDate), new Date());
    
    if (daysUntilDue < 0) {
      return <Badge variant="destructive">En retard ({Math.abs(daysUntilDue)}j)</Badge>;
    }
    if (daysUntilDue <= 3) {
      return <Badge className="bg-orange-500 hover:bg-orange-600">Échéance proche ({daysUntilDue}j)</Badge>;
    }
    return <Badge className="bg-teal-500 hover:bg-teal-600">Actif</Badge>;
  };

  const handleReturn = (loanId: string) => {
    setSelectedLoan(loanId);
    setReturnDialogOpen(true);
  };

  const handleRenew = (loanId: string) => {
    setSelectedLoan(loanId);
    setRenewDialogOpen(true);
  };

  const handleReportIssue = (loan: Loan) => {
    const book = getBookById(loan.bookId);
    const participant = getParticipantById(loan.participantId);
    const borrowerName = participant 
      ? `${participant.firstName} ${participant.lastName}`
      : loan.participantName;
    
    setIssuePrefilledData({
      bookId: loan.bookId,
      issueType: 'not_returned',
      borrowerName,
      loanId: loan.id,
      notes: `Prêt du ${format(parseISO(loan.loanDate), 'dd/MM/yyyy')} - Retour prévu le ${format(parseISO(loan.dueDate), 'dd/MM/yyyy')}`,
    });
    setIssueDialogOpen(true);
  };

  // Pagination for each section
  const overduePagination = usePagination({ data: overdueLoans, itemsPerPage: 10 });
  const activePagination = usePagination({ data: activeLoans, itemsPerPage: 10 });
  const returnedPagination = usePagination({ data: returnedLoans, itemsPerPage: 10 });

  const LoanTable = ({ 
    loanList, 
    showActions = true,
    showReportButton = false,
    pagination
  }: { 
    loanList: typeof loans; 
    showActions?: boolean;
    showReportButton?: boolean;
    pagination?: ReturnType<typeof usePagination<typeof loans[0]>>;
  }) => (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Livre</TableHead>
            <TableHead>Participant</TableHead>
            <TableHead>Date prêt</TableHead>
            <TableHead>Date retour prévue</TableHead>
            <TableHead>Statut</TableHead>
            {showActions && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loanList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showActions ? 6 : 5} className="text-center text-muted-foreground py-8">
                Aucun prêt trouvé
              </TableCell>
            </TableRow>
          ) : (
            loanList.map(loan => {
              const book = getBookById(loan.bookId);
              const participant = getParticipantById(loan.participantId);
              return (
                <TableRow key={loan.id}>
                  <TableCell className="font-medium">{book?.title || 'Livre inconnu'}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{participant ? `${participant.firstName} ${participant.lastName}` : loan.participantName}</span>
                      <span className="text-xs text-muted-foreground">{participant?.participantNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell>{format(parseISO(loan.loanDate), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    {format(parseISO(loan.dueDate), 'dd/MM/yyyy')}
                    {loan.status === 'returned' && loan.returnDate && (
                      <div className="text-xs text-muted-foreground">
                        Retourné le {format(parseISO(loan.returnDate), 'dd/MM/yyyy')}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getLoanStatusBadge(loan)}</TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      {loan.status !== 'returned' && (
                        <div className="flex gap-2 justify-end">
                          {showReportButton && (
                            <Button size="sm" variant="destructive" onClick={() => handleReportIssue(loan)}>
                              <Flag className="h-4 w-4 mr-1" />
                              Signaler
                            </Button>
                          )}
                          <Button size="sm" variant="outline" onClick={() => handleRenew(loan.id)}>
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Renouveler
                          </Button>
                          <Button size="sm" onClick={() => handleReturn(loan.id)}>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Récupérer
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
      {pagination && pagination.totalItems > 0 && (
        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          startIndex={pagination.startIndex}
          endIndex={pagination.endIndex}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.goToPage}
          onItemsPerPageChange={pagination.setItemsPerPage}
        />
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Prêts</h1>
            <p className="text-muted-foreground">Gérez les emprunts et retours de livres</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowStats(!showStats)}>
            {showStats ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showStats ? 'Masquer stats' : 'Afficher stats'}
          </Button>
        </div>

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              title="Prêts actifs"
              value={stats.activeLoans}
              icon={<BookOpen className="h-4 w-4" />}
            />
            <StatCard
              title="En retard"
              value={stats.overdueLoans}
              icon={<AlertTriangle className="h-4 w-4" />}
            />
            <StatCard
              title="Retours ce mois"
              value={stats.returnsThisMonth}
              icon={<RotateCcw className="h-4 w-4" />}
            />
            <StatCard
              title="Plus actif"
              value={stats.mostActiveParticipant ? `${stats.mostActiveParticipant.firstName} ${stats.mostActiveParticipant.lastName.charAt(0)}.` : 'N/A'}
              icon={<User className="h-4 w-4" />}
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="loan" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="loan" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Prêt
            </TabsTrigger>
            <TabsTrigger value="return" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Retour
            </TabsTrigger>
          </TabsList>

          {/* Loan Tab */}
          <TabsContent value="loan" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Nouveau prêt</CardTitle>
                <Button onClick={() => setLoanDialogOpen(true)}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Créer un prêt
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Sélectionnez un participant et un livre pour enregistrer un nouveau prêt. 
                  Chaque participant peut avoir au maximum 3 prêts actifs.
                </p>
                
                {/* Recent active loans */}
                <div className="mt-6">
                  <h3 className="font-semibold mb-4">Prêts actifs récents</h3>
                  <LoanTable loanList={activePagination.paginatedData} pagination={activePagination} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Return Tab */}
          <TabsContent value="return" className="space-y-4">
            {/* Overdue Section */}
            {overdueLoans.length > 0 && (
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Livres en retard ({overdueLoans.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LoanTable loanList={overduePagination.paginatedData} showReportButton={true} pagination={overduePagination} />
                </CardContent>
              </Card>
            )}

            {/* Active Loans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Prêts actifs ({activeLoans.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LoanTable loanList={activePagination.paginatedData} pagination={activePagination} />
              </CardContent>
            </Card>

            {/* Returned History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Historique des retours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LoanTable loanList={returnedPagination.paginatedData} showActions={false} pagination={returnedPagination} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <LoanFormDialog open={loanDialogOpen} onOpenChange={setLoanDialogOpen} />
      <ReturnLoanDialog 
        open={returnDialogOpen} 
        onOpenChange={setReturnDialogOpen} 
        loanId={selectedLoan}
      />
      <RenewLoanDialog 
        open={renewDialogOpen} 
        onOpenChange={setRenewDialogOpen} 
        loanId={selectedLoan}
      />
      <BookIssueFormDialog 
        open={issueDialogOpen} 
        onOpenChange={(open) => {
          setIssueDialogOpen(open);
          if (!open) setIssuePrefilledData(undefined);
        }}
        prefilledData={issuePrefilledData}
      />
    </AdminLayout>
  );
}
