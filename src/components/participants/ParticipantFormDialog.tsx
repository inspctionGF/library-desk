import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Participant, SchoolClass } from '@/hooks/useLibraryStore';
import { getAgeRange, getAgeRangeLabel, ageRangeColors, AgeRange } from '@/lib/ageRanges';

interface ParticipantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participantToEdit?: Participant | null;
  classes: SchoolClass[];
  nextParticipantNumber: string;
  onSubmit: (data: { 
    firstName: string; 
    lastName: string; 
    age: number; 
    gender: 'M' | 'F'; 
    classId: string;
  }) => void;
}

export function ParticipantFormDialog({ 
  open, 
  onOpenChange, 
  participantToEdit, 
  classes,
  nextParticipantNumber,
  onSubmit 
}: ParticipantFormDialogProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [age, setAge] = useState<number | ''>('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [classId, setClassId] = useState('');

  useEffect(() => {
    if (participantToEdit) {
      setFirstName(participantToEdit.firstName);
      setLastName(participantToEdit.lastName);
      setAge(participantToEdit.age);
      setGender(participantToEdit.gender);
      setClassId(participantToEdit.classId);
    } else {
      setFirstName('');
      setLastName('');
      setAge('');
      setGender('M');
      setClassId('');
    }
  }, [participantToEdit, open]);

  // Calculate age range from entered age
  const calculatedAgeRange = useMemo(() => {
    if (age === '' || age < 3) return null;
    return getAgeRange(age);
  }, [age]);

  // Filter classes that are compatible with the age
  const compatibleClasses = useMemo(() => {
    if (!calculatedAgeRange) return classes;
    return classes.filter(c => c.ageRange === calculatedAgeRange);
  }, [calculatedAgeRange, classes]);

  // Reset class selection if current selection becomes incompatible
  useEffect(() => {
    if (classId && calculatedAgeRange) {
      const selectedClass = classes.find(c => c.id === classId);
      if (selectedClass && selectedClass.ageRange !== calculatedAgeRange) {
        setClassId('');
      }
    }
  }, [calculatedAgeRange, classId, classes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || age === '' || !classId) return;
    onSubmit({ 
      firstName: firstName.trim(), 
      lastName: lastName.trim(), 
      age: Number(age), 
      gender, 
      classId 
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {participantToEdit ? 'Modifier le participant' : 'Nouveau participant'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Participant Number (read-only for new, shown for edit) */}
          <div className="space-y-2">
            <Label>Numéro du participant</Label>
            <div className="text-sm font-mono bg-muted px-3 py-2 rounded-md">
              {participantToEdit?.participantNumber || nextParticipantNumber}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName">Nom *</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Dupont"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Marie"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Âge *</Label>
              <Input
                id="age"
                type="number"
                min={3}
                max={25}
                value={age}
                onChange={(e) => setAge(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="10"
                required
              />
              {calculatedAgeRange && (
                <Badge 
                  variant="outline" 
                  className="mt-1"
                  style={{ 
                    borderColor: ageRangeColors[calculatedAgeRange],
                    color: ageRangeColors[calculatedAgeRange]
                  }}
                >
                  Tranche: {getAgeRangeLabel(calculatedAgeRange)}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Label>Sexe *</Label>
              <RadioGroup 
                value={gender} 
                onValueChange={(v) => setGender(v as 'M' | 'F')}
                className="flex gap-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="M" id="gender-m" />
                  <Label htmlFor="gender-m" className="cursor-pointer">Masculin</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="F" id="gender-f" />
                  <Label htmlFor="gender-f" className="cursor-pointer">Féminin</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="classId">Classe *</Label>
            {!calculatedAgeRange && age !== '' && (
              <p className="text-sm text-muted-foreground">
                Entrez un âge valide (3-22 ans) pour voir les classes compatibles.
              </p>
            )}
            {calculatedAgeRange && compatibleClasses.length === 0 && (
              <p className="text-sm text-destructive">
                Aucune classe disponible pour la tranche {getAgeRangeLabel(calculatedAgeRange)}.
              </p>
            )}
            <Select 
              value={classId} 
              onValueChange={setClassId}
              disabled={!calculatedAgeRange || compatibleClasses.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                {compatibleClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name} ({getAgeRangeLabel(cls.ageRange)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button 
              type="submit"
              disabled={!firstName.trim() || !lastName.trim() || age === '' || !classId}
            >
              {participantToEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
