import { useState } from 'react';
import { AlertTriangle, Trash2, RefreshCw, Shield, Building2, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { toast } from 'sonner';

export default function Settings() {
  const { config, resetConfig, updateConfig } = useSystemConfig();
  const [firstConfirmOpen, setFirstConfirmOpen] = useState(false);
  const [secondConfirmOpen, setSecondConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  
  // PIN change state
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);

  const CONFIRM_PHRASE = 'SUPPRIMER TOUT';

  const handleFirstConfirm = () => {
    setFirstConfirmOpen(false);
    setSecondConfirmOpen(true);
  };

  const handleFinalReset = () => {
    if (confirmText !== CONFIRM_PHRASE) {
      toast.error('La phrase de confirmation est incorrecte');
      return;
    }

    localStorage.clear();
    resetConfig();
    
    setSecondConfirmOpen(false);
    setConfirmText('');
    
    toast.success('Système réinitialisé avec succès');
    
    setTimeout(() => {
      window.location.href = '/onboarding';
    }, 1000);
  };

  const handleCancelSecond = () => {
    setSecondConfirmOpen(false);
    setConfirmText('');
  };

  const handleOpenPinDialog = () => {
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setPinError('');
    setPinDialogOpen(true);
  };

  const handleChangePin = () => {
    setPinError('');

    if (currentPin !== config.adminPin) {
      setPinError('PIN actuel incorrect');
      setCurrentPin('');
      return;
    }

    if (newPin.length !== 6) {
      setPinError('Le nouveau PIN doit contenir 6 chiffres');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('Les nouveaux PINs ne correspondent pas');
      return;
    }

    if (newPin === currentPin) {
      setPinError('Le nouveau PIN doit être différent de l\'actuel');
      return;
    }

    updateConfig({ adminPin: newPin });
    setPinDialogOpen(false);
    toast.success('PIN administrateur modifié avec succès');
  };

  const pinsMatch = newPin === confirmPin && newPin.length === 6;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">
            Configuration et administration du système
          </p>
        </div>

        {/* System Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Informations du Centre
            </CardTitle>
            <CardDescription>
              Détails de configuration de votre CDEJ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Numéro CDEJ</Label>
                <p className="font-mono font-semibold">{config.cdejNumber}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Église</Label>
                <p className="font-medium">{config.churchName}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Directeur</Label>
                <p>{config.directorName}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Responsable Documentation</Label>
                <p>{config.documentationManagerName}</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{config.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{config.phone}</span>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="whitespace-pre-line">{config.address}</span>
            </div>

            {config.configuredAt && (
              <p className="text-xs text-muted-foreground pt-2">
                Configuré le {new Date(config.configuredAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Gestion des accès et authentification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium">PIN Administrateur</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Modifiez votre PIN de connexion administrateur
                </p>
              </div>
              <Button variant="outline" onClick={handleOpenPinDialog} className="gap-2">
                <Lock className="h-4 w-4" />
                Modifier le PIN
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Zone de Danger
            </CardTitle>
            <CardDescription>
              Actions irréversibles qui affectent l'ensemble du système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
              <div className="space-y-1">
                <p className="font-medium text-destructive">Réinitialiser le système</p>
                <p className="text-sm text-muted-foreground">
                  Supprime toutes les données : livres, catégories, tâches, profils, PINs et configuration.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setFirstConfirmOpen(true)}
                className="gap-2 shrink-0"
              >
                <Trash2 className="h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change PIN Dialog */}
      <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Modifier le PIN Administrateur
            </DialogTitle>
            <DialogDescription>
              Entrez votre PIN actuel puis définissez un nouveau PIN à 6 chiffres
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Current PIN */}
            <div className="space-y-3">
              <Label>PIN actuel</Label>
              <div className="flex justify-center">
                <div className="relative">
                  <InputOTP
                    maxLength={6}
                    value={currentPin}
                    onChange={(value) => {
                      setCurrentPin(value);
                      setPinError('');
                    }}
                    type={showCurrentPin ? 'text' : 'password'}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => setShowCurrentPin(!showCurrentPin)}
              >
                {showCurrentPin ? (
                  <><EyeOff className="h-4 w-4 mr-2" /> Masquer</>
                ) : (
                  <><Eye className="h-4 w-4 mr-2" /> Afficher</>
                )}
              </Button>
            </div>

            <Separator />

            {/* New PIN */}
            <div className="space-y-3">
              <Label>Nouveau PIN</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={newPin}
                  onChange={(value) => {
                    setNewPin(value);
                    setPinError('');
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {/* Confirm New PIN */}
            <div className="space-y-3">
              <Label>Confirmer le nouveau PIN</Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={confirmPin}
                  onChange={(value) => {
                    setConfirmPin(value);
                    setPinError('');
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            {pinError && (
              <p className="text-sm text-destructive text-center">{pinError}</p>
            )}

            {confirmPin.length === 6 && newPin.length === 6 && !pinsMatch && (
              <p className="text-sm text-destructive text-center">
                Les PINs ne correspondent pas
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPinDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleChangePin}
              disabled={currentPin.length !== 6 || !pinsMatch}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* First Confirmation Dialog */}
      <AlertDialog open={firstConfirmOpen} onOpenChange={setFirstConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Réinitialiser le système ?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Vous êtes sur le point de supprimer <strong>toutes les données</strong> du système :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Configuration du centre (CDEJ, église, contacts)</li>
                <li>Tous les livres et catégories</li>
                <li>Toutes les tâches</li>
                <li>Tous les profils utilisateurs</li>
                <li>Tous les PINs invités</li>
                <li>PIN administrateur</li>
              </ul>
              <p className="font-medium text-destructive pt-2">
                Cette action est définitive et ne peut pas être annulée.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFirstConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continuer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Second Confirmation Dialog */}
      <AlertDialog open={secondConfirmOpen} onOpenChange={handleCancelSecond}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <RefreshCw className="h-5 w-5" />
              Confirmation finale
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                Pour confirmer la réinitialisation, tapez <strong className="text-foreground">{CONFIRM_PHRASE}</strong> ci-dessous :
              </p>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder="Tapez la phrase de confirmation"
                className="font-mono"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSecond}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalReset}
              disabled={confirmText !== CONFIRM_PHRASE}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
