import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Flag } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuditedLibraryStore } from '@/hooks/useAuditedLibraryStore';
import { Loan } from '@/hooks/useLibraryStore';
import { POSLoanInterface } from '@/components/loans/POSLoanInterface';
import { ReturnLoanDialog } from '@/components/loans/ReturnLoanDialog';
import { RenewLoanDialog } from '@/components/loans/RenewLoanDialog';
import { BookIssueFormDialog } from '@/components/book-issues/BookIssueFormDialog';
import { useInitialLoading } from '@/hooks/useLoadingState';
import { TabsPageSkeleton } from '@/components/skeletons';

export default function Loans() {
  const { getBookById, getParticipantById } = useAuditedLibraryStore();
  const isLoading = useInitialLoading(400);

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

  if (isLoading) {
    return (
      <AdminLayout>
        <TabsPageSkeleton />
      </AdminLayout>
    );
  }

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
    const participant = getParticipantById(loan.participantId || '');
    const borrowerName = participant 
      ? `${participant.firstName} ${participant.lastName}`
      : loan.participantName || loan.borrowerName || '';
    
    setIssuePrefilledData({
      bookId: loan.bookId,
      issueType: 'not_returned',
      borrowerName,
      loanId: loan.id,
      notes: `Prêt du ${format(parseISO(loan.loanDate), 'dd/MM/yyyy')} - Retour prévu le ${format(parseISO(loan.dueDate), 'dd/MM/yyyy')}`,
    });
    setIssueDialogOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Gestion des Prêts</h1>
          <p className="text-muted-foreground">Gérez les emprunts et retours de livres</p>
        </div>

        {/* POS Interface */}
        <POSLoanInterface
          onReturnDialogOpen={handleReturn}
          onRenewDialogOpen={handleRenew}
          onReportIssue={handleReportIssue}
        />
      </div>

      {/* Dialogs */}
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
