import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SchoolClass } from '@/hooks/useLibraryStore';
import { getAgeRange, AgeRange } from '@/lib/ageRanges';

interface ImportParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: SchoolClass[];
  onImport: (participants: Array<{
    firstName: string;
    lastName: string;
    age: number;
    gender: 'M' | 'F';
    classId: string;
  }>) => void;
}

interface ParsedParticipant {
  firstName: string;
  lastName: string;
  age: number;
  gender: 'M' | 'F';
  className: string;
}

export function ImportParticipantsDialog({ open, onOpenChange, classes, onImport }: ImportParticipantsDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedParticipants, setParsedParticipants] = useState<ParsedParticipant[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const resetState = () => {
    setFile(null);
    setParsedParticipants([]);
    setErrors([]);
    setIsProcessing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setErrors(['Veuillez sélectionner un fichier CSV.']);
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = async (csvFile: File) => {
    setIsProcessing(true);
    setErrors([]);
    setParsedParticipants([]);

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setErrors(['Le fichier CSV doit avoir une ligne d\'en-tête et au moins une ligne de données.']);
        setIsProcessing(false);
        return;
      }

      const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
      const requiredColumns = ['prenom', 'nom', 'age', 'sexe'];
      const missingColumns = requiredColumns.filter(col => !header.includes(col));

      if (missingColumns.length > 0) {
        setErrors([`Colonnes manquantes: ${missingColumns.join(', ')}`]);
        setIsProcessing(false);
        return;
      }

      const firstNameIdx = header.indexOf('prenom');
      const lastNameIdx = header.indexOf('nom');
      const ageIdx = header.indexOf('age');
      const genderIdx = header.indexOf('sexe');
      const classIdx = header.indexOf('classe');

      const participants: ParsedParticipant[] = [];
      const parseErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        
        const firstName = values[firstNameIdx]?.trim();
        const lastName = values[lastNameIdx]?.trim();
        const ageStr = values[ageIdx]?.trim();
        const genderStr = values[genderIdx]?.trim().toUpperCase();

        if (!firstName || !lastName) {
          parseErrors.push(`Ligne ${i + 1}: Prénom ou nom manquant`);
          continue;
        }

        const age = parseInt(ageStr);
        if (isNaN(age) || age < 3 || age > 99) {
          parseErrors.push(`Ligne ${i + 1}: Âge invalide (${ageStr})`);
          continue;
        }

        if (genderStr !== 'M' && genderStr !== 'F') {
          parseErrors.push(`Ligne ${i + 1}: Sexe invalide (${genderStr}), doit être M ou F`);
          continue;
        }

        participants.push({
          firstName,
          lastName,
          age,
          gender: genderStr as 'M' | 'F',
          className: classIdx !== -1 ? values[classIdx]?.trim() || '' : '',
        });
      }

      setParsedParticipants(participants);
      setErrors(parseErrors);
    } catch (error) {
      setErrors(['Échec de l\'analyse du fichier CSV. Veuillez vérifier le format.']);
    }

    setIsProcessing(false);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const findClassId = (className: string, ageRange: AgeRange): string => {
    if (className) {
      const found = classes.find(c => 
        c.name.toLowerCase() === className.toLowerCase()
      );
      if (found) return found.id;
    }
    // Find a compatible class based on age range
    const compatibleClass = classes.find(c => c.ageRange === ageRange);
    return compatibleClass?.id || classes[0]?.id || '';
  };

  const handleImport = () => {
    const participantsToImport = parsedParticipants.map(p => {
      const ageRange = getAgeRange(p.age);
      return {
        firstName: p.firstName,
        lastName: p.lastName,
        age: p.age,
        gender: p.gender,
        classId: findClassId(p.className, ageRange),
      };
    });

    onImport(participantsToImport);
    resetState();
    onOpenChange(false);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  const downloadTemplate = () => {
    const csvContent = 'prenom,nom,age,sexe,classe\nJean,Dupont,10,M,CP\nMarie,Martin,8,F,CE1';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modele_participants.csv';
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Importer des participants</DialogTitle>
          <DialogDescription>
            Téléchargez un fichier CSV avec les colonnes: prenom, nom, age, sexe, classe (optionnel)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download Template Button */}
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Télécharger le modèle CSV
          </Button>

          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-foreground">
                <FileText className="h-5 w-5" />
                <span className="font-medium">{file.name}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Cliquez pour sélectionner un fichier CSV
                </p>
              </div>
            )}
          </div>

          {/* Processing indicator */}
          {isProcessing && (
            <p className="text-sm text-muted-foreground text-center">Traitement en cours...</p>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.slice(0, 5).map((error, idx) => (
                    <li key={idx} className="text-sm">{error}</li>
                  ))}
                  {errors.length > 5 && (
                    <li className="text-sm">...et {errors.length - 5} autres erreurs</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Preview */}
          {parsedParticipants.length > 0 && (
            <Alert className="border-primary/50 bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                <strong>{parsedParticipants.length} participants</strong> prêts à importer
                <div className="mt-2 max-h-32 overflow-y-auto text-sm text-muted-foreground">
                  {parsedParticipants.slice(0, 5).map((p, idx) => (
                    <div key={idx}>• {p.firstName} {p.lastName} ({p.age} ans, {p.gender})</div>
                  ))}
                  {parsedParticipants.length > 5 && (
                    <div>...et {parsedParticipants.length - 5} autres</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={parsedParticipants.length === 0 || isProcessing}
          >
            Importer {parsedParticipants.length > 0 ? `${parsedParticipants.length} participants` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
