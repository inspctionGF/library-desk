import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, Copy, Trash2, Clock, CheckCircle, XCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useGuestPins, GuestPin } from '@/hooks/useGuestPins';
import { toast } from 'sonner';

export default function GuestPins() {
  const { pins, generateGuestPin, revokePin, deletePin, getActivePins } = useGuestPins();
  const [newPinDialog, setNewPinDialog] = useState(false);
  const [generatedPin, setGeneratedPin] = useState<GuestPin | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pinToDelete, setPinToDelete] = useState<string | null>(null);

  const activePins = getActivePins();

  const handleGeneratePin = () => {
    const newPin = generateGuestPin();
    setGeneratedPin(newPin);
    setNewPinDialog(true);
  };

  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    toast.success('PIN copié dans le presse-papier');
  };

  const handleRevokePin = (pinId: string) => {
    revokePin(pinId);
    toast.success('PIN révoqué');
  };

  const handleDeletePin = (pinId: string) => {
    setPinToDelete(pinId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (pinToDelete) {
      deletePin(pinToDelete);
      toast.success('PIN supprimé');
      setDeleteDialogOpen(false);
      setPinToDelete(null);
    }
  };

  const getPinStatus = (pin: GuestPin): { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' } => {
    const now = new Date();
    if (pin.usedAt) {
      return { label: 'Utilisé', variant: 'secondary' };
    }
    if (!pin.isActive) {
      return { label: 'Révoqué', variant: 'destructive' };
    }
    if (new Date(pin.expiresAt) < now) {
      return { label: 'Expiré', variant: 'outline' };
    }
    return { label: 'Actif', variant: 'default' };
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">PINs Invités</h1>
            <p className="text-muted-foreground">
              Gérez les accès temporaires pour les invités
            </p>
          </div>
          <Button onClick={handleGeneratePin} className="gap-2">
            <Plus className="h-4 w-4" />
            Générer un PIN
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PINs Actifs</CardTitle>
              <KeyRound className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePins.length}</div>
              <p className="text-xs text-muted-foreground">
                Disponibles pour connexion
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PINs Utilisés</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {pins.filter(p => p.usedAt !== null).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Connexions effectuées
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Généré</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pins.length}</div>
              <p className="text-xs text-muted-foreground">
                Depuis la configuration
              </p>
            </CardContent>
          </Card>
        </div>

        {/* PINs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des PINs</CardTitle>
            <CardDescription>
              Les PINs sont à usage unique et expirent après 24 heures
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pins.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Aucun PIN généré. Cliquez sur "Générer un PIN" pour créer un accès invité.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PIN</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé le</TableHead>
                    <TableHead>Expire le</TableHead>
                    <TableHead>Utilisé le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pins.map((pin) => {
                    const status = getPinStatus(pin);
                    const isActive = status.label === 'Actif';
                    
                    return (
                      <TableRow key={pin.id}>
                        <TableCell className="font-mono font-semibold">
                          {pin.pin}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(pin.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {format(new Date(pin.expiresAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {pin.usedAt 
                            ? format(new Date(pin.usedAt), 'dd MMM yyyy HH:mm', { locale: fr })
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {isActive && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleCopyPin(pin.pin)}
                                  title="Copier"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRevokePin(pin.id)}
                                  title="Révoquer"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePin(pin.id)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New PIN Dialog */}
      <Dialog open={newPinDialog} onOpenChange={setNewPinDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau PIN Invité</DialogTitle>
            <DialogDescription>
              Communiquez ce PIN à l'invité. Il est valable 24 heures et à usage unique.
            </DialogDescription>
          </DialogHeader>
          {generatedPin && (
            <div className="space-y-4">
              <div className="flex items-center justify-center py-6">
                <div className="text-4xl font-mono font-bold tracking-widest bg-muted px-6 py-4 rounded-lg">
                  {generatedPin.pin}
                </div>
              </div>
              <div className="text-sm text-muted-foreground text-center">
                Expire le {format(new Date(generatedPin.expiresAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
              </div>
              <Button
                onClick={() => handleCopyPin(generatedPin.pin)}
                className="w-full gap-2"
              >
                <Copy className="h-4 w-4" />
                Copier le PIN
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce PIN ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le PIN sera définitivement supprimé de l'historique.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
