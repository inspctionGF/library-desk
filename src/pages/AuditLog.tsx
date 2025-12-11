import { useState, useEffect } from 'react';
import { FileText, Download, Filter, Calendar, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuditLog, type AuditEntry, type AuditModule, type AuditAction } from '@/hooks/useAuditLog';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { usePagination } from '@/hooks/usePagination';
import { TablePagination } from '@/components/ui/table-pagination';
import { toast } from 'sonner';

const moduleLabels: Record<AuditModule, string> = {
  auth: 'Authentification',
  books: 'Livres',
  loans: 'Prêts',
  participants: 'Participants',
  classes: 'Classes',
  categories: 'Catégories',
  materials: 'Matériels',
  reading_sessions: 'Sessions lecture',
  book_issues: 'Problèmes livres',
  inventory: 'Inventaire',
  config: 'Configuration',
  other_readers: 'Autres lecteurs',
  extra_activities: 'Activités extra',
  system: 'Système',
};

const actionLabels: Record<AuditAction, string> = {
  login: 'Connexion',
  login_failed: 'Échec connexion',
  logout: 'Déconnexion',
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  export: 'Export',
  import: 'Import',
  backup: 'Sauvegarde',
  restore: 'Restauration',
  config_change: 'Changement config',
  pin_change: 'Changement PIN',
  loan_create: 'Nouveau prêt',
  loan_return: 'Retour',
  loan_renew: 'Renouvellement',
  issue_report: 'Signalement',
  issue_resolve: 'Résolution',
  inventory_start: 'Début inventaire',
  inventory_complete: 'Fin inventaire',
};

const modules: AuditModule[] = [
  'auth', 'books', 'loans', 'participants', 'classes', 'categories',
  'materials', 'reading_sessions', 'book_issues', 'inventory',
  'config', 'other_readers', 'extra_activities', 'system'
];

const actions: AuditAction[] = [
  'login', 'login_failed', 'logout', 'create', 'update', 'delete',
  'export', 'import', 'backup', 'restore', 'config_change', 'pin_change',
  'loan_create', 'loan_return', 'loan_renew', 'issue_report', 'issue_resolve',
  'inventory_start', 'inventory_complete'
];

export default function AuditLog() {
  const { config } = useSystemConfig();
  const { getAuditLog, verifyIntegrity, exportAuditLog, getStatistics } = useAuditLog();
  
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<AuditEntry[]>([]);
  const [auditIntegrity, setAuditIntegrity] = useState<{ isValid: boolean; invalidIndex: number | null; totalEntries: number } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [stats, setStats] = useState(getStatistics());
  
  // Filters
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const pagination = usePagination({ data: filteredEntries, itemsPerPage: 20 });

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = entries;

    if (moduleFilter !== 'all') {
      filtered = filtered.filter(e => e.module === moduleFilter);
    }

    if (actionFilter !== 'all') {
      filtered = filtered.filter(e => e.action === actionFilter);
    }

    if (startDate) {
      filtered = filtered.filter(e => new Date(e.timestamp) >= new Date(startDate));
    }

    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      filtered = filtered.filter(e => new Date(e.timestamp) <= endDateObj);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(e => 
        e.details.toLowerCase().includes(search) ||
        e.action.toLowerCase().includes(search) ||
        e.module.toLowerCase().includes(search)
      );
    }

    setFilteredEntries(filtered);
  }, [entries, moduleFilter, actionFilter, startDate, endDate, searchTerm]);

  const loadData = async () => {
    setIsVerifying(true);
    const allEntries = getAuditLog();
    setEntries(allEntries);
    setFilteredEntries(allEntries);
    const integrity = await verifyIntegrity();
    setAuditIntegrity(integrity);
    setStats(getStatistics());
    setIsVerifying(false);
  };

  const handleExport = async () => {
    await exportAuditLog(config.cdejNumber);
    toast.success('Journal d\'audit exporté');
  };

  const handleClearFilters = () => {
    setModuleFilter('all');
    setActionFilter('all');
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
  };

  const hasActiveFilters = moduleFilter !== 'all' || actionFilter !== 'all' || startDate || endDate || searchTerm;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Journal d'Audit</h1>
            <p className="text-muted-foreground">
              Historique complet des actions système avec vérification cryptographique
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} disabled={isVerifying}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isVerifying ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total entrées</CardDescription>
              <CardTitle className="text-3xl">{stats.totalEntries}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Intégrité</CardDescription>
              <CardTitle className="flex items-center gap-2">
                {isVerifying ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : auditIntegrity?.isValid ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-success" />
                    <span className="text-success">Valide</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="text-destructive">Altéré</span>
                  </>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Première entrée</CardDescription>
              <CardTitle className="text-lg">
                {stats.firstEntry 
                  ? new Date(stats.firstEntry).toLocaleDateString('fr-FR')
                  : '-'
                }
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Dernière entrée</CardDescription>
              <CardTitle className="text-lg">
                {stats.lastEntry 
                  ? new Date(stats.lastEntry).toLocaleDateString('fr-FR')
                  : '-'
                }
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-4 w-4" />
              Filtres
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="space-y-2">
                <Label>Recherche</Label>
                <Input
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Module</Label>
                <Select value={moduleFilter} onValueChange={setModuleFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les modules</SelectItem>
                    {modules.map(m => (
                      <SelectItem key={m} value={m}>{moduleLabels[m]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Action</Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les actions</SelectItem>
                    {actions.map(a => (
                      <SelectItem key={a} value={a}>{actionLabels[a]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date début</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Date fin</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            {hasActiveFilters && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredEntries.length} résultat(s) sur {entries.length}
                </p>
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  Effacer les filtres
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Entries Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Historique des actions
            </CardTitle>
            <CardDescription>
              Liste complète des actions enregistrées dans le système
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredEntries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune entrée d'audit trouvée</p>
                <p className="text-sm">Les actions système seront enregistrées automatiquement</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Date/Heure</TableHead>
                        <TableHead className="w-[120px]">Module</TableHead>
                        <TableHead className="w-[140px]">Action</TableHead>
                        <TableHead>Détails</TableHead>
                        <TableHead className="w-[100px]">Utilisateur</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagination.paginatedData.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-mono text-xs">
                            {new Date(entry.timestamp).toLocaleString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {moduleLabels[entry.module as AuditModule] || entry.module}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {actionLabels[entry.action as AuditAction] || entry.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[300px] truncate" title={entry.details}>
                            {entry.details}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {entry.userId}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <TablePagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={pagination.goToPage}
                  itemsPerPage={pagination.itemsPerPage}
                  onItemsPerPageChange={pagination.setItemsPerPage}
                  totalItems={pagination.totalItems}
                  startIndex={pagination.startIndex}
                  endIndex={pagination.endIndex}
                />
              </>
            )}
          </CardContent>
        </Card>

        {/* Integrity Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">À propos de l'intégrité</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              Le journal d'audit utilise une <strong>chaîne de hachage SHA-256</strong> pour garantir 
              l'intégrité des données. Chaque entrée contient le hash de l'entrée précédente, formant 
              une chaîne inaltérable.
            </p>
            <p>
              Si une entrée est modifiée ou supprimée, la vérification d'intégrité détectera 
              l'altération et affichera un avertissement.
            </p>
            <p>
              L'export JSON inclut toutes les métadonnées de vérification pour permettre un audit 
              indépendant.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
