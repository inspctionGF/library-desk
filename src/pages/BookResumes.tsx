import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileText, Search, Filter, Eye, Trash2, CheckCircle, Clock, Plus } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useLibraryStore, BookResume } from '@/hooks/useLibraryStore';
import { useToast } from '@/hooks/use-toast';
import { GenerateResumePaperDialog } from '@/components/books/GenerateResumePaperDialog';
import { cn } from '@/lib/utils';

export default function BookResumes() {
  const { 
    books, 
    categories, 
    bookResumes, 
    addBookResume, 
    updateBookResume, 
    deleteBookResume,
    getBookById,
    getCategoryById 
  } = useLibraryStore();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState<BookResume | null>(null);
  
  // Archive form state
  const [archiveSummary, setArchiveSummary] = useState('');
  const [archiveWhatLearned, setArchiveWhatLearned] = useState('');
  const [archiveRating, setArchiveRating] = useState<number>(0);

  const filteredResumes = useMemo(() => {
    return bookResumes.filter((resume) => {
      const book = getBookById(resume.bookId);
      const matchesSearch = 
        resume.participantNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book?.title.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesStatus = statusFilter === 'all' || resume.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookResumes, searchQuery, statusFilter, getBookById]);

  const getStatusBadge = (status: BookResume['status']) => {
    switch (status) {
      case 'generated':
        return <Badge variant="outline" className="bg-muted text-muted-foreground"><Clock className="h-3 w-3 mr-1" />Générée</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-primary/10 text-primary"><FileText className="h-3 w-3 mr-1" />Soumise</Badge>;
      case 'reviewed':
        return <Badge variant="outline" className="bg-success/10 text-success"><CheckCircle className="h-3 w-3 mr-1" />Révisée</Badge>;
    }
  };

  const handleGenerate = (resumeData: Omit<BookResume, 'id' | 'createdAt'>) => {
    addBookResume(resumeData);
    toast({
      title: 'Fiche générée',
      description: 'La fiche de résumé a été enregistrée.',
    });
  };

  const handleViewResume = (resume: BookResume) => {
    setSelectedResume(resume);
    setArchiveSummary(resume.summary || '');
    setArchiveWhatLearned(resume.whatILearned || '');
    setArchiveRating(resume.rating || 0);
    setViewDialogOpen(true);
  };

  const handleArchive = () => {
    if (!selectedResume) return;
    
    updateBookResume(selectedResume.id, {
      summary: archiveSummary,
      whatILearned: archiveWhatLearned,
      rating: archiveRating,
      status: archiveSummary || archiveWhatLearned ? 'submitted' : selectedResume.status,
      submittedAt: archiveSummary || archiveWhatLearned ? new Date().toISOString() : undefined,
    });
    
    toast({
      title: 'Fiche mise à jour',
      description: 'Le contenu a été archivé.',
    });
    setViewDialogOpen(false);
  };

  const handleMarkReviewed = () => {
    if (!selectedResume) return;
    
    updateBookResume(selectedResume.id, {
      status: 'reviewed',
      reviewedAt: new Date().toISOString(),
    });
    
    toast({
      title: 'Fiche révisée',
      description: 'La fiche a été marquée comme révisée.',
    });
    setViewDialogOpen(false);
  };

  const handleDeleteResume = (resume: BookResume) => {
    setSelectedResume(resume);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedResume) return;
    
    deleteBookResume(selectedResume.id);
    toast({
      title: 'Fiche supprimée',
      description: 'La fiche de résumé a été supprimée.',
    });
    setDeleteDialogOpen(false);
    setSelectedResume(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Fiches de Résumé</h1>
            <p className="text-sm text-muted-foreground">
              {bookResumes.length} fiche{bookResumes.length > 1 ? 's' : ''} au total
            </p>
          </div>
          <Button onClick={() => setGenerateDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle fiche
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tous les statuts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="generated">Générée</SelectItem>
              <SelectItem value="submitted">Soumise</SelectItem>
              <SelectItem value="reviewed">Révisée</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 pl-9 bg-card border-border"
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-medium text-muted-foreground">Participant</TableHead>
                <TableHead className="font-medium text-muted-foreground">Livre</TableHead>
                <TableHead className="font-medium text-muted-foreground">Date</TableHead>
                <TableHead className="font-medium text-muted-foreground">Statut</TableHead>
                <TableHead className="font-medium text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResumes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune fiche de résumé</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredResumes.map((resume) => {
                  const book = getBookById(resume.bookId);
                  const category = book ? getCategoryById(book.categoryId) : undefined;

                  return (
                    <TableRow key={resume.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-sm">{resume.participantNumber}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{book?.title || 'Livre inconnu'}</span>
                          {category && (
                            <span className="text-xs" style={{ color: category.color }}>
                              {category.name}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(resume.date), 'dd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell>{getStatusBadge(resume.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleViewResume(resume)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteResume(resume)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Generate Dialog */}
      <GenerateResumePaperDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        books={books}
        categories={categories}
        onGenerate={handleGenerate}
      />

      {/* View/Archive Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de la fiche</DialogTitle>
          </DialogHeader>
          
          {selectedResume && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Participant</Label>
                  <p className="font-mono font-medium">{selectedResume.participantNumber}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p>{format(new Date(selectedResume.date), 'dd MMMM yyyy', { locale: fr })}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Livre</Label>
                  <p className="font-medium">{getBookById(selectedResume.bookId)?.title}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Résumé (archivage numérique)</Label>
                  <Textarea
                    value={archiveSummary}
                    onChange={(e) => setArchiveSummary(e.target.value)}
                    placeholder="Saisir le résumé écrit par le participant..."
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Ce qu'il/elle a appris</Label>
                  <Textarea
                    value={archiveWhatLearned}
                    onChange={(e) => setArchiveWhatLearned(e.target.value)}
                    placeholder="Saisir ce que le participant a appris..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Note ({archiveRating}/5)</Label>
                  <div className="flex gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setArchiveRating(star)}
                        className={cn(
                          "h-8 w-8 rounded transition-colors",
                          star <= archiveRating 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            {selectedResume?.status !== 'reviewed' && (
              <Button variant="outline" onClick={handleMarkReviewed}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marquer révisée
              </Button>
            )}
            <Button onClick={handleArchive}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la fiche ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La fiche de résumé sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
