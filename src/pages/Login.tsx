import { useNavigate } from 'react-router-dom';
import { BookOpen, LogIn, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSystemConfig } from '@/hooks/useSystemConfig';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { config } = useSystemConfig();

  const handleLogin = () => {
    login();
    navigate('/');
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

          {/* Admin Quick Login */}
          <div className="space-y-3">
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="w-full gap-2"
            >
              <Shield className="h-5 w-5" />
              Connexion Administrateur
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Accès complet au système de gestion de la bibliothèque
            </p>
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

          {/* Guest Quick Access */}
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full gap-2"
            onClick={handleLogin}
          >
            <LogIn className="h-5 w-5" />
            Accès Rapide (Invité)
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Responsable : {config.documentationManagerName}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
