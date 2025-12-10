import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { CalendarIcon, Search } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ReadingSession, ReadingType, useLibraryStore } from '@/hooks/useLibraryStore';

interface ReadingSessionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session?: ReadingSession | null;
  onSubmit: (data: { participantId: string; bookId: string; sessionDate: string; readingType: ReadingType; notes?: string }) => void;
}

const readingTypeLabels: Record<ReadingType, string> = {
  assignment: 'Devoir',
  research: 'Recherche',
  normal: 'Lecture normale',
};

const readingTypeColors: Record<ReadingType, string> = {
  assignment: 'hsl(25, 95%, 53%)',
  research: 'hsl(174, 72%, 40%)',
  normal: 'hsl(262, 83%, 58%)',
};

export function ReadingSessionFormDialog({ open, onOpenChange, session, onSubmit }: ReadingSessionFormDialogProps) {
  const { participants, books } = useLibraryStore();
  
  const [participantId, setParticipantId] = useState('');
  const [bookId, setBookId] = useState('');
  const [sessionDate, setSessionDate] = useState<Date>(new Date());
  const [readingType, setReadingType] = useState<ReadingType>('normal');
  const [notes, setNotes] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  useEffect(() => {
    if (session) {
      setParticipantId(session.participantId);
      setBookId(session.bookId);
      setSessionDate(new Date(session.sessionDate));
      setReadingType(session.readingType);
      setNotes(session.notes || '');
    } else {
      setParticipantId('');
      setBookId('');
      setSessionDate(new Date());
      setReadingType('normal');
      setNotes('');
    }
    setParticipantSearch('');
    setBookSearch('');
  }, [session, open]);

  const filteredParticipants = participants.filter(p =>
    `${p.firstName} ${p.lastName} ${p.participantNumber}`.toLowerCase().includes(participantSearch.toLowerCase())
  );

  const filteredBooks = books.filter(b =>
    `${b.title} ${b.author}`.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId || !bookId) return;
    
    onSubmit({
      participantId,
      bookId,
      sessionDate: sessionDate.toISOString().split('T')[0],
      readingType,
      notes: notes || undefined,
    });
    onOpenChange(false);
  };

  const selectedParticipant = participants.find(p => p.id === participantId);
  const selectedBook = books.find(b => b.id === bookId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {session ? 'Modifier la session' : 'Nouvelle session de lecture'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Participant *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {selectedParticipant 
                    ? `${selectedParticipant.firstName} ${selectedParticipant.lastName} (${selectedParticipant.participantNumber})`
                    : 'Sélectionner un participant...'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un participant..."
                      value={participantSearch}
                      onChange={(e) => setParticipantSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1">
                  {filteredParticipants.map((p) => (
                    <Button
                      key={p.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start font-normal",
                        participantId === p.id && "bg-accent"
                      )}
                      onClick={() => {
                        setParticipantId(p.id);
                        setParticipantSearch('');
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span>{p.firstName} {p.lastName}</span>
                        <span className="text-xs text-muted-foreground font-mono">{p.participantNumber}</span>
                      </div>
                    </Button>
                  ))}
                  {filteredParticipants.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun participant trouvé</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Livre *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  {selectedBook 
                    ? `${selectedBook.title} - ${selectedBook.author}`
                    : 'Sélectionner un livre...'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un livre..."
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div className="max-h-[200px] overflow-y-auto p-1">
                  {filteredBooks.map((b) => (
                    <Button
                      key={b.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start font-normal",
                        bookId === b.id && "bg-accent"
                      )}
                      onClick={() => {
                        setBookId(b.id);
                        setBookSearch('');
                      }}
                    >
                      <div className="flex flex-col items-start">
                        <span>{b.title}</span>
                        <span className="text-xs text-muted-foreground">{b.author}</span>
                      </div>
                    </Button>
                  ))}
                  {filteredBooks.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucun livre trouvé</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(sessionDate, 'PPP', { locale: fr })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={sessionDate}
                    onSelect={(date) => date && setSessionDate(date)}
                    initialFocus
                    locale={fr}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Type de lecture *</Label>
              <Select value={readingType} onValueChange={(v) => setReadingType(v as ReadingType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['normal', 'assignment', 'research'] as ReadingType[]).map((type) => (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="h-2 w-2 rounded-full" 
                          style={{ backgroundColor: readingTypeColors[type] }}
                        />
                        {readingTypeLabels[type]}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes (optionnel)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes sur la session de lecture..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={!participantId || !bookId}>
              {session ? 'Modifier' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
