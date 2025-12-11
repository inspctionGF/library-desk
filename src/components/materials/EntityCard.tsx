import { Building2, Church, School, Users, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import type { Entity } from '@/hooks/useLibraryStore';

interface EntityCardProps {
  entity: Entity;
  loansCount: number;
  onEdit: () => void;
  onDelete: () => void;
}

const entityTypeIcons: Record<string, any> = {
  church: Church,
  school: School,
  association: Users,
  other: Building2,
};

const entityTypeLabels: Record<string, string> = {
  church: 'Église',
  school: 'École',
  association: 'Association',
  other: 'Autre',
};

const EntityCard = ({ entity, loansCount, onEdit, onDelete }: EntityCardProps) => {
  const Icon = entityTypeIcons[entity.type] || Building2;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-medium text-foreground">{entity.name}</h3>
              <Badge variant="secondary">{entityTypeLabels[entity.type]}</Badge>
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
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          {entity.contactName && (
            <div className="flex items-center gap-2">
              <Users className="h-3 w-3" />
              <span>{entity.contactName}</span>
            </div>
          )}
          {entity.phone && (
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{entity.phone}</span>
            </div>
          )}
          {entity.email && (
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span className="truncate">{entity.email}</span>
            </div>
          )}
          {entity.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{entity.address}</span>
            </div>
          )}
        </div>

        {loansCount > 0 && (
          <div className="mt-3 pt-3 border-t">
            <Badge variant="outline">{loansCount} prêt(s) actif(s)</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EntityCard;
