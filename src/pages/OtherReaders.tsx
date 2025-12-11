import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, UserPlus, BookOpen, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import { useLibraryStore, OtherReader, ReaderType } from '@/hooks/useLibraryStore';
import { usePagination } from '@/hooks/usePagination';
import { OtherReaderFormDialog } from '@/components/other-readers/OtherReaderFormDialog';
import { DeleteOtherReaderDialog } from '@/components/other-readers/DeleteOtherReaderDialog';
import { OtherReaderJournalDialog } from '@/components/other-readers/OtherReaderJournalDialog';
import { StatCard } from '@/components/dashboard/StatCard';
import { toast } from 'sonner';

const readerTypeLabels: Record<ReaderType, string> = {
  parent: 'Parent',
  instructor: 'Instructeur',
  staff: 'Personnel',
  other: 'Autre',
};

const readerTypeColors: Record<ReaderType, string> = {
  parent: 'hsl(262, 83%, 58%)',
  instructor: 'hsl(174, 72%, 40%)',
  staff: 'hsl(25, 95%, 53%)',
  other: 'hsl(200, 80%, 50%)',
};

export default function OtherReaders() {
  const { 
    otherReaders, 
    addOtherReader, 
    updateOtherReader, 
    deleteOtherReader,
    getNextOtherReaderNumber,
    getActiveLoansForOtherReader,
  } = useLibraryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ReaderType>('all');
  const [showStats, setShowStats] = useState(true);
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [journalDialogOpen, setJournalDialogOpen] = useState(false);
  const [selectedReader, setSelectedReader] = useState<OtherReader | null>(null);

  // Filter readers
  const filteredReaders = useMemo(() => {
    return otherReaders.filter(r => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = `${r.firstName} ${r.lastName}`.toLowerCase().includes(query);
        const matchesNumber = r.readerNumber.toLowerCase().includes(query);
        if (!matchesName && !matchesNumber) return false;
      }
      if (typeFilter !== 'all' && r.readerType !== typeFilter) return false;
      return true;
    });
  }, [otherReaders, searchQuery, typeFilter]);

  // Pagination
  const pagination = usePagination<OtherReader>({ data: filteredReaders, itemsPerPage: 10 });

  const handleAdd = () => {
    setSelectedReader(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (reader: OtherReader) => {
    setSelectedReader(reader);
    setFormDialogOpen(true);
  };

  const handleDelete = (reader: OtherReader) => {
    setSelectedReader(reader);
    setDeleteDialogOpen(true);
  };

  const handleViewJournal = (reader: OtherReader) => {
    setSelectedReader(reader);
    setJournalDialogOpen(true);
  };

  const handleFormSubmit = (data: { 
    firstName: string; 
    lastName: string; 
    readerType: ReaderType;
    phone?: string;
    email?: string;
    notes?: string;
  }) => {
    if (selectedReader) {
      updateOtherReader(selectedReader.id, data);
      toast.success('Lecteur modifié avec succès');
    } else {
      addOtherReader(data);
      toast.success('Lecteur créé avec succès');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedReader) {
      deleteOtherReader(selectedReader.id);
      toast.success('Lecteur supprimé avec succès');
      setDeleteDialogOpen(false);
      setSelectedReader(null);
    }
  };

  // Stats calculations
  const stats = useMemo(() => {
    const total = otherReaders.length;
    const typeDistribution: Record<string, number> = {};
    otherReaders.forEach(r => {
      typeDistribution[r.readerType] = (typeDistribution[r.readerType] || 0) + 1;
    });
    const mostCommonType = Object.entries(typeDistribution)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      total,
      parents: otherReaders.filter(r => r.readerType === 'parent').length,
      instructors: otherReaders.filter(r => r.readerType === 'instructor').length,
      mostCommonType: mostCommonType ? `${readerTypeLabels[mostCommonType[0] as ReaderType]} (${mostCommonType[1]})` : '-'
    };
  }, [otherReaders]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <UserPlus className="h-8 w-8" />
              Autres Lecteurs
            </h1>
            <p className="text-muted-foreground">
              {filteredReaders.length} lecteur{filteredReaders.length > 1 ? 's' : ''} (parents, instructeurs, personnel)
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
              title="Total Lecteurs"
              value={stats.total}
              icon={<UserPlus className="h-5 w-5" />}
            />
            <StatCard
              title="Parents"
              value={stats.parents}
            />
            <StatCard
              title="Instructeurs"
              value={stats.instructors}
            />
            <StatCard
              title="Type principal"
              value={stats.mostCommonType}
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
              
              <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | ReaderType)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="parent">Parent</SelectItem>
                  <SelectItem value="instructor">Instructeur</SelectItem>
                  <SelectItem value="staff">Personnel</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Readers Table */}
        {filteredReaders.length === 0 ? (
          <Card className="p-12 text-center">
            <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Aucun lecteur</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || typeFilter !== 'all'
                ? 'Aucun résultat ne correspond à vos critères.'
                : 'Commencez par ajouter des lecteurs.'}
            </p>
            {!searchQuery && typeFilter === 'all' && (
              <Button onClick={handleAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un lecteur
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
                  <TableHead>Type</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagination.paginatedData.map((reader) => (
                  <TableRow key={reader.id}>
                    <TableCell className="font-mono text-sm">
                      {reader.readerNumber}
                    </TableCell>
                    <TableCell className="font-medium">{reader.lastName}</TableCell>
                    <TableCell>{reader.firstName}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        style={{ 
                          borderColor: readerTypeColors[reader.readerType],
                          color: readerTypeColors[reader.readerType]
                        }}
                      >
                        {readerTypeLabels[reader.readerType]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {reader.phone && <div>{reader.phone}</div>}
                        {reader.email && <div className="text-muted-foreground">{reader.email}</div>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewJournal(reader)}
                          title="Voir le journal"
                        >
                          <BookOpen className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEdit(reader)}
                          title="Modifier"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(reader)}
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
            <TablePagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              itemsPerPage={pagination.itemsPerPage}
              onPageChange={pagination.goToPage}
              onItemsPerPageChange={pagination.setItemsPerPage}
            />
          </Card>
        )}
      </div>

      <OtherReaderFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        readerToEdit={selectedReader}
        nextReaderNumber={getNextOtherReaderNumber()}
        onSubmit={handleFormSubmit}
      />

      <DeleteOtherReaderDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        reader={selectedReader}
        onConfirm={handleConfirmDelete}
      />

      <OtherReaderJournalDialog
        open={journalDialogOpen}
        onOpenChange={setJournalDialogOpen}
        reader={selectedReader}
      />
    </AdminLayout>
  );
}
