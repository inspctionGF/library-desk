import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { BookOpen, Building2, Mail, MapPin, Phone, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ConfigurationProgressDialog } from '@/components/onboarding/ConfigurationProgressDialog';
import { useSystemConfig } from '@/hooks/useSystemConfig';

const onboardingSchema = z.object({
  cdejNumber: z.string()
    .length(4, 'Le numéro doit contenir exactement 4 chiffres')
    .regex(/^\d{4}$/, 'Le numéro doit contenir uniquement des chiffres'),
  churchName: z.string().min(2, 'Le nom de l\'église est requis').max(100),
  directorName: z.string().min(2, 'Le nom du directeur est requis').max(100),
  documentationManagerName: z.string().min(2, 'Le nom du responsable est requis').max(100),
  email: z.string().email('Email invalide').max(255),
  address: z.string().min(5, 'L\'adresse est requise').max(500),
  phone: z.string().min(8, 'Numéro de téléphone invalide').max(20),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export default function Onboarding() {
  const navigate = useNavigate();
  const { configureSystem } = useSystemConfig();
  const [showProgress, setShowProgress] = useState(false);
  const [formData, setFormData] = useState<OnboardingFormData | null>(null);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      cdejNumber: '',
      churchName: '',
      directorName: '',
      documentationManagerName: '',
      email: '',
      address: '',
      phone: '',
    },
  });

  const onSubmit = (data: OnboardingFormData) => {
    setFormData(data);
    setShowProgress(true);
  };

  const handleConfigComplete = () => {
    if (formData) {
      configureSystem({
        cdejNumber: `HA-${formData.cdejNumber}`,
        churchName: formData.churchName,
        directorName: formData.directorName,
        documentationManagerName: formData.documentationManagerName,
        email: formData.email,
        address: formData.address,
        phone: formData.phone,
      });
    }
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">BiblioSystem</CardTitle>
          <CardDescription className="text-base">
            Centre de Documentation CDEJ - Configuration initiale
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* CDEJ Number */}
              <FormField
                control={form.control}
                name="cdejNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Numéro CDEJ
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-2 bg-muted rounded-md font-mono font-semibold">
                          HA-
                        </span>
                        <Input
                          {...field}
                          placeholder="0832"
                          maxLength={4}
                          className="font-mono"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                {/* Church Name */}
                <FormField
                  control={form.control}
                  name="churchName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Nom de l'Église
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Église Adventiste de..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="cdej@eglise.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Director Name */}
                <FormField
                  control={form.control}
                  name="directorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nom du Directeur
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Jean Dupont" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Documentation Manager */}
                <FormField
                  control={form.control}
                  name="documentationManagerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Responsable du Centre
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Marie Martin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Phone */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Téléphone
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" placeholder="+33 1 23 45 67 89" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Address */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Adresse complète
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="123 Rue de l'Église&#10;75001 Paris"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" className="w-full">
                Configurer le système
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <ConfigurationProgressDialog
        open={showProgress}
        onComplete={handleConfigComplete}
      />
    </div>
  );
}
