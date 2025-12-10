import { useState } from 'react';
import { Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Participant, SchoolClass } from '@/hooks/useLibraryStore';

interface ExportParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: Participant[];
  classes: SchoolClass[];
}

export function ExportParticipantsDialog({ open, onOpenChange, participants, classes }: ExportParticipantsDialogProps) {
  const [includeNumber, setIncludeNumber] = useState(true);
  const [includeClass, setIncludeClass] = useState(true);
  const [includeAgeRange, setIncludeAgeRange] = useState(false);

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls?.name || '';
  };

  const handleExport = () => {
    // Build CSV header
    const headers = ['prenom', 'nom', 'age', 'sexe'];
    if (includeNumber) headers.unshift('numero');
    if (includeClass) headers.push('classe');
    if (includeAgeRange) headers.push('tranche_age');

    // Build CSV rows
    const rows = participants.map(p => {
      const row: string[] = [];
      if (includeNumber) row.push(p.participantNumber);
      row.push(p.firstName, p.lastName, p.age.toString(), p.gender);
      if (includeClass) row.push(getClassName(p.classId));
      if (includeAgeRange) row.push(p.ageRange);
      return row.map(val => `"${val}"`).join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    link.href = URL.createObjectURL(blob);
    link.download = `participants_${date}.csv`;
    link.click();

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Exporter les participants</DialogTitle>
          <DialogDescription>
            {participants.length} participant{participants.length > 1 ? 's' : ''} seront exportés au format CSV
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">Colonnes à inclure:</p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeNumber" 
                checked={includeNumber} 
                onCheckedChange={(checked) => setIncludeNumber(checked as boolean)}
              />
              <Label htmlFor="includeNumber" className="text-sm font-normal cursor-pointer">
                Numéro de participant
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeClass" 
                checked={includeClass} 
                onCheckedChange={(checked) => setIncludeClass(checked as boolean)}
              />
              <Label htmlFor="includeClass" className="text-sm font-normal cursor-pointer">
                Classe
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="includeAgeRange" 
                checked={includeAgeRange} 
                onCheckedChange={(checked) => setIncludeAgeRange(checked as boolean)}
              />
              <Label htmlFor="includeAgeRange" className="text-sm font-normal cursor-pointer">
                Tranche d'âge
              </Label>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Les colonnes prénom, nom, âge et sexe sont toujours incluses.
          </p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
