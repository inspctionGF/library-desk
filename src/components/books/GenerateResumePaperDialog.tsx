import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CalendarIcon, Printer, FileText, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { BookResumePaper } from './BookResumePaper';
import type { Book, Category, BookResume } from '@/hooks/useLibraryStore';
import { useSystemConfig } from '@/hooks/useSystemConfig';

interface GenerateResumePaperDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  books: Book[];
  categories: Category[];
  preselectedBook?: Book;
  onGenerate: (resume: Omit<BookResume, 'id' | 'createdAt'>) => void;
}

export function GenerateResumePaperDialog({
  open,
  onOpenChange,
  books,
  categories,
  preselectedBook,
  onGenerate,
}: GenerateResumePaperDialogProps) {
  const { config } = useSystemConfig();
  const printRef = useRef<HTMLDivElement>(null);

  const [participantSuffix, setParticipantSuffix] = useState('');
  const [selectedBookId, setSelectedBookId] = useState(preselectedBook?.id || '');
  const [date, setDate] = useState<Date>(new Date());
  const [bookSearch, setBookSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const cdejNumber = config.cdejNumber || '0000';
  const cdejPrefix = cdejNumber.startsWith('HA-') ? cdejNumber : `HA-${cdejNumber}`;
  const participantNumber = `${cdejPrefix}-${participantSuffix.padStart(5, '0')}`;

  const selectedBook = books.find(b => b.id === selectedBookId);
  const selectedCategory = selectedBook ? categories.find(c => c.id === selectedBook.categoryId) : undefined;

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const isValid = participantSuffix.length > 0 && selectedBookId;

  const handleGenerate = () => {
    if (!selectedBook || !isValid) return;

    const resume: Omit<BookResume, 'id' | 'createdAt'> = {
      participantNumber,
      bookId: selectedBook.id,
      date: date.toISOString().split('T')[0],
      status: 'generated',
    };

    onGenerate(resume);
    setShowPreview(true);
  };

  const handlePrint = () => {
    if (!printRef.current) return;

    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fiche de Résumé - ${selectedBook?.title}</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { margin: 0; font-family: system-ui, -apple-system, sans-serif; }
            .book-resume-paper { page-break-inside: avoid; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleClose = () => {
    setShowPreview(false);
    setParticipantSuffix('');
    setSelectedBookId(preselectedBook?.id || '');
    setDate(new Date());
    setBookSearch('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Générer une Fiche de Résumé
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex gap-6">
          {/* Form Section */}
          <div className="w-80 flex-shrink-0 space-y-4">
            {/* Participant Number */}
            <div className="space-y-2">
              <Label>Numéro du participant</Label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground font-mono bg-muted px-2 py-2 rounded-l-md border border-r-0 border-input">
                  {cdejPrefix}-
                </span>
                <Input
                  placeholder="00256"
                  value={participantSuffix}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                    setParticipantSuffix(value);
                  }}
                  className="rounded-l-none font-mono w-24"
                  maxLength={5}
                />
              </div>
              {participantSuffix && (
                <p className="text-xs text-muted-foreground">
                  Numéro complet : <span className="font-mono font-medium">{participantNumber}</span>
                </p>
              )}
            </div>

            {/* Book Selection */}
            <div className="space-y-2">
              <Label>Livre</Label>
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un livre..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un livre" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-48">
                    {filteredBooks.map((book) => (
                      <SelectItem key={book.id} value={book.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{book.title}</span>
                          <span className="text-xs text-muted-foreground">{book.author}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Actions */}
            <div className="pt-4 space-y-2">
              {!showPreview ? (
                <Button onClick={handleGenerate} disabled={!isValid} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Générer et enregistrer
                </Button>
              ) : (
                <Button onClick={handlePrint} className="w-full">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </Button>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div ref={printRef} className="p-4 bg-muted/30 rounded-lg">
                {selectedBook && showPreview ? (
                  <BookResumePaper
                    book={selectedBook}
                    category={selectedCategory}
                    participantNumber={participantNumber}
                    date={date}
                    config={{
                      churchName: config.churchName || 'Bibliothèque',
                      cdejNumber: config.cdejNumber || '0000',
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-96 text-muted-foreground">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Remplissez le formulaire et cliquez sur "Générer" pour voir l'aperçu</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
