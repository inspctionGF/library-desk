import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useLibraryStore, InventoryItem } from '@/hooks/useLibraryStore';
import { Check, Minus, Plus, AlertTriangle, Clock, CheckCircle2, BookOpen } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface InventoryBookCardProps {
  item: InventoryItem;
  isSelected?: boolean;
  onSelectionChange?: (id: string, selected: boolean) => void;
  selectionMode?: boolean;
}

export function InventoryBookCard({ item, isSelected = false, onSelectionChange, selectionMode = false }: InventoryBookCardProps) {
  const { getBookById, getCategoryById, updateInventoryItem } = useLibraryStore();
  const book = getBookById(item.bookId);
  const category = book ? getCategoryById(book.categoryId) : null;

  const [foundQuantity, setFoundQuantity] = useState<number>(item.foundQuantity ?? item.expectedQuantity);
  const [notes, setNotes] = useState(item.notes || '');
  const [isExpanded, setIsExpanded] = useState(false);

  if (!book) return null;

  const handleSave = () => {
    updateInventoryItem(item.id, foundQuantity, notes || undefined);
    setIsExpanded(false);
  };

  const increment = () => setFoundQuantity(prev => prev + 1);
  const decrement = () => setFoundQuantity(prev => Math.max(0, prev - 1));

  const statusConfig = {
    pending: { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'En attente' },
    checked: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Vérifié' },
    discrepancy: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Écart' },
  };

  const status = statusConfig[item.status];
  const StatusIcon = status.icon;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className={`transition-all ${isExpanded ? 'ring-2 ring-primary' : ''} ${isSelected ? 'ring-2 ring-primary bg-primary/5' : ''}`}>
        <CardContent className="p-4">
          <div className="flex gap-3">
            {/* Selection Checkbox */}
            {selectionMode && (
              <div className="flex items-center">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) => onSelectionChange?.(item.id, !!checked)}
                />
              </div>
            )}

            {/* Book Cover */}
            <div className="w-16 h-20 rounded-md bg-muted flex items-center justify-center shrink-0 overflow-hidden">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            {/* Book Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-sm line-clamp-1">{book.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                  {category && (
                    <Badge variant="outline" className="mt-1 text-xs" style={{ borderColor: category.color, color: category.color }}>
                      {category.name}
                    </Badge>
                  )}
                </div>
                <Badge variant="outline" className={`${status.bg} ${status.color} shrink-0`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {item.status === 'pending' ? item.expectedQuantity : `${item.foundQuantity}/${item.expectedQuantity}`}
                </Badge>
              </div>

              {!selectionMode && (
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="mt-2 w-full">
                    {isExpanded ? 'Réduire' : 'Vérifier'}
                  </Button>
                </CollapsibleTrigger>
              )}
            </div>
          </div>

          <CollapsibleContent>
            <div className="mt-4 pt-4 border-t space-y-4">
              {/* Quantity Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantité trouvée</label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={decrement}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={foundQuantity}
                    onChange={(e) => setFoundQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="text-center w-20"
                    min={0}
                  />
                  <Button variant="outline" size="icon" onClick={increment}>
                    <Plus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    / {item.expectedQuantity} attendus
                  </span>
                </div>
                {foundQuantity !== item.expectedQuantity && (
                  <p className="text-sm text-orange-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Écart de {Math.abs(foundQuantity - item.expectedQuantity)} livre(s)
                  </p>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (optionnel)</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: 1 livre endommagé, 2 mal rangés..."
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsExpanded(false)}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={handleSave}>
                  <Check className="h-4 w-4 mr-2" />
                  Valider
                </Button>
              </div>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Card>
    </Collapsible>
  );
}