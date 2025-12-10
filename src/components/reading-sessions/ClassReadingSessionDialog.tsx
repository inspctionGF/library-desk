import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CalendarIcon, Users, BookOpen, Search } from 'lucide-react';
import { useLibraryStore, ReadingType, ClassSessionType } from '@/hooks/useLibraryStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ClassReadingSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
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

interface ParticipantEntry {
  participantId: string;
  bookId: string;
  readingType: ReadingType;
  isPresent: boolean;
}

export function ClassReadingSessionDialog({ open, onOpenChange, onSuccess }: ClassReadingSessionDialogProps) {
  const { 
    classes, 
    participants, 
    books, 
    getParticipantsByClass,
    addBulkClassSession,
    addDetailedClassSession,
  } = useLibraryStore();

  const [classId, setClassId] = useState('');
  const [sessionType, setSessionType] = useState<ClassSessionType>('bulk');
  const [sessionDate, setSessionDate] = useState<Date | undefined>(new Date());
  const [attendeeCount, setAttendeeCount] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [participantEntries, setParticipantEntries] = useState<ParticipantEntry[]>([]);
  const [bookSearch, setBookSearch] = useState('');

  // Get participants for selected class
  const classParticipants = useMemo(() => {
    if (!classId) return [];
    return getParticipantsByClass(classId);
  }, [classId, getParticipantsByClass]);

  // Max attendees is the number of participants in the class
  const maxAttendees = classParticipants.length;

  // Filter books by search
  const filteredBooks = useMemo(() => {
    if (!bookSearch) return books;
    return books.filter(b => 
      b.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(bookSearch.toLowerCase())
    );
  }, [books, bookSearch]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setClassId('');
      setSessionType('bulk');
      setSessionDate(new Date());
      setAttendeeCount(0);
      setNotes('');
      setParticipantEntries([]);
      setBookSearch('');
    }
  }, [open]);

  // Initialize participant entries when class changes
  useEffect(() => {
    if (classId) {
      const entries = classParticipants.map(p => ({
        participantId: p.id,
        bookId: '',
        readingType: 'normal' as ReadingType,
        isPresent: false,
      }));
      setParticipantEntries(entries);
      setAttendeeCount(0);
    }
  }, [classId, classParticipants]);

  // Calculate attendee count from selected participants in detailed mode
  const calculatedAttendeeCount = useMemo(() => {
    return participantEntries.filter(e => e.isPresent && e.bookId).length;
  }, [participantEntries]);

  const handleParticipantChange = (participantId: string, field: keyof ParticipantEntry, value: any) => {
    setParticipantEntries(prev => 
      prev.map(e => 
        e.participantId === participantId 
          ? { ...e, [field]: value }
          : e
      )
    );
  };

  const handleSubmit = () => {
    if (!classId || !sessionDate) return;

    const dateStr = format(sessionDate, 'yyyy-MM-dd');

    if (sessionType === 'bulk') {
      if (attendeeCount <= 0) return;
      addBulkClassSession(classId, dateStr, attendeeCount, notes || undefined);
    } else {
      const validEntries = participantEntries
        .filter(e => e.isPresent && e.bookId)
        .map(e => ({
          participantId: e.participantId,
          bookId: e.bookId,
          readingType: e.readingType,
        }));
      
      if (validEntries.length === 0) return;
      addDetailedClassSession(classId, dateStr, validEntries, notes || undefined);
    }

    onSuccess();
    onOpenChange(false);
  };

  const selectedClass = classes.find(c => c.id === classId);
  const canSubmit = classId && sessionDate && (
    (sessionType === 'bulk' && attendeeCount > 0 && attendeeCount <= maxAttendees) ||
    (sessionType === 'detailed' && calculatedAttendeeCount > 0)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Session de lecture de classe
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          {/* Class Selection */}
          <div className="space-y-2">
            <Label>Classe</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      <span>{c.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {getParticipantsByClass(c.id).length} participants
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClass && (
              <p className="text-sm text-muted-foreground">
                Moniteur: {selectedClass.monitorName} • Tranche d'âge: {selectedClass.ageRange} ans
              </p>
            )}
          </div>

          {classId && (
            <>
              {/* Session Type */}
              <div className="space-y-3">
                <Label>Méthode d'enregistrement</Label>
                <RadioGroup 
                  value={sessionType} 
                  onValueChange={(v) => setSessionType(v as ClassSessionType)}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="bulk" id="bulk" />
                    <Label htmlFor="bulk" className="cursor-pointer">
                      <div>
                        <p className="font-medium">Enregistrement rapide</p>
                        <p className="text-xs text-muted-foreground">Nombre de présents uniquement</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="detailed" id="detailed" />
                    <Label htmlFor="detailed" className="cursor-pointer">
                      <div>
                        <p className="font-medium">Enregistrement détaillé</p>
                        <p className="text-xs text-muted-foreground">Livre lu par chaque participant</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label>Date de la session</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !sessionDate && "text-muted-foreground")}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {sessionDate ? format(sessionDate, 'PPP', { locale: fr }) : 'Choisir une date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={sessionDate}
                      onSelect={setSessionDate}
                      locale={fr}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Bulk Mode */}
              {sessionType === 'bulk' && (
                <div className="space-y-2">
                  <Label>Nombre de présents</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      max={maxAttendees}
                      value={attendeeCount}
                      onChange={(e) => setAttendeeCount(Math.min(Number(e.target.value), maxAttendees))}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">/ {maxAttendees} max</span>
                  </div>
                </div>
              )}

              {/* Detailed Mode */}
              {sessionType === 'detailed' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Participants ({calculatedAttendeeCount}/{maxAttendees} présents)</Label>
                  </div>
                  
                  <ScrollArea className="h-[280px] border rounded-md p-3">
                    <div className="space-y-3">
                      {classParticipants.map((participant) => {
                        const entry = participantEntries.find(e => e.participantId === participant.id);
                        if (!entry) return null;

                        return (
                          <div 
                            key={participant.id} 
                            className={cn(
                              "p-3 border rounded-lg space-y-2 transition-colors",
                              entry.isPresent ? "bg-muted/50 border-primary/30" : "opacity-60"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                id={`present-${participant.id}`}
                                checked={entry.isPresent}
                                onCheckedChange={(checked) => 
                                  handleParticipantChange(participant.id, 'isPresent', checked)
                                }
                              />
                              <Label 
                                htmlFor={`present-${participant.id}`}
                                className="flex-1 cursor-pointer"
                              >
                                <span className="font-medium">{participant.firstName} {participant.lastName}</span>
                                <span className="text-xs text-muted-foreground ml-2 font-mono">
                                  {participant.participantNumber}
                                </span>
                              </Label>
                            </div>

                            {entry.isPresent && (
                              <div className="grid grid-cols-2 gap-2 pl-6">
                                <Select
                                  value={entry.bookId}
                                  onValueChange={(v) => handleParticipantChange(participant.id, 'bookId', v)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Livre lu" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[200px]">
                                    {books.map((book) => (
                                      <SelectItem key={book.id} value={book.id} className="text-xs">
                                        <div className="flex items-center gap-2">
                                          <BookOpen className="h-3 w-3 flex-shrink-0" />
                                          <span className="truncate">{book.title}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>

                                <Select
                                  value={entry.readingType}
                                  onValueChange={(v) => handleParticipantChange(participant.id, 'readingType', v as ReadingType)}
                                >
                                  <SelectTrigger className="h-8 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {(['normal', 'assignment', 'research'] as ReadingType[]).map((type) => (
                                      <SelectItem key={type} value={type} className="text-xs">
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
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes (optionnel)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes sur cette session..."
                  rows={2}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}