import { useState } from 'react';
import { Package, Building2, HandCoins, Plus, Search, Filter, X, Settings2 } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuditedLibraryStore } from '@/hooks/useAuditedLibraryStore';
import MaterialCard from '@/components/materials/MaterialCard';
import MaterialFormDialog from '@/components/materials/MaterialFormDialog';
import MaterialTypeFormDialog from '@/components/materials/MaterialTypeFormDialog';
import DeleteMaterialDialog from '@/components/materials/DeleteMaterialDialog';
import EntityCard from '@/components/materials/EntityCard';
import EntityFormDialog from '@/components/materials/EntityFormDialog';
import DeleteEntityDialog from '@/components/materials/DeleteEntityDialog';
import MaterialLoanFormDialog from '@/components/materials/MaterialLoanFormDialog';
import ReturnMaterialLoanDialog from '@/components/materials/ReturnMaterialLoanDialog';
import RenewMaterialLoanDialog from '@/components/materials/RenewMaterialLoanDialog';
import { useInitialLoading } from '@/hooks/useLoadingState';
import { TabsPageSkeleton } from '@/components/skeletons';

const Materials = () => {
  const {
    materials,
    materialTypes,
    entities,
    materialLoans,
    getMaterialTypeById,
    getMaterialById,
    getEntityById,
    getParticipantById,
    participants,
    getMaterialLoanStats,
  } = useAuditedLibraryStore();
  const isLoading = useInitialLoading(400);

  if (isLoading) {
    return (
      <AdminLayout>
        <TabsPageSkeleton />
      </AdminLayout>
    );
  }

  const [activeTab, setActiveTab] = useState('materials');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [entitySearchQuery, setEntitySearchQuery] = useState('');
  const [loanSearchQuery, setLoanSearchQuery] = useState('');
  const [loanStatusFilter, setLoanStatusFilter] = useState<string>('active');

  // Dialogs
  const [materialFormOpen, setMaterialFormOpen] = useState(false);
  const [materialTypeFormOpen, setMaterialTypeFormOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState<any>(null);
  const [editMaterialType, setEditMaterialType] = useState<any>(null);
  const [deleteMaterial, setDeleteMaterial] = useState<any>(null);

  const [entityFormOpen, setEntityFormOpen] = useState(false);
  const [editEntity, setEditEntity] = useState<any>(null);
  const [deleteEntity, setDeleteEntity] = useState<any>(null);

  const [loanFormOpen, setLoanFormOpen] = useState(false);
  const [returnLoan, setReturnLoan] = useState<any>(null);
  const [renewLoan, setRenewLoan] = useState<any>(null);

  // Filter materials
  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === 'all' || m.materialTypeId === typeFilter;
    const matchesAvailability = availabilityFilter === 'all' ||
      (availabilityFilter === 'available' && m.availableQuantity > 0) ||
      (availabilityFilter === 'unavailable' && m.availableQuantity === 0);
    return matchesSearch && matchesType && matchesAvailability;
  });

  // Filter entities
  const filteredEntities = entities.filter(e =>
    e.name.toLowerCase().includes(entitySearchQuery.toLowerCase()) ||
    (e.contactName?.toLowerCase().includes(entitySearchQuery.toLowerCase()))
  );

  // Filter loans
  const filteredLoans = materialLoans.filter(loan => {
    const material = getMaterialById(loan.materialId);
    const matchesSearch = loan.borrowerName.toLowerCase().includes(loanSearchQuery.toLowerCase()) ||
      material?.name.toLowerCase().includes(loanSearchQuery.toLowerCase());
    const today = new Date().toISOString().split('T')[0];
    const isOverdue = loan.status !== 'returned' && loan.dueDate < today;
    const currentStatus = loan.status === 'returned' ? 'returned' : (isOverdue ? 'overdue' : 'active');
    const matchesStatus = loanStatusFilter === 'all' || currentStatus === loanStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalMaterials = materials.reduce((sum, m) => sum + m.quantity, 0);
  const availableMaterials = materials.reduce((sum, m) => sum + m.availableQuantity, 0);
  const onLoan = totalMaterials - availableMaterials;
  const loanStats = getMaterialLoanStats();

  const activeFilters = (typeFilter !== 'all' ? 1 : 0) + (availabilityFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setTypeFilter('all');
    setAvailabilityFilter('all');
    setSearchQuery('');
  };

  const handleEditMaterial = (material: any) => {
    setEditMaterial(material);
    setMaterialFormOpen(true);
  };

  const handleEditEntity = (entity: any) => {
    setEditEntity(entity);
    setEntityFormOpen(true);
  };

  const handleEditMaterialType = (type: any) => {
    setEditMaterialType(type);
    setMaterialTypeFormOpen(true);
  };

  return (
    <AdminLayout>
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Matériels</h1>
          <p className="text-muted-foreground">Gérez les matériels et leurs prêts</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="materials" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Matériels
          </TabsTrigger>
          <TabsTrigger value="entities" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Entités
          </TabsTrigger>
          <TabsTrigger value="loans" className="flex items-center gap-2">
            <HandCoins className="h-4 w-4" />
            Prêts
          </TabsTrigger>
        </TabsList>

        {/* Materials Tab */}
        <TabsContent value="materials" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalMaterials}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{availableMaterials}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">En prêt</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{onLoan}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{materialTypes.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Material Types */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Types de matériels</CardTitle>
              <Button variant="outline" size="sm" onClick={() => { setEditMaterialType(null); setMaterialTypeFormOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau type
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {materialTypes.map(type => (
                  <Badge
                    key={type.id}
                    variant="secondary"
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: type.color, color: 'white' }}
                    onClick={() => handleEditMaterialType(type)}
                  >
                    {type.name}
                    <span className="ml-1 opacity-75">
                      ({materials.filter(m => m.materialTypeId === type.id).length})
                    </span>
                  </Badge>
                ))}
                {materialTypes.length === 0 && (
                  <p className="text-sm text-muted-foreground">Aucun type défini</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un matériel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {materialTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Disponibilité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="available">Disponibles</SelectItem>
                <SelectItem value="unavailable">Indisponibles</SelectItem>
              </SelectContent>
            </Select>
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Effacer ({activeFilters})
              </Button>
            )}
            <Button onClick={() => { setEditMaterial(null); setMaterialFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau matériel
            </Button>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMaterials.map(material => (
              <MaterialCard
                key={material.id}
                material={material}
                materialType={getMaterialTypeById(material.materialTypeId)}
                onEdit={() => handleEditMaterial(material)}
                onDelete={() => setDeleteMaterial(material)}
                onLoan={() => setLoanFormOpen(true)}
              />
            ))}
            {filteredMaterials.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Aucun matériel trouvé
              </div>
            )}
          </div>
        </TabsContent>

        {/* Entities Tab */}
        <TabsContent value="entities" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une entité..."
                value={entitySearchQuery}
                onChange={(e) => setEntitySearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => { setEditEntity(null); setEntityFormOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle entité
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEntities.map(entity => (
              <EntityCard
                key={entity.id}
                entity={entity}
                loansCount={materialLoans.filter(l => l.borrowerId === entity.id && l.borrowerType === 'entity' && l.status !== 'returned').length}
                onEdit={() => handleEditEntity(entity)}
                onDelete={() => setDeleteEntity(entity)}
              />
            ))}
            {filteredEntities.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                Aucune entité trouvée
              </div>
            )}
          </div>
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans" className="space-y-6">
          {/* Loan Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Prêts actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loanStats.activeLoans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">En retard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{loanStats.overdueLoans}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Retours ce mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{loanStats.returnsThisMonth}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total prêts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{materialLoans.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un prêt..."
                value={loanSearchQuery}
                onChange={(e) => setLoanSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={loanStatusFilter} onValueChange={setLoanStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="returned">Retournés</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setLoanFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau prêt
            </Button>
          </div>

          {/* Loans List */}
          <div className="space-y-3">
            {filteredLoans.map(loan => {
              const material = getMaterialById(loan.materialId);
              const materialType = material ? getMaterialTypeById(material.materialTypeId) : null;
              const today = new Date().toISOString().split('T')[0];
              const isOverdue = loan.status !== 'returned' && loan.dueDate < today;
              const currentStatus = loan.status === 'returned' ? 'returned' : (isOverdue ? 'overdue' : 'active');

              return (
                <Card key={loan.id} className={isOverdue ? 'border-destructive' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-muted">
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{material?.name || 'Matériel inconnu'}</div>
                          <div className="text-sm text-muted-foreground">
                            {loan.borrowerName} • {loan.quantity} unité(s) • Retour prévu: {new Date(loan.dueDate).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={currentStatus === 'returned' ? 'secondary' : currentStatus === 'overdue' ? 'destructive' : 'default'}>
                          {currentStatus === 'returned' ? 'Retourné' : currentStatus === 'overdue' ? 'En retard' : 'Actif'}
                        </Badge>
                        {loan.status !== 'returned' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setRenewLoan(loan)}>
                              Renouveler
                            </Button>
                            <Button size="sm" onClick={() => setReturnLoan(loan)}>
                              Retourner
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredLoans.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Aucun prêt trouvé
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <MaterialFormDialog
        open={materialFormOpen}
        onOpenChange={(open) => { setMaterialFormOpen(open); if (!open) setEditMaterial(null); }}
        material={editMaterial}
      />
      <MaterialTypeFormDialog
        open={materialTypeFormOpen}
        onOpenChange={(open) => { setMaterialTypeFormOpen(open); if (!open) setEditMaterialType(null); }}
        materialType={editMaterialType}
      />
      <DeleteMaterialDialog
        open={!!deleteMaterial}
        onOpenChange={(open) => !open && setDeleteMaterial(null)}
        material={deleteMaterial}
      />
      <EntityFormDialog
        open={entityFormOpen}
        onOpenChange={(open) => { setEntityFormOpen(open); if (!open) setEditEntity(null); }}
        entity={editEntity}
      />
      <DeleteEntityDialog
        open={!!deleteEntity}
        onOpenChange={(open) => !open && setDeleteEntity(null)}
        entity={deleteEntity}
      />
      <MaterialLoanFormDialog
        open={loanFormOpen}
        onOpenChange={setLoanFormOpen}
      />
      <ReturnMaterialLoanDialog
        open={!!returnLoan}
        onOpenChange={(open) => !open && setReturnLoan(null)}
        loan={returnLoan}
      />
      <RenewMaterialLoanDialog
        open={!!renewLoan}
        onOpenChange={(open) => !open && setRenewLoan(null)}
        loan={renewLoan}
      />
    </div>
    </AdminLayout>
  );
};

export default Materials;
