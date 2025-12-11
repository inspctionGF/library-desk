import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useLibraryStore } from '@/hooks/useLibraryStore';
import { StartInventoryDialog } from '@/components/inventory/StartInventoryDialog';
import { InventoryBookCard } from '@/components/inventory/InventoryBookCard';
import { CompleteInventoryDialog } from '@/components/inventory/CompleteInventoryDialog';
import { DeleteInventoryDialog } from '@/components/inventory/DeleteInventoryDialog';
import { ClipboardCheck, Plus, Search, PackageCheck, AlertTriangle, CheckCircle2, Clock, Calendar, Trash2, Eye, CheckCheck, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

export default function Inventory() {
  const { 
    getActiveInventory, 
    getInventoryHistory, 
    getInventoryItems, 
    getInventoryStats,
    getBookById,
    cancelInventorySession,
    batchUpdateInventoryItems,
  } = useLibraryStore();

  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewHistoryId, setViewHistoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'checked' | 'discrepancy'>('all');
  
  // Batch selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const activeInventory = getActiveInventory();
  const inventoryHistory = getInventoryHistory();

  const activeItems = activeInventory ? getInventoryItems(activeInventory.id) : [];
  const activeStats = activeInventory ? getInventoryStats(activeInventory.id) : null;

  // Filter items
  const filteredItems = activeItems.filter(item => {
    const book = getBookById(item.bookId);
    if (!book) return false;
    
    const matchesSearch = searchQuery === '' || 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery);
    
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const handleCancelInventory = () => {
    if (activeInventory) {
      cancelInventorySession(activeInventory.id);
    }
  };

  const handleSelectionChange = (itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const pendingItems = filteredItems.filter(item => item.status === 'pending');
    if (selectedItems.size === pendingItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(pendingItems.map(item => item.id)));
    }
  };

  const handleBatchVerify = () => {
    if (selectedItems.size === 0) return;
    batchUpdateInventoryItems(Array.from(selectedItems), true);
    toast.success(`${selectedItems.size} livre(s) vérifié(s) avec succès`);
    setSelectedItems(new Set());
    setSelectionMode(false);
  };

  const handleExitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedItems(new Set());
  };

  const pendingFilteredItems = filteredItems.filter(item => item.status === 'pending');

  const viewHistorySession = viewHistoryId 
    ? inventoryHistory.find(s => s.id === viewHistoryId) 
    : null;
  const viewHistoryItems = viewHistoryId ? getInventoryItems(viewHistoryId) : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventaire</h1>
            <p className="text-muted-foreground">
              Gérez vos inventaires physiques de livres
            </p>
          </div>
          {!activeInventory && (
            <Button onClick={() => setStartDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Démarrer un inventaire
            </Button>
          )}
        </div>

        {/* Active Inventory */}
        {activeInventory && activeStats ? (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <ClipboardCheck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Progression</p>
                      <p className="text-2xl font-bold">{activeStats.progress}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">En attente</p>
                      <p className="text-2xl font-bold">{activeStats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-green-500/10 p-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vérifiés</p>
                      <p className="text-2xl font-bold">{activeStats.checked}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-500/10 p-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Écarts</p>
                      <p className="text-2xl font-bold">{activeStats.discrepancy}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Session Info */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {activeInventory.name}
                      <Badge variant={activeInventory.type === 'annual' ? 'default' : 'secondary'}>
                        {activeInventory.type === 'annual' ? 'Annuel' : 'Ponctuel'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Commencé le {format(new Date(activeInventory.startDate), 'd MMMM yyyy', { locale: fr })}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCancelInventory}>
                      Annuler
                    </Button>
                    <Button size="sm" onClick={() => setCompleteDialogOpen(true)} disabled={activeStats.pending > 0}>
                      <PackageCheck className="mr-2 h-4 w-4" />
                      Finaliser
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progression globale</span>
                    <span className="font-medium">{activeStats.progress}% ({activeStats.total - activeStats.pending}/{activeStats.total})</span>
                  </div>
                  <Progress value={activeStats.progress} className="h-2" />
                  {activeStats.missingBooks > 0 && (
                    <p className="text-sm text-orange-500 mt-2">
                      <AlertTriangle className="inline h-4 w-4 mr-1" />
                      {activeStats.missingBooks} livre(s) manquant(s) détecté(s)
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Search, Filter and Batch Actions */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par titre, auteur ou ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)} className="w-full sm:w-auto">
                    <TabsList>
                      <TabsTrigger value="all">Tous</TabsTrigger>
                      <TabsTrigger value="pending">En attente</TabsTrigger>
                      <TabsTrigger value="checked">Vérifiés</TabsTrigger>
                      <TabsTrigger value="discrepancy">Écarts</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  {!selectionMode ? (
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectionMode(true)}
                      disabled={pendingFilteredItems.length === 0}
                    >
                      <CheckCheck className="mr-2 h-4 w-4" />
                      Sélection multiple
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleExitSelectionMode}>
                      <X className="mr-2 h-4 w-4" />
                      Annuler
                    </Button>
                  )}
                </div>
              </div>

              {/* Batch Action Bar */}
              {selectionMode && (
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={pendingFilteredItems.length > 0 && selectedItems.size === pendingFilteredItems.length}
                            onCheckedChange={handleSelectAll}
                          />
                          <span className="text-sm font-medium">
                            {selectedItems.size > 0 
                              ? `${selectedItems.size} livre(s) sélectionné(s)` 
                              : 'Sélectionner tous les livres en attente'}
                          </span>
                        </div>
                      </div>
                      <Button 
                        onClick={handleBatchVerify} 
                        disabled={selectedItems.size === 0}
                        size="sm"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Vérifier la sélection
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Les livres sélectionnés seront marqués comme vérifiés avec la quantité attendue.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Book List */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredItems.map(item => (
                <InventoryBookCard 
                  key={item.id} 
                  item={item}
                  selectionMode={selectionMode && item.status === 'pending'}
                  isSelected={selectedItems.has(item.id)}
                  onSelectionChange={handleSelectionChange}
                />
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Aucun livre ne correspond à votre recherche
              </div>
            )}
          </div>
        ) : (
          /* No Active Inventory - Show History */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Historique des inventaires</CardTitle>
                <CardDescription>
                  Consultez vos inventaires précédents
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inventoryHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Aucun inventaire précédent</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Démarrez votre premier inventaire pour suivre vos stocks
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inventoryHistory.map(session => {
                      const stats = getInventoryStats(session.id);
                      return (
                        <div key={session.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{session.name}</span>
                              <Badge variant={session.status === 'completed' ? 'default' : 'destructive'}>
                                {session.status === 'completed' ? 'Terminé' : 'Annulé'}
                              </Badge>
                              <Badge variant="outline">
                                {session.type === 'annual' ? 'Annuel' : 'Ponctuel'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(session.startDate), 'd MMM yyyy', { locale: fr })}
                                {session.endDate && ` - ${format(new Date(session.endDate), 'd MMM yyyy', { locale: fr })}`}
                              </span>
                              <span>{stats.total} livres</span>
                              {stats.discrepancy > 0 && (
                                <span className="text-orange-500">{stats.discrepancy} écarts</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setViewHistoryId(session.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => {
                              setViewHistoryId(session.id);
                              setDeleteDialogOpen(true);
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <StartInventoryDialog open={startDialogOpen} onOpenChange={setStartDialogOpen} />
      
      {activeInventory && (
        <CompleteInventoryDialog 
          open={completeDialogOpen} 
          onOpenChange={setCompleteDialogOpen}
          session={activeInventory}
        />
      )}

      {viewHistoryId && (
        <DeleteInventoryDialog
          open={deleteDialogOpen}
          onOpenChange={(open) => {
            setDeleteDialogOpen(open);
            if (!open) setViewHistoryId(null);
          }}
          sessionId={viewHistoryId}
        />
      )}

      {/* View History Dialog */}
      <Dialog open={!!viewHistorySession && !deleteDialogOpen} onOpenChange={(open) => !open && setViewHistoryId(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewHistorySession?.name}</DialogTitle>
            <DialogDescription>
              {viewHistorySession && format(new Date(viewHistorySession.startDate), 'd MMMM yyyy', { locale: fr })}
              {viewHistorySession?.endDate && ` - ${format(new Date(viewHistorySession.endDate), 'd MMMM yyyy', { locale: fr })}`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-2">
              {viewHistoryItems.map(item => {
                const book = getBookById(item.bookId);
                if (!book) return null;
                return (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{book.title}</p>
                      <p className="text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={item.status === 'checked' ? 'default' : item.status === 'discrepancy' ? 'destructive' : 'secondary'}>
                        {item.foundQuantity ?? '-'} / {item.expectedQuantity}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}