import { useState } from 'react';
import { BookOpen, Shield, Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { useGuestPins } from '@/hooks/useGuestPins';

export default function Login() {
  const { loginAsAdmin, loginAsGuest, logFailedLogin } = useAuth();
  const { config } = useSystemConfig();
  const { validateGuestPin } = useGuestPins();

  const [adminPin, setAdminPin] = useState('');
  const [guestPin, setGuestPin] = useState('');
  const [adminError, setAdminError] = useState('');
  const [guestError, setGuestError] = useState('');

  const handleAdminLogin = async () => {
    setAdminError('');
    
    if (adminPin.length !== 6) {
      setAdminError('Le PIN doit contenir 6 chiffres');
      return;
    }

    if (adminPin === config.adminPin) {
      await loginAsAdmin();
      window.location.href = '/';
    } else {
      await logFailedLogin('admin');
      setAdminError('PIN incorrect');
      setAdminPin('');
    }
  };

  const handleGuestLogin = async () => {
    setGuestError('');
    
    if (guestPin.length !== 6) {
      setGuestError('Le PIN doit contenir 6 chiffres');
      return;
    }

    const result = validateGuestPin(guestPin);
    if (result.valid && result.pinId) {
      await loginAsGuest(result.pinId);
      window.location.href = '/books';
    } else {
      await logFailedLogin('guest');
      setGuestError('PIN invalide, expiré ou déjà utilisé');
      setGuestPin('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">BiblioSystem</CardTitle>
          <CardDescription className="text-base">
            Centre de Documentation CDEJ
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Organization Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">CDEJ</span>
              <span className="font-mono font-semibold">{config.cdejNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Église</span>
              <span className="font-medium text-right truncate ml-4">{config.churchName}</span>
            </div>
          </div>

          {/* Admin Login */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Shield className="h-4 w-4 text-primary" />
              Administrateur
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <InputOTP
                maxLength={6}
                value={adminPin}
                onChange={(value) => {
                  setAdminPin(value);
                  setAdminError('');
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
              
              {adminError && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {adminError}
                </div>
              )}
              
              <Button 
                onClick={handleAdminLogin} 
                className="w-full gap-2"
                disabled={adminPin.length !== 6}
              >
                <Shield className="h-4 w-4" />
                Connexion Administrateur
              </Button>
            </div>
          </div>

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Guest Login */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-muted-foreground" />
              Invité
            </div>
            
            <div className="flex flex-col items-center gap-3">
              <InputOTP
                maxLength={6}
                value={guestPin}
                onChange={(value) => {
                  setGuestPin(value);
                  setGuestError('');
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
              
              {guestError && (
                <div className="flex items-center gap-1 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  {guestError}
                </div>
              )}
              
              <Button 
                variant="outline"
                onClick={handleGuestLogin} 
                className="w-full gap-2"
                disabled={guestPin.length !== 6}
              >
                <Users className="h-4 w-4" />
                Accéder en tant qu'invité
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Demandez un PIN à l'administrateur pour accéder au catalogue
              </p>
            </div>
          </div>

          <p className="text-xs text-center text-muted-foreground pt-2">
            Responsable : {config.documentationManagerName}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
