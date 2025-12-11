import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookCopy, BookOpen } from 'lucide-react';
import { OtherReader, useLibraryStore } from '@/hooks/useLibraryStore';

interface OtherReaderJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reader: OtherReader | null;
}

const readerTypeLabels: Record<string, string> = {
  parent: 'Parent',
  instructor: 'Instructeur',
  staff: 'Personnel',
  other: 'Autre',
};

export function OtherReaderJournalDialog({ open, onOpenChange, reader }: OtherReaderJournalDialogProps) {
  const { loans, getBookById } = useLibraryStore();

  if (!reader) return null;

  // Get loans for this reader
  const readerLoans = loans.filter(l => 
    l.borrowerType === 'other_reader' && l.borrowerId === reader.id
  );
  const activeLoans = readerLoans.filter(l => l.status === 'active' || l.status === 'overdue');
  const returnedLoans = readerLoans.filter(l => l.status === 'returned');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Journal de {reader.firstName} {reader.lastName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Reader Info */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Numéro:</span>
                  <span className="ml-2 font-mono">{reader.readerNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="ml-2">
                    {readerTypeLabels[reader.readerType]}
                  </Badge>
                </div>
                {reader.phone && (
                  <div>
                    <span className="text-muted-foreground">Téléphone:</span>
                    <span className="ml-2">{reader.phone}</span>
                  </div>
                )}
                {reader.email && (
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2">{reader.email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{readerLoans.length}</div>
                <div className="text-sm text-muted-foreground">Total prêts</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-primary">{activeLoans.length}</div>
                <div className="text-sm text-muted-foreground">Prêts actifs</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-green-600">{returnedLoans.length}</div>
                <div className="text-sm text-muted-foreground">Retournés</div>
              </CardContent>
            </Card>
          </div>

          {/* Loans History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookCopy className="h-4 w-4" />
                Historique des prêts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {readerLoans.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Aucun prêt enregistré
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Livre</TableHead>
                      <TableHead>Date prêt</TableHead>
                      <TableHead>Échéance</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readerLoans.map(loan => {
                      const book = getBookById(loan.bookId);
                      return (
                        <TableRow key={loan.id}>
                          <TableCell className="font-medium">
                            {book?.title || 'Livre inconnu'}
                          </TableCell>
                          <TableCell>
                            {new Date(loan.loanDate).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                loan.status === 'returned' ? 'secondary' :
                                loan.status === 'overdue' ? 'destructive' : 'default'
                              }
                            >
                              {loan.status === 'returned' ? 'Retourné' :
                               loan.status === 'overdue' ? 'En retard' : 'Actif'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
