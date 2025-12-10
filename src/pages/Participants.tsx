import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Plus, Search, Users, BookOpen, Pencil, Trash2, Upload, Download, Eye, EyeOff } from 'lucide-react';
import { useLibraryStore, Participant } from '@/hooks/useLibraryStore';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { ParticipantFormDialog } from '@/components/participants/ParticipantFormDialog';
import { DeleteParticipantDialog } from '@/components/participants/DeleteParticipantDialog';
import { ParticipantJournalDialog } from '@/components/participants/ParticipantJournalDialog';
import { ImportParticipantsDialog } from '@/components/participants/ImportParticipantsDialog';
import { ExportParticipantsDialog } from '@/components/participants/ExportParticipantsDialog';
import { StatCard } from '@/components/dashboard/StatCard';
import { ageRangeColors, getAgeRangeLabel, ageRangeOptions, AgeRange } from '@/lib/ageRanges';
import { toast } from 'sonner';

export default function Participants() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const classFilter = searchParams.get('class');
  
  const { config } = useSystemConfig();
  const { 
    classes, 
    participants, 
    addParticipant, 
    updateParticipant, 
    deleteParticipant,
    getNextParticipantNumber 
  } = useLibraryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'M' | 'F'>('all');
  const [ageRangeFilter, setAgeRangeFilter] = useState<'all' | AgeRange>('all');
  const [showStats, setShowStats] = useState(true);
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const selectedClass = classFilter ? classes.find(c => c.id === classFilter) : null;

  // Filter participants
  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      // Class filter
      if (classFilter && p.classId !== classFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = `${p.firstName} ${p.lastName}`.toLowerCase().includes(query);
        const matchesNumber = p.participantNumber.toLowerCase().includes(query);
        if (!matchesName && !matchesNumber) return false;
      }
      
      // Gender filter
      if (genderFilter !== 'all' && p.gender !== genderFilter) return false;
      
      // Age range filter
      if (ageRangeFilter !== 'all' && p.ageRange !== ageRangeFilter) return false;
      
      return true;
    });
  }, [participants, classFilter, searchQuery, genderFilter, ageRangeFilter]);

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls?.name || 'Non assignée';
  };

  const handleAdd = () => {
    setSelectedParticipant(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (participant: Participant) => {
    setSelectedParticipant(participant);
    setFormDialogOpen(true);
  };

  const handleDelete = (participant: Participant) => {
    setSelectedParticipant(participant);
    setDeleteDialogOpen(true);
  };

  const handleViewJournal = (participant: Participant) => {
    setSelectedParticipant(participant);
    setJournalDialogOpen(true);
  };

  const handleFormSubmit = (data: { 
    firstName: string; 
    lastName: string; 
    age: number; 
    gender: 'M' | 'F'; 
    classId: string;
  }) => {
    if (selectedParticipant) {
      updateParticipant(selectedParticipant.id, data);
      toast.success('Participant modifié avec succès');
    } else {
      addParticipant(data);
      toast.success('Participant créé avec succès');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedParticipant) {
      deleteParticipant(selectedParticipant.id);
      toast.success('Participant supprimé avec succès');
      setDeleteDialogOpen(false);
      setSelectedParticipant(null);
    }
  };

  const handleImport = (participantsData: Array<{
    firstName: string;
    lastName: string;
    age: number;
    gender: 'M' | 'F';
    classId: string;
  }>) => {
    participantsData.forEach(data => addParticipant(data));
    toast.success(`${participantsData.length} participants importés avec succès`);
  };

  const clearClassFilter = () => {
    navigate('/participants');
  };

  // Stats calculations
  const stats = useMemo(() => {
    const total = participants.length;
    const males = participants.filter(p => p.gender === 'M').length;
    const females = participants.filter(p => p.gender === 'F').length;
    const classesWithParticipants = new Set(participants.map(p => p.classId)).size;
    
    // Age range distribution
    const ageRangeDistribution: Record<string, number> = {};
    participants.forEach(p => {
      ageRangeDistribution[p.ageRange] = (ageRangeDistribution[p.ageRange] || 0) + 1;
    });
    const mostCommonAgeRange = Object.entries(ageRangeDistribution)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      males,
      females,
      classesWithParticipants,
      mostCommonAgeRange: mostCommonAgeRange ? `${mostCommonAgeRange[0]} (${mostCommonAgeRange[1]})` : '-'
    };
  }, [participants]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        {selectedClass && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/classes">Classes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedClass.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Users className="h-8 w-8" />
              Participants
            </h1>
            <p className="text-muted-foreground">
              {filteredParticipants.length} participant{filteredParticipants.length > 1 ? 's' : ''}
              {selectedClass && (
                <>
                  {' '}dans <strong>{selectedClass.name}</strong>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto ml-2"
                    onClick={clearClassFilter}
                  >
                    Voir tous
                  </Button>
                </>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowStats(!showStats)}
              title={showStats ? 'Masquer les statistiques' : 'Afficher les statistiques'}
            >
              {showStats ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Importer
            </Button>
            <Button variant="outline" onClick={() => setExportDialogOpen(true)} disabled={participants.length === 0}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {showStats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Participants"
              value={stats.total}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              title="Garçons / Filles"
              value={`${stats.males} / ${stats.females}`}
              subtitle={stats.total > 0 ? `${Math.round((stats.males / stats.total) * 100)}% / ${Math.round((stats.females / stats.total) * 100)}%` : undefined}
            />
            <StatCard
              title="Classes actives"
              value={stats.classesWithParticipants}
              subtitle={`sur ${classes.length} classes`}
            />
            <StatCard
              title="Tranche d'âge principale"
              value={stats.mostCommonAgeRange}
            />
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou numéro..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={genderFilter} onValueChange={(v) => setGenderFilter(v as 'all' | 'M' | 'F')}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sexe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="M">Masculin</SelectItem>
                  <SelectItem value="F">Féminin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ageRangeFilter} onValueChange={(v) => setAgeRangeFilter(v as 'all' | AgeRange)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Tranche d'âge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les tranches</SelectItem>
                  {ageRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Participants Table */}
        {filteredParticipants.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucun participant</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || genderFilter !== 'all' || ageRangeFilter !== 'all'
                ? 'Aucun résultat ne correspond à vos critères.'
                : 'Commencez par ajouter des participants.'}
            </p>
            {!searchQuery && genderFilter === 'all' && ageRangeFilter === 'all' && (
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un participant
              </Button>
            )}
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numéro</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Prénom</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead>Sexe</TableHead>
                  {!classFilter && <TableHead>Classe</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredParticipants.map((participant) => (
                  <TableRow key={participant.id}>
                    <TableCell className="font-mono text-sm">
                      {participant.participantNumber}
                    </TableCell>
                    <TableCell className="font-medium">{participant.lastName}</TableCell>
                    <TableCell>{participant.firstName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{participant.age} ans</span>
                        <Badge 
                          variant="outline"
                          className="text-xs"
                          style={{ 
                            borderColor: ageRangeColors[participant.ageRange],
                            color: ageRangeColors[participant.ageRange]
                          }}
                        >
                          {participant.ageRange}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={participant.gender === 'M' ? 'default' : 'secondary'}>
                        {participant.gender === 'M' ? 'M' : 'F'}
                      </Badge>
                    </TableCell>
                    {!classFilter && (
                      <TableCell>{getClassName(participant.classId)}</TableCell>
                    )}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewJournal(participant)}
                          title="Voir le journal"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(participant)}
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(participant)}
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      <ParticipantFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        participantToEdit={selectedParticipant}
        classes={classes}
        nextParticipantNumber={getNextParticipantNumber(config.cdejNumber)}
        onSubmit={handleFormSubmit}
      />

      <DeleteParticipantDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        participant={selectedParticipant}
        onConfirm={handleConfirmDelete}
      />

      <ParticipantJournalDialog
        open={journalDialogOpen}
        onOpenChange={setJournalDialogOpen}
        participant={selectedParticipant}
      />

      <ImportParticipantsDialog
        open={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        classes={classes}
        onImport={handleImport}
      />

      <ExportParticipantsDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        participants={filteredParticipants}
        classes={classes}
      />
    </AdminLayout>
  );
}
