import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Participant, Loan, BookResume, Book, SchoolClass, useLibraryStore } from '@/hooks/useLibraryStore';
import { getAgeRangeLabel, ageRangeColors } from '@/lib/ageRanges';
import { User, BookOpen, FileText, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ParticipantJournalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participant: Participant | null;
}

export function ParticipantJournalDialog({ open, onOpenChange, participant }: ParticipantJournalDialogProps) {
  const { books, loans, bookResumes, classes } = useLibraryStore();

  if (!participant) return null;

  const participantClass = classes.find(c => c.id === participant.classId);
  
  // Get loans for this participant
  const participantLoans = loans.filter(l => l.participantId === participant.id);
  const activeLoans = participantLoans.filter(l => l.status === 'active' || l.status === 'overdue');
  const returnedLoans = participantLoans.filter(l => l.status === 'returned');
  
  // Get resumes for this participant (matching by participantNumber)
  const participantResumes = bookResumes.filter(r => 
    r.participantNumber === participant.participantNumber
  );

  const getBookTitle = (bookId: string) => {
    const book = books.find(b => b.id === bookId);
    return book?.title || 'Livre inconnu';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-primary/10 text-primary border-primary/20">En cours</Badge>;
      case 'overdue':
        return <Badge variant="destructive">En retard</Badge>;
      case 'returned':
        return <Badge variant="secondary">Retourné</Badge>;
      case 'generated':
        return <Badge variant="outline">Générée</Badge>;
      case 'submitted':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Soumise</Badge>;
      case 'reviewed':
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Révisée</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Journal de {participant.firstName} {participant.lastName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Infos</TabsTrigger>
            <TabsTrigger value="loans">
              Prêts ({participantLoans.length})
            </TabsTrigger>
            <TabsTrigger value="resumes">
              Résumés ({participantResumes.length})
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4">
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informations personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Numéro</p>
                      <p className="font-mono">{participant.participantNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Sexe</p>
                      <p>{participant.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Âge</p>
                      <div className="flex items-center gap-2">
                        <span>{participant.age} ans</span>
                        <Badge 
                          variant="outline"
                          style={{ 
                            borderColor: ageRangeColors[participant.ageRange],
                            color: ageRangeColors[participant.ageRange]
                          }}
                        >
                          {getAgeRangeLabel(participant.ageRange)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Classe</p>
                      <p>{participantClass?.name || 'Non assignée'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Inscrit le</p>
                      <p>{format(new Date(participant.createdAt), 'dd MMMM yyyy', { locale: fr })}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Moniteur</p>
                      <p>{participantClass?.monitorName || '-'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Statistiques</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">{participantLoans.length}</p>
                      <p className="text-sm text-muted-foreground">Prêts totaux</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">{activeLoans.length}</p>
                      <p className="text-sm text-muted-foreground">Prêts actifs</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">{participantResumes.length}</p>
                      <p className="text-sm text-muted-foreground">Fiches</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loans" className="space-y-3">
              {participantLoans.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucun prêt enregistré</p>
                </div>
              ) : (
                <>
                  {activeLoans.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Prêts en cours</h4>
                      {activeLoans.map((loan) => (
                        <Card key={loan.id} className="p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{getBookTitle(loan.bookId)}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3" />
                                Emprunté le {format(new Date(loan.loanDate), 'dd/MM/yyyy')}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Retour prévu le {format(new Date(loan.dueDate), 'dd/MM/yyyy')}
                              </div>
                            </div>
                            {getStatusBadge(loan.status)}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                  
                  {returnedLoans.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">Historique</h4>
                      {returnedLoans.map((loan) => (
                        <Card key={loan.id} className="p-3 opacity-75">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{getBookTitle(loan.bookId)}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(loan.loanDate), 'dd/MM/yyyy')} → {loan.returnDate && format(new Date(loan.returnDate), 'dd/MM/yyyy')}
                              </div>
                            </div>
                            {getStatusBadge(loan.status)}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="resumes" className="space-y-3">
              {participantResumes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aucune fiche de résumé</p>
                </div>
              ) : (
                participantResumes.map((resume) => (
                  <Card key={resume.id} className="p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{getBookTitle(resume.bookId)}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(resume.date), 'dd MMMM yyyy', { locale: fr })}
                        </div>
                        {resume.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span 
                                key={star} 
                                className={star <= resume.rating! ? 'text-yellow-500' : 'text-muted'}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {getStatusBadge(resume.status)}
                    </div>
                    {resume.summary && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {resume.summary}
                      </p>
                    )}
                  </Card>
                ))
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
