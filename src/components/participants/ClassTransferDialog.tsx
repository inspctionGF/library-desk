import { useState, useMemo } from 'react';
import { ArrowRightLeft, AlertTriangle, Check, Users, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ageRangeColors, getAgeRangeLabel, getAgeRange, type AgeRange } from '@/lib/ageRanges';
import type { Participant, SchoolClass } from '@/hooks/useLibraryStore';

interface ClassTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: Participant[];
  classes: SchoolClass[];
  onTransfer: (transfers: Array<{ participantId: string; newClassId: string }>) => void;
}

interface MismatchedParticipant extends Participant {
  currentClass: SchoolClass | undefined;
  expectedAgeRange: AgeRange;
  selectedNewClassId: string | null;
}

export function ClassTransferDialog({
  open,
  onOpenChange,
  participants,
  classes,
  onTransfer,
}: ClassTransferDialogProps) {
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [classAssignments, setClassAssignments] = useState<Record<string, string>>({});

  // Find participants whose age doesn't match their class age range
  const mismatchedParticipants = useMemo(() => {
    return participants
      .map((p): MismatchedParticipant | null => {
        const currentClass = classes.find(c => c.id === p.classId);
        const expectedAgeRange = getAgeRange(p.age);
        
        // Check if participant's age range doesn't match their class age range
        if (currentClass && currentClass.ageRange !== expectedAgeRange) {
          return {
            ...p,
            currentClass,
            expectedAgeRange,
            selectedNewClassId: classAssignments[p.id] || null,
          };
        }
        return null;
      })
      .filter((p): p is MismatchedParticipant => p !== null)
      .sort((a, b) => {
        // Sort by expected age range, then by name
        if (a.expectedAgeRange !== b.expectedAgeRange) {
          return a.expectedAgeRange.localeCompare(b.expectedAgeRange);
        }
        return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
      });
  }, [participants, classes, classAssignments]);

  // Get compatible classes for a participant based on their expected age range
  const getCompatibleClasses = (expectedAgeRange: AgeRange) => {
    return classes.filter(c => c.ageRange === expectedAgeRange);
  };

  // Group mismatched participants by expected age range
  const groupedByAgeRange = useMemo(() => {
    const groups: Record<AgeRange, MismatchedParticipant[]> = {} as Record<AgeRange, MismatchedParticipant[]>;
    mismatchedParticipants.forEach(p => {
      if (!groups[p.expectedAgeRange]) {
        groups[p.expectedAgeRange] = [];
      }
      groups[p.expectedAgeRange].push(p);
    });
    return groups;
  }, [mismatchedParticipants]);

  const handleToggleParticipant = (id: string) => {
    const newSelected = new Set(selectedParticipants);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedParticipants(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedParticipants.size === mismatchedParticipants.length) {
      setSelectedParticipants(new Set());
    } else {
      setSelectedParticipants(new Set(mismatchedParticipants.map(p => p.id)));
    }
  };

  const handleSelectGroup = (ageRange: AgeRange) => {
    const groupParticipants = groupedByAgeRange[ageRange] || [];
    const allSelected = groupParticipants.every(p => selectedParticipants.has(p.id));
    
    const newSelected = new Set(selectedParticipants);
    groupParticipants.forEach(p => {
      if (allSelected) {
        newSelected.delete(p.id);
      } else {
        newSelected.add(p.id);
      }
    });
    setSelectedParticipants(newSelected);
  };

  const handleClassAssignment = (participantId: string, classId: string) => {
    setClassAssignments(prev => ({ ...prev, [participantId]: classId }));
  };

  const handleAutoAssign = (ageRange: AgeRange) => {
    const compatibleClasses = getCompatibleClasses(ageRange);
    if (compatibleClasses.length === 0) return;
    
    // Assign to the first compatible class (or could be smarter - distribute evenly)
    const targetClass = compatibleClasses[0];
    const groupParticipants = groupedByAgeRange[ageRange] || [];
    
    const newAssignments = { ...classAssignments };
    groupParticipants.forEach(p => {
      if (selectedParticipants.has(p.id)) {
        newAssignments[p.id] = targetClass.id;
      }
    });
    setClassAssignments(newAssignments);
  };

  const handleTransfer = () => {
    const transfers = Array.from(selectedParticipants)
      .filter(id => classAssignments[id])
      .map(id => ({
        participantId: id,
        newClassId: classAssignments[id],
      }));

    if (transfers.length > 0) {
      onTransfer(transfers);
      onOpenChange(false);
      setSelectedParticipants(new Set());
      setClassAssignments({});
    }
  };

  const readyToTransfer = Array.from(selectedParticipants).filter(id => classAssignments[id]).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Transfert de classe
          </DialogTitle>
          <DialogDescription>
            Transférez les participants dont l'âge ne correspond plus à leur classe actuelle
          </DialogDescription>
        </DialogHeader>

        {mismatchedParticipants.length === 0 ? (
          <div className="py-12 text-center">
            <Check className="h-12 w-12 mx-auto mb-4 text-success" />
            <h3 className="text-lg font-semibold mb-2">Tout est en ordre !</h3>
            <p className="text-muted-foreground">
              Tous les participants sont dans une classe correspondant à leur âge.
            </p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <Card className="bg-warning/5 border-warning/20">
              <CardContent className="py-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                  <div>
                    <p className="font-medium text-sm">
                      {mismatchedParticipants.length} participant{mismatchedParticipants.length > 1 ? 's' : ''} à transférer
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ces participants ont un âge qui ne correspond plus à leur classe actuelle
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Select All */}
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedParticipants.size === mismatchedParticipants.length && mismatchedParticipants.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedParticipants.size > 0 
                    ? `${selectedParticipants.size} sélectionné${selectedParticipants.size > 1 ? 's' : ''}`
                    : 'Tout sélectionner'
                  }
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {readyToTransfer} prêt{readyToTransfer > 1 ? 's' : ''} au transfert
              </Badge>
            </div>

            {/* Participants grouped by expected age range */}
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-2">
                {Object.entries(groupedByAgeRange).map(([ageRange, groupParticipants]) => {
                  const compatibleClasses = getCompatibleClasses(ageRange as AgeRange);
                  const allSelected = groupParticipants.every(p => selectedParticipants.has(p.id));
                  const someSelected = groupParticipants.some(p => selectedParticipants.has(p.id));
                  
                  return (
                    <Card key={ageRange}>
                      <CardHeader className="py-3 px-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={() => handleSelectGroup(ageRange as AgeRange)}
                            />
                            <div className="flex items-center gap-2">
                              <Badge 
                                style={{ 
                                  backgroundColor: `${ageRangeColors[ageRange as AgeRange]}20`,
                                  color: ageRangeColors[ageRange as AgeRange],
                                  borderColor: ageRangeColors[ageRange as AgeRange]
                                }}
                              >
                                {getAgeRangeLabel(ageRange as AgeRange)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {groupParticipants.length} participant{groupParticipants.length > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          {compatibleClasses.length > 0 && someSelected && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAutoAssign(ageRange as AgeRange)}
                            >
                              Auto-assigner à {compatibleClasses[0].name}
                            </Button>
                          )}
                        </div>
                        {compatibleClasses.length === 0 && (
                          <p className="text-xs text-destructive mt-1 ml-7">
                            Aucune classe disponible pour cette tranche d'âge
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="py-0 px-4 pb-3">
                        <div className="space-y-2">
                          {groupParticipants.map((participant) => (
                            <div 
                              key={participant.id}
                              className={cn(
                                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                                selectedParticipants.has(participant.id) && "bg-primary/5"
                              )}
                            >
                              <Checkbox
                                checked={selectedParticipants.has(participant.id)}
                                onCheckedChange={() => handleToggleParticipant(participant.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm truncate">
                                    {participant.lastName} {participant.firstName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ({participant.age} ans)
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <span className="text-destructive line-through">
                                    {participant.currentClass?.name} ({participant.currentClass?.ageRange})
                                  </span>
                                  <ChevronRight className="h-3 w-3" />
                                  {classAssignments[participant.id] ? (
                                    <span className="text-success font-medium">
                                      {classes.find(c => c.id === classAssignments[participant.id])?.name}
                                    </span>
                                  ) : (
                                    <span className="italic">Non assigné</span>
                                  )}
                                </div>
                              </div>
                              {selectedParticipants.has(participant.id) && compatibleClasses.length > 0 && (
                                <Select
                                  value={classAssignments[participant.id] || ''}
                                  onValueChange={(v) => handleClassAssignment(participant.id, v)}
                                >
                                  <SelectTrigger className="w-[180px] h-8">
                                    <SelectValue placeholder="Choisir classe" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {compatibleClasses.map((cls) => (
                                      <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                {readyToTransfer > 0 
                  ? `${readyToTransfer} participant${readyToTransfer > 1 ? 's' : ''} sera${readyToTransfer > 1 ? 'ont' : ''} transféré${readyToTransfer > 1 ? 's' : ''}`
                  : 'Sélectionnez des participants et assignez-leur une nouvelle classe'
                }
              </p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Annuler
                </Button>
                <Button onClick={handleTransfer} disabled={readyToTransfer === 0}>
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Transférer ({readyToTransfer})
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
