import { useState } from 'react';
import { Shield, Users, AlertCircle, ChevronDown, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { useAuth } from '@/hooks/useAuth';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { useGuestPins } from '@/hooks/useGuestPins';
import { authApi, setAdminPin, setGuestPin } from '@/services/api';
import BiblioSystemLogo from '@/assets/bibliosystem-logo.svg';

const testimonials = [
  {
    quote: "BiblioSystem a révolutionné la gestion de notre centre de documentation. Tout est maintenant organisé et accessible.",
    author: "Marie Josèphe",
    role: "Directrice CDEJ HA-0832"
  },
  {
    quote: "Les enfants adorent consulter le catalogue et suivre leurs lectures. C'est un outil indispensable.",
    author: "Pierre Jean",
    role: "Responsable Documentation"
  },
  {
    quote: "Le suivi des prêts et l'inventaire n'ont jamais été aussi simples. Je recommande BiblioSystem à tous les CDEJ.",
    author: "Anne Claudette",
    role: "Monitrice CDEJ HA-1245"
  },
  {
    quote: "Grâce à BiblioSystem, nous avons une vue complète sur les activités de notre centre. Un gain de temps énorme!",
    author: "Jacques Emmanuel",
    role: "Directeur CDEJ HA-0456"
  }
];

const citation = {
  text: "La lecture est à l'esprit ce que l'exercice est au corps.",
  author: "Joseph Addison"
};

export default function Login() {
  const { loginAsAdmin, loginAsGuest, logFailedLogin } = useAuth();
  const { config } = useSystemConfig();
  const { validateGuestPin } = useGuestPins();

  const [adminPin, setLocalAdminPin] = useState('');
  const [guestPin, setLocalGuestPin] = useState('');
  const [adminError, setAdminError] = useState('');
  const [guestError, setGuestError] = useState('');
  const [showGuestLogin, setShowGuestLogin] = useState(false);

  const handleAdminLogin = async () => {
    setAdminError('');
    
    if (adminPin.length !== 6) {
      setAdminError('Le PIN doit contenir 6 chiffres');
      return;
    }

    try {
      // Vérifier d'abord via l'API si disponible
      const isApiMode = localStorage.getItem('bibliosystem_api_mode') === 'true';
      
      if (isApiMode) {
        const result = await authApi.verifyAdmin(adminPin);
        if (result.valid) {
          // Store admin PIN for API requests
          setAdminPin(adminPin);
          await loginAsAdmin();
          window.location.href = '/';
          return;
        }
      } else {
        // Fallback sur la vérification locale
        if (adminPin === config.adminPin) {
          setAdminPin(adminPin);
          await loginAsAdmin();
          window.location.href = '/';
          return;
        }
      }
      
      // PIN incorrect
      await logFailedLogin('admin');
      setAdminError('PIN incorrect');
      setLocalAdminPin('');
    } catch (error) {
      console.error('Login error:', error);
      // En cas d'erreur API, essayer la vérification locale
      if (adminPin === config.adminPin && config.adminPin) {
        setAdminPin(adminPin);
        await loginAsAdmin();
        window.location.href = '/';
        return;
      }
      await logFailedLogin('admin');
      setAdminError('Erreur de connexion. Vérifiez que le serveur est démarré.');
      setLocalAdminPin('');
    }
  };

  const handleGuestLogin = async () => {
    setGuestError('');
    
    if (guestPin.length !== 6) {
      setGuestError('Le PIN doit contenir 6 chiffres');
      return;
    }

    try {
      const result = await validateGuestPin(guestPin);
      if (result.valid && result.pinId) {
        // Store guest PIN for API requests
        setGuestPin(guestPin); // The imported function from api.ts
        await loginAsGuest(result.pinId);
        window.location.href = '/books';
      } else {
        await logFailedLogin('guest');
        setGuestError('PIN invalide, expiré ou déjà utilisé');
        setLocalGuestPin(''); // The state setter
      }
    } catch (error) {
      console.error('Guest login error:', error);
      await logFailedLogin('guest');
      setGuestError('Erreur de connexion');
      setLocalGuestPin(''); // The state setter
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-primary-foreground p-8 lg:p-12 flex-col justify-between relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <img 
            src={BiblioSystemLogo} 
            alt="BiblioSystem" 
            className="h-12 lg:h-16 object-contain brightness-0 invert"
          />
        </div>

        {/* Testimonial Carousel */}
        <div className="relative z-10 flex-1 flex items-center justify-center py-8">
          <Carousel
            opts={{
              align: "center",
              loop: true,
            }}
            plugins={[
              Autoplay({
                delay: 5000,
                stopOnInteraction: false,
              }),
            ]}
            className="w-full max-w-lg"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <div className="flex flex-col items-center text-center px-4">
                    <Quote className="h-10 w-10 mb-6 opacity-50" />
                    <blockquote className="text-xl lg:text-2xl font-medium leading-relaxed mb-6">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="space-y-1">
                      <p className="font-semibold text-lg">{testimonial.author}</p>
                      <p className="text-sm opacity-80">{testimonial.role}</p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Citation */}
        <div className="relative z-10 border-t border-white/20 pt-6">
          <p className="text-lg italic opacity-90">"{citation.text}"</p>
          <p className="text-sm mt-2 opacity-70">— {citation.author}</p>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img src={BiblioSystemLogo} alt="BiblioSystem" className="h-10 object-contain" />
          </div>

          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
              Centre de Documentation
            </h1>
            <p className="text-muted-foreground">Connectez-vous pour accéder à votre espace</p>
          </div>

          {/* Organization Info */}
          <Card className="border-muted">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">CDEJ</span>
                <span className="font-mono font-semibold">{config.cdejNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Église</span>
                <span className="font-medium text-right truncate ml-4 max-w-[200px]">{config.churchName}</span>
              </div>
            </CardContent>
          </Card>

          {/* Admin Login */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-base font-semibold">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              Administrateur
            </div>
            
            <div className="flex flex-col items-center gap-4">
              <InputOTP
                maxLength={6}
                value={adminPin}
                onChange={(value) => {
                  setLocalAdminPin(value);
                  setAdminError('');
                }}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              
              {adminError && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  {adminError}
                </div>
              )}
              
              <Button 
                onClick={handleAdminLogin} 
                className="w-full gap-2 h-11"
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
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground">ou</span>
            </div>
          </div>

          {/* Guest Login Collapsible */}
          <Collapsible open={showGuestLogin} onOpenChange={setShowGuestLogin}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between h-12 text-muted-foreground hover:text-foreground"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Accéder en tant qu'invité
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showGuestLogin ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="flex flex-col items-center gap-4">
                <InputOTP
                  maxLength={6}
                  value={guestPin}
                  onChange={(value) => {
                    setLocalGuestPin(value);
                    setGuestError('');
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
                
                {guestError && (
                  <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    {guestError}
                  </div>
                )}
                
                <Button 
                  variant="outline"
                  onClick={handleGuestLogin} 
                  className="w-full gap-2 h-11"
                  disabled={guestPin.length !== 6}
                >
                  <Users className="h-4 w-4" />
                  Accéder en tant qu'invité
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Demandez un PIN à l'administrateur pour accéder au catalogue
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Footer */}
          <p className="text-xs text-center text-muted-foreground pt-4">
            Responsable : {config.documentationManagerName}
          </p>
        </div>
      </div>
    </div>
  );
}
