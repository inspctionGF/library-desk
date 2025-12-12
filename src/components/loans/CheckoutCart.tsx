import { useState, useMemo } from 'react';
import { format, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, X, Calendar, ShoppingCart, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Book, Participant, OtherReader, BorrowerType } from '@/hooks/useLibraryStore';
import { cn } from '@/lib/utils';

interface CheckoutCartProps {
  books: Book[];
  participants: Participant[];
  otherReaders: OtherReader[];
  selectedBooks: string[];
  selectedBorrower: { type: BorrowerType; id: string } | null;
  dueDate: Date;
  activeLoansCount: number;
  maxLoans: number;
  onRemoveBook: (bookId: string) => void;
  onClearCart: () => void;
  onSelectBorrower: (type: BorrowerType, id: string) => void;
  onDueDateChange: (date: Date) => void;
  onCheckout: () => void;
  getBookById: (id: string) => Book | undefined;
}

export function CheckoutCart({
  books,
  participants,
  otherReaders,
  selectedBooks,
  selectedBorrower,
  dueDate,
  activeLoansCount,
  maxLoans,
  onRemoveBook,
  onClearCart,
  onSelectBorrower,
  onDueDateChange,
  onCheckout,
  getBookById,
}: CheckoutCartProps) {
  const [borrowerSearchOpen, setBorrowerSearchOpen] = useState(false);
  const [borrowerType, setBorrowerType] = useState<BorrowerType>('participant');

  const selectedBorrowerInfo = useMemo(() => {
    if (!selectedBorrower) return null;
    
    if (selectedBorrower.type === 'participant') {
      const participant = participants.find(p => p.id === selectedBorrower.id);
      if (participant) {
        return {
          name: `${participant.firstName} ${participant.lastName}`,
          number: participant.participantNumber,
          initials: `${participant.firstName[0]}${participant.lastName[0]}`,
        };
      }
    } else {
      const reader = otherReaders.find(r => r.id === selectedBorrower.id);
      if (reader) {
        return {
          name: `${reader.firstName} ${reader.lastName}`,
          number: reader.readerNumber,
          initials: `${reader.firstName[0]}${reader.lastName[0]}`,
        };
      }
    }
    return null;
  }, [selectedBorrower, participants, otherReaders]);

  const canCheckout = selectedBooks.length > 0 && 
    selectedBorrower !== null && 
    (activeLoansCount + selectedBooks.length) <= maxLoans;

  const loansRemaining = maxLoans - activeLoansCount;
  const willExceedLimit = selectedBooks.length > loansRemaining;

  return (
    <div className="flex flex-col h-full bg-card rounded-lg border">
      {/* Borrower Selection */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Emprunteur</h3>
        
        {selectedBorrowerInfo ? (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {selectedBorrowerInfo.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{selectedBorrowerInfo.name}</p>
              <p className="text-xs text-muted-foreground">{selectedBorrowerInfo.number}</p>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: maxLoans }).map((_, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      i < activeLoansCount ? "bg-primary" : 
                      i < activeLoansCount + selectedBooks.length ? "bg-primary/50" : 
                      "bg-muted-foreground/30"
                    )}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {activeLoansCount}/{maxLoans}
                </span>
              </div>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8"
              onClick={() => onSelectBorrower('participant', '')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Popover open={borrowerSearchOpen} onOpenChange={setBorrowerSearchOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start gap-2">
                <User className="h-4 w-4" />
                Sélectionner un emprunteur
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-2 border-b">
                <Tabs value={borrowerType} onValueChange={(v) => setBorrowerType(v as BorrowerType)}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="participant">Participants</TabsTrigger>
                    <TabsTrigger value="other_reader">Autres lecteurs</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <Command>
                <CommandInput placeholder="Rechercher..." />
                <CommandList>
                  <CommandEmpty>Aucun résultat</CommandEmpty>
                  <CommandGroup>
                    {borrowerType === 'participant' ? (
                      participants.map(participant => (
                        <CommandItem
                          key={participant.id}
                          value={`${participant.firstName} ${participant.lastName} ${participant.participantNumber}`}
                          onSelect={() => {
                            onSelectBorrower('participant', participant.id);
                            setBorrowerSearchOpen(false);
                          }}
                        >
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="text-xs">
                              {participant.firstName[0]}{participant.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {participant.firstName} {participant.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {participant.participantNumber}
                            </p>
                          </div>
                        </CommandItem>
                      ))
                    ) : (
                      otherReaders.map(reader => (
                        <CommandItem
                          key={reader.id}
                          value={`${reader.firstName} ${reader.lastName} ${reader.readerNumber}`}
                          onSelect={() => {
                            onSelectBorrower('other_reader', reader.id);
                            setBorrowerSearchOpen(false);
                          }}
                        >
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback className="text-xs">
                              {reader.firstName[0]}{reader.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {reader.firstName} {reader.lastName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {reader.readerNumber}
                            </p>
                          </div>
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
        
        {willExceedLimit && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-destructive/10 text-destructive rounded text-sm">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Limite de {maxLoans} prêts dépassée</span>
          </div>
        )}
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-hidden">
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Panier ({selectedBooks.length})
            </h3>
            {selectedBooks.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7"
                onClick={onClearCart}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Vider
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100%-3rem)] px-4">
          {selectedBooks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <ShoppingCart className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">Cliquez sur un livre pour l'ajouter</p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {selectedBooks.map(bookId => {
                const book = getBookById(bookId);
                if (!book) return null;
                
                return (
                  <div 
                    key={bookId}
                    className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                  >
                    <div className="h-10 w-8 bg-primary/20 rounded flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium">📚</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{book.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7 shrink-0"
                      onClick={() => onRemoveBook(bookId)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Due Date & Checkout */}
      <div className="p-4 border-t space-y-3">
        {/* Due Date Picker */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Date de retour</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Calendar className="h-4 w-4" />
                {format(dueDate, 'dd MMM yyyy', { locale: fr })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <CalendarComponent
                mode="single"
                selected={dueDate}
                onSelect={(date) => date && onDueDateChange(date)}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Checkout Button */}
        <Button 
          className="w-full h-12 text-lg gap-2"
          disabled={!canCheckout}
          onClick={onCheckout}
        >
          ✅ Confirmer ({selectedBooks.length})
        </Button>
      </div>
    </div>
  );
}
