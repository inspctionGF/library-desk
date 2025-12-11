import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuditedLibraryStore } from '@/hooks/useAuditedLibraryStore';
import { BookIssue, BookIssueType, BookIssueStatus } from '@/hooks/useLibraryStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TablePagination } from '@/components/ui/table-pagination';
import { usePagination } from '@/hooks/usePagination';
import { StatCard } from '@/components/dashboard/StatCard';
import { BookIssueFormDialog } from '@/components/book-issues/BookIssueFormDialog';
import { ResolveIssueDialog } from '@/components/book-issues/ResolveIssueDialog';
import { DeleteIssueDialog } from '@/components/book-issues/DeleteIssueDialog';
import { Plus, Search, AlertTriangle, CheckCircle, XCircle, BookX, Eye, EyeOff } from 'lucide-react';

const issueTypeLabels: Record<BookIssueType, string> = {
  not_returned: 'Non retourné',
  damaged: 'Endommagé',
  torn: 'Déchiré',
  lost: 'Perdu',
  other: 'Autre',
};

const issueTypeColors: Record<BookIssueType, string> = {
  not_returned: 'bg-destructive text-destructive-foreground',
  damaged: 'bg-orange-500 text-white',
  torn: 'bg-yellow-500 text-white',
  lost: 'bg-secondary text-secondary-foreground',
  other: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<BookIssueStatus, string> = {
  open: 'Ouvert',
  resolved: 'Résolu',
  written_off: 'Radié',
};

const statusColors: Record<BookIssueStatus, string> = {
  open: 'bg-primary text-primary-foreground',
  resolved: 'bg-green-500 text-white',
  written_off: 'bg-secondary text-secondary-foreground',
};

export default function BookIssues() {
  const { bookIssues, getBookById, getBookIssueStats } = useAuditedLibraryStore();
  const stats = getBookIssueStats();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showStats, setShowStats] = useState(true);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<BookIssue | null>(null);
  const [resolvingIssue, setResolvingIssue] = useState<BookIssue | null>(null);
  const [deletingIssue, setDeletingIssue] = useState<BookIssue | null>(null);

  const filteredIssues = useMemo(() => {
    return bookIssues.filter(issue => {
      const book = getBookById(issue.bookId);
      const bookTitle = book?.title?.toLowerCase() || '';
      const borrowerName = issue.borrowerName?.toLowerCase() || '';
      const search = searchQuery.toLowerCase();

      const matchesSearch = bookTitle.includes(search) || borrowerName.includes(search);
      const matchesType = filterType === 'all' || issue.issueType === filterType;
      const matchesStatus = filterStatus === 'all' || issue.status === filterStatus;

      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  }, [bookIssues, searchQuery, filterType, filterStatus, getBookById]);

  const pagination = usePagination({ data: filteredIssues, itemsPerPage: 10 });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Livres non retournés</h1>
            <p className="text-muted-foreground">Suivi des livres manquants, endommagés ou non retournés</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Signaler un problème
          </Button>
        </div>

        {/* Stats Toggle */}
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => setShowStats(!showStats)}>
            {showStats ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showStats ? 'Masquer stats' : 'Afficher stats'}
          </Button>
        </div>

        {/* Stats Cards */}
        {showStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total signalements"
              value={stats.total}
              icon={<BookX className="h-5 w-5" />}
              subtitle="Tous les problèmes signalés"
            />
            <StatCard
              title="Problèmes ouverts"
              value={stats.open}
              icon={<AlertTriangle className="h-5 w-5" />}
              subtitle="En attente de résolution"
              variant="accent"
            />
            <StatCard
              title="Résolus"
              value={stats.resolved}
              icon={<CheckCircle className="h-5 w-5" />}
              subtitle="Problèmes réglés"
              variant="success"
            />
            <StatCard
              title="Radiés"
              value={stats.writtenOff}
              icon={<XCircle className="h-5 w-5" />}
              subtitle="Pertes acceptées"
            />
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par livre ou emprunteur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Type de problème" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="not_returned">Non retourné</SelectItem>
                  <SelectItem value="damaged">Endommagé</SelectItem>
                  <SelectItem value="torn">Déchiré</SelectItem>
                  <SelectItem value="lost">Perdu</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="open">Ouvert</SelectItem>
                  <SelectItem value="resolved">Résolu</SelectItem>
                  <SelectItem value="written_off">Radié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Issues Table */}
        <Card>
          <CardHeader>
            <CardTitle>Signalements ({filteredIssues.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredIssues.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BookX className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucun signalement trouvé</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Livre</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Qté</TableHead>
                      <TableHead>Emprunteur</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pagination.paginatedData.map((issue: BookIssue) => {
                      const book = getBookById(issue.bookId);
                      return (
                        <TableRow key={issue.id}>
                          <TableCell className="font-medium">{book?.title || 'Livre inconnu'}</TableCell>
                          <TableCell>
                            <Badge className={issueTypeColors[issue.issueType]}>
                              {issueTypeLabels[issue.issueType]}
                            </Badge>
                          </TableCell>
                          <TableCell>{issue.quantity}</TableCell>
                          <TableCell>{issue.borrowerName || '-'}</TableCell>
                          <TableCell>{new Date(issue.reportDate).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>
                            <Badge className={statusColors[issue.status]}>
                              {statusLabels[issue.status]}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {issue.status === 'open' && (
                              <Button variant="outline" size="sm" onClick={() => setResolvingIssue(issue)}>
                                Résoudre
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => setEditingIssue(issue)}>
                              Modifier
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeletingIssue(issue)}>
                              Supprimer
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                <TablePagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={pagination.goToPage}
                  totalItems={pagination.totalItems}
                  startIndex={pagination.startIndex}
                  endIndex={pagination.endIndex}
                  itemsPerPage={pagination.itemsPerPage}
                  onItemsPerPageChange={pagination.setItemsPerPage}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <BookIssueFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />

      <BookIssueFormDialog
        open={!!editingIssue}
        onOpenChange={(open) => !open && setEditingIssue(null)}
        issue={editingIssue}
      />

      <ResolveIssueDialog
        open={!!resolvingIssue}
        onOpenChange={(open) => !open && setResolvingIssue(null)}
        issue={resolvingIssue}
      />

      <DeleteIssueDialog
        open={!!deletingIssue}
        onOpenChange={(open) => !open && setDeletingIssue(null)}
        issue={deletingIssue}
      />
    </AdminLayout>
  );
}
