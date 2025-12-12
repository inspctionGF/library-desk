import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatCard } from '@/components/dashboard/StatCard';
import { Plus, Search, BookOpenCheck, Pencil, Trash2, Eye, EyeOff, Users, BookOpen, Calendar, UsersRound } from 'lucide-react';
import { useAuditedLibraryStore } from '@/hooks/useAuditedLibraryStore';
import { ReadingSession, ReadingType, ClassReadingSession } from '@/hooks/useLibraryStore';
import { usePagination } from '@/hooks/usePagination';
import { ReadingSessionFormDialog } from '@/components/reading-sessions/ReadingSessionFormDialog';
import { DeleteReadingSessionDialog } from '@/components/reading-sessions/DeleteReadingSessionDialog';
import { ClassReadingSessionDialog } from '@/components/reading-sessions/ClassReadingSessionDialog';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useInitialLoading } from '@/hooks/useLoadingState';
import { PageSkeleton } from '@/components/skeletons';

const readingTypeLabels: Record<ReadingType, string> = {
  assignment: 'Devoir',
  research: 'Recherche',
  normal: 'Lecture normale',
};

const readingTypeColors: Record<ReadingType, string> = {
  assignment: 'hsl(25, 95%, 53%)',
  research: 'hsl(174, 72%, 40%)',
  normal: 'hsl(262, 83%, 58%)',
};

export default function ReadingSessions() {
  const { 
    readingSessions, 
    classReadingSessions,
    participants, 
    books,
    classes,
    addReadingSession, 
    updateReadingSession, 
    deleteReadingSession,
    deleteClassReadingSession,
    getParticipantById,
    getBookById,
    getClassById,
  } = useAuditedLibraryStore();
  const isLoading = useInitialLoading(400);

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ReadingType>('all');
  const [participantFilter, setParticipantFilter] = useState<string>('all');
  const [bookFilter, setBookFilter] = useState<string>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [showStats, setShowStats] = useState(true);
  const [activeTab, setActiveTab] = useState('individual');

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [classDialogOpen, setClassDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ReadingSession | null>(null);
  const [selectedClassSession, setSelectedClassSession] = useState<ClassReadingSession | null>(null);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return readingSessions.filter(session => {
      const participant = getParticipantById(session.participantId);
      const book = getBookById(session.bookId);
      
      const matchesSearch = searchQuery === '' || 
        `${participant?.firstName} ${participant?.lastName} ${book?.title} ${session.notes || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'all' || session.readingType === typeFilter;
      const matchesParticipant = participantFilter === 'all' || session.participantId === participantFilter;
      const matchesBook = bookFilter === 'all' || session.bookId === bookFilter;
      
      return matchesSearch && matchesType && matchesParticipant && matchesBook;
    }).sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
  }, [readingSessions, searchQuery, typeFilter, participantFilter, bookFilter, getParticipantById, getBookById]);

  // Pagination for individual sessions
  const sessionsPagination = usePagination({ data: filteredSessions, itemsPerPage: 10 });

  // Filtered class sessions
  const filteredClassSessions = useMemo(() => {
    return classReadingSessions.filter(session => {
      const schoolClass = getClassById(session.classId);
      
      const matchesSearch = searchQuery === '' || 
        `${schoolClass?.name} ${session.notes || ''}`.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesClass = classFilter === 'all' || session.classId === classFilter;
      
      return matchesSearch && matchesClass;
    }).sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime());
  }, [classReadingSessions, searchQuery, classFilter, getClassById]);

  // Pagination for class sessions
  const classSessionsPagination = usePagination({ data: filteredClassSessions, itemsPerPage: 10 });

  // Stats calculations
  const stats = useMemo(() => {
    const total = readingSessions.length;
    const classSessionsCount = classReadingSessions.length;
    const thisMonth = readingSessions.filter(s => {
      const date = new Date(s.sessionDate);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;

    // Most active participant
    const participantCounts: Record<string, number> = {};
    readingSessions.forEach(s => {
      participantCounts[s.participantId] = (participantCounts[s.participantId] || 0) + 1;
    });
    const mostActiveId = Object.entries(participantCounts).sort((a, b) => b[1] - a[1])[0];
    const mostActiveParticipant = mostActiveId ? getParticipantById(mostActiveId[0]) : null;

    // Most read book
    const bookCounts: Record<string, number> = {};
    readingSessions.forEach(s => {
      bookCounts[s.bookId] = (bookCounts[s.bookId] || 0) + 1;
    });
    const mostReadId = Object.entries(bookCounts).sort((a, b) => b[1] - a[1])[0];
    const mostReadBook = mostReadId ? getBookById(mostReadId[0]) : null;

    // Most active class
    const classCounts: Record<string, number> = {};
    classReadingSessions.forEach(s => {
      classCounts[s.classId] = (classCounts[s.classId] || 0) + s.attendeeCount;
    });
    const mostActiveClassId = Object.entries(classCounts).sort((a, b) => b[1] - a[1])[0];
    const mostActiveClass = mostActiveClassId ? getClassById(mostActiveClassId[0]) : null;

    return {
      total,
      classSessionsCount,
      thisMonth,
      mostActiveParticipant: mostActiveParticipant ? `${mostActiveParticipant.firstName} ${mostActiveParticipant.lastName}` : '-',
      mostActiveCount: mostActiveId ? mostActiveId[1] : 0,
      mostReadBook: mostReadBook?.title || '-',
      mostReadCount: mostReadId ? mostReadId[1] : 0,
      mostActiveClass: mostActiveClass?.name || '-',
      mostActiveClassCount: mostActiveClassId ? mostActiveClassId[1] : 0,
    };
  }, [readingSessions, classReadingSessions, getParticipantById, getBookById, getClassById]);

  if (isLoading) {
    return (
      <AdminLayout>
        <PageSkeleton statsCount={5} tableColumns={6} />
      </AdminLayout>
    );
  }

  const handleAdd = () => {
    setSelectedSession(null);
    setFormDialogOpen(true);
  };

  const handleAddClass = () => {
    setClassDialogOpen(true);
  };

  const handleEdit = (session: ReadingSession) => {
    setSelectedSession(session);
    setFormDialogOpen(true);
  };

  const handleDelete = (session: ReadingSession) => {
    setSelectedSession(session);
    setSelectedClassSession(null);
    setDeleteDialogOpen(true);
  };

  const handleDeleteClassSession = (session: ClassReadingSession) => {
    setSelectedClassSession(session);
    setSelectedSession(null);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: { participantId: string; bookId: string; sessionDate: string; readingType: ReadingType; notes?: string }) => {
    if (selectedSession) {
      updateReadingSession(selectedSession.id, data);
      toast.success('Session modifiée');
    } else {
      addReadingSession(data);
      toast.success('Session enregistrée');
    }
  };

  const handleConfirmDelete = () => {
    if (selectedSession) {
      deleteReadingSession(selectedSession.id);
      toast.success('Session supprimée');
    } else if (selectedClassSession) {
      deleteClassReadingSession(selectedClassSession.id);
      toast.success('Session de classe supprimée');
    }
    setDeleteDialogOpen(false);
  };

  const handleClassSessionSuccess = () => {
    toast.success('Session de classe enregistrée');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Sessions de lecture</h1>
            <p className="text-muted-foreground mt-1">
              {filteredSessions.length} session{filteredSessions.length > 1 ? 's' : ''} enregistrée{filteredSessions.length > 1 ? 's' : ''}
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
            <Button variant="outline" onClick={handleAddClass}>
              <UsersRound className="h-4 w-4 mr-2" />
              Session de classe
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle session
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {showStats && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Sessions individuelles"
              value={stats.total}
              icon={<BookOpenCheck className="h-5 w-5" />}
            />
            <StatCard
              title="Sessions de classe"
              value={stats.classSessionsCount}
              icon={<UsersRound className="h-5 w-5" />}
            />
            <StatCard
              title="Ce mois-ci"
              value={stats.thisMonth}
              icon={<Calendar className="h-5 w-5" />}
            />
            <StatCard
              title="Participant le plus actif"
              value={stats.mostActiveParticipant}
              subtitle={stats.mostActiveCount > 0 ? `${stats.mostActiveCount} session${stats.mostActiveCount > 1 ? 's' : ''}` : undefined}
              icon={<Users className="h-5 w-5" />}
            />
            <StatCard
              title="Classe la plus active"
              value={stats.mostActiveClass}
              subtitle={stats.mostActiveClassCount > 0 ? `${stats.mostActiveClassCount} lectures` : undefined}
              icon={<UsersRound className="h-5 w-5" />}
            />
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4" />
              Sessions individuelles
            </TabsTrigger>
            <TabsTrigger value="class" className="flex items-center gap-2">
              <UsersRound className="h-4 w-4" />
              Sessions de classe
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual" className="space-y-4 mt-4">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | ReadingType)}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      {(['normal', 'assignment', 'research'] as ReadingType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-2 w-2 rounded-full" 
                              style={{ backgroundColor: readingTypeColors[type] }}
                            />
                            {readingTypeLabels[type]}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={participantFilter} onValueChange={setParticipantFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Participant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les participants</SelectItem>
                      {participants.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.firstName} {p.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={bookFilter} onValueChange={setBookFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Livre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les livres</SelectItem>
                      {books.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Sessions Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead>Livre</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionsPagination.paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <BookOpenCheck className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Aucune session de lecture</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sessionsPagination.paginatedData.map((session) => {
                        const participant = getParticipantById(session.participantId);
                        const book = getBookById(session.bookId);
                        
                        return (
                          <TableRow key={session.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {format(new Date(session.sessionDate), 'dd/MM/yyyy')}
                                {session.classSessionId && (
                                  <Badge variant="secondary" className="text-xs">
                                    <UsersRound className="h-3 w-3 mr-1" />
                                    Classe
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{participant?.firstName} {participant?.lastName}</p>
                                <p className="text-xs text-muted-foreground font-mono">{participant?.participantNumber}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{book?.title}</p>
                                <p className="text-xs text-muted-foreground">{book?.author}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                style={{
                                  borderColor: readingTypeColors[session.readingType],
                                  color: readingTypeColors[session.readingType],
                                }}
                              >
                                {readingTypeLabels[session.readingType]}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <p className="text-sm text-muted-foreground truncate">
                                {session.notes || '-'}
                              </p>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(session)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(session)}>
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  currentPage={sessionsPagination.currentPage}
                  totalPages={sessionsPagination.totalPages}
                  totalItems={sessionsPagination.totalItems}
                  startIndex={sessionsPagination.startIndex}
                  endIndex={sessionsPagination.endIndex}
                  itemsPerPage={sessionsPagination.itemsPerPage}
                  onPageChange={sessionsPagination.goToPage}
                  onItemsPerPageChange={sessionsPagination.setItemsPerPage}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="class" className="space-y-4 mt-4">
            {/* Class Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Classe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les classes</SelectItem>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Class Sessions Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Présents</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classSessionsPagination.paginatedData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <UsersRound className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Aucune session de classe</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      classSessionsPagination.paginatedData.map((session) => {
                        const schoolClass = getClassById(session.classId);
                        
                        return (
                          <TableRow key={session.id}>
                            <TableCell>
                              {format(new Date(session.sessionDate), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{schoolClass?.name}</p>
                                <p className="text-xs text-muted-foreground">{schoolClass?.monitorName}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {session.attendeeCount} présent{session.attendeeCount > 1 ? 's' : ''}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={session.sessionType === 'detailed' ? 'default' : 'outline'}>
                                {session.sessionType === 'detailed' ? 'Détaillé' : 'Rapide'}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <p className="text-sm text-muted-foreground truncate">
                                {session.notes || '-'}
                              </p>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteClassSession(session)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  currentPage={classSessionsPagination.currentPage}
                  totalPages={classSessionsPagination.totalPages}
                  totalItems={classSessionsPagination.totalItems}
                  startIndex={classSessionsPagination.startIndex}
                  endIndex={classSessionsPagination.endIndex}
                  itemsPerPage={classSessionsPagination.itemsPerPage}
                  onPageChange={classSessionsPagination.goToPage}
                  onItemsPerPageChange={classSessionsPagination.setItemsPerPage}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ReadingSessionFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        session={selectedSession}
        onSubmit={handleFormSubmit}
      />

      <ClassReadingSessionDialog
        open={classDialogOpen}
        onOpenChange={setClassDialogOpen}
        onSuccess={handleClassSessionSuccess}
      />

      <DeleteReadingSessionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        session={selectedSession}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}
