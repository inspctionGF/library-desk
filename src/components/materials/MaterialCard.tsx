import { Package, Edit2, Trash2, HandCoins } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import type { Material, MaterialType } from '@/hooks/useLibraryStore';

interface MaterialCardProps {
  material: Material;
  materialType?: MaterialType;
  onEdit: () => void;
  onDelete: () => void;
  onLoan: () => void;
}

const conditionLabels: Record<string, { label: string; color: string }> = {
  excellent: { label: 'Excellent', color: 'hsl(142, 76%, 36%)' },
  good: { label: 'Bon', color: 'hsl(174, 72%, 40%)' },
  fair: { label: 'Correct', color: 'hsl(38, 92%, 50%)' },
  poor: { label: 'Mauvais', color: 'hsl(0, 84%, 60%)' },
};

const MaterialCard = ({ material, materialType, onEdit, onDelete, onLoan }: MaterialCardProps) => {
  const condition = conditionLabels[material.condition] || conditionLabels.good;
  const isAvailable = material.availableQuantity > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: materialType?.color ? `${materialType.color}20` : 'hsl(var(--muted))' }}
            >
              <Package 
                className="h-5 w-5" 
                style={{ color: materialType?.color || 'hsl(var(--muted-foreground))' }}
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">{material.name}</h3>
              {material.serialNumber && (
                <p className="text-xs text-muted-foreground">N° {material.serialNumber}</p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {materialType && (
                  <Badge 
                    variant="secondary" 
                    style={{ backgroundColor: materialType.color, color: 'white' }}
                  >
                    {materialType.name}
                  </Badge>
                )}
                <Badge 
                  variant="outline"
                  style={{ borderColor: condition.color, color: condition.color }}
                >
                  {condition.label}
                </Badge>
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onLoan} disabled={!isAvailable}>
                <HandCoins className="h-4 w-4 mr-2" />
                Prêter
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Quantité: {material.quantity}
          </span>
          <Badge variant={isAvailable ? 'default' : 'secondary'}>
            {material.availableQuantity} disponible(s)
          </Badge>
        </div>
        {material.notes && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{material.notes}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MaterialCard;
