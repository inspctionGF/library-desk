import { useState, useRef, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLibraryStore } from '@/hooks/useLibraryStore';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { ImageCropperDialog } from '@/components/profile/ImageCropperDialog';
import { User, Mail, Shield, Camera, Save, Lock, Eye, EyeOff, Upload, X } from 'lucide-react';

export default function Profile() {
  const { toast } = useToast();
  const { userProfiles, updateUserProfile } = useLibraryStore();
  const { config, updateConfig } = useSystemConfig();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get admin profile (first user profile)
  const adminProfile = userProfiles[0] || {
    id: '1',
    name: 'Admin User',
    email: 'admin@bibliosystem.com',
    role: 'admin' as const,
    phone: '',
    notes: '',
    avatarUrl: '',
    avatarData: '',
    createdAt: new Date().toISOString(),
  };

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: adminProfile.name,
    email: adminProfile.email,
  });
  
  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // Image cropper state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    src: string;
    name: string;
    size: number;
  } | null>(null);

  // Update form data when profile changes
  useEffect(() => {
    setFormData({
      name: adminProfile.name,
      email: adminProfile.email,
    });
  }, [adminProfile.name, adminProfile.email]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = () => {
    updateUserProfile(adminProfile.id, {
      name: formData.name,
      email: formData.email,
    });
    setIsEditing(false);
    toast({
      title: 'Profil mis à jour',
      description: 'Vos informations ont été enregistrées avec succès.',
    });
  };

  const handleCancel = () => {
    setFormData({
      name: adminProfile.name,
      email: adminProfile.email,
    });
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner une image valide.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB for cropping, will be compressed after)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Erreur',
        description: 'L\'image ne doit pas dépasser 5 Mo.',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setSelectedImage({
        src: base64Data,
        name: file.name,
        size: file.size,
      });
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleCropComplete = (croppedImageBase64: string) => {
    updateUserProfile(adminProfile.id, {
      avatarData: croppedImageBase64,
      avatarUrl: croppedImageBase64,
    });
    setSelectedImage(null);
    toast({
      title: 'Photo mise à jour',
      description: 'Votre photo de profil a été enregistrée.',
    });
  };

  const handleRemoveAvatar = () => {
    updateUserProfile(adminProfile.id, {
      avatarData: '',
      avatarUrl: '',
    });
    toast({
      title: 'Photo supprimée',
      description: 'Votre photo de profil a été supprimée.',
    });
  };

  const handlePasswordChange = () => {
    // Validate current PIN
    if (currentPin !== config.adminPin) {
      toast({
        title: 'Erreur',
        description: 'Le PIN actuel est incorrect.',
        variant: 'destructive',
      });
      return;
    }

    // Validate new PIN format (6 digits)
    if (!/^\d{6}$/.test(newPin)) {
      toast({
        title: 'Erreur',
        description: 'Le nouveau PIN doit contenir exactement 6 chiffres.',
        variant: 'destructive',
      });
      return;
    }

    // Validate confirmation
    if (newPin !== confirmPin) {
      toast({
        title: 'Erreur',
        description: 'La confirmation ne correspond pas au nouveau PIN.',
        variant: 'destructive',
      });
      return;
    }

    // Update the PIN
    updateConfig({ adminPin: newPin });
    
    // Reset form
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
    setShowPasswordSection(false);
    
    toast({
      title: 'PIN modifié',
      description: 'Votre PIN administrateur a été mis à jour avec succès.',
    });
  };

  const avatarSrc = adminProfile.avatarData || adminProfile.avatarUrl;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Mon Profil</h1>
          <p className="text-sm text-muted-foreground">Gérez vos informations personnelles</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex flex-col items-center justify-center gap-4 py-4">
                <div className="relative flex items-center justify-center">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarSrc} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                      {getInitials(adminProfile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                    onClick={handleAvatarClick}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="space-y-1 text-center">
                  <CardTitle className="text-lg">{adminProfile.name}</CardTitle>
                  <CardDescription>{adminProfile.email}</CardDescription>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                    {adminProfile.role === 'admin' ? 'Administrateur' : 'Invité'}
                  </Badge>
                </div>
                {avatarSrc && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={handleRemoveAvatar}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Supprimer la photo
                  </Button>
                )}
              </div>
            </CardHeader>
          </Card>

          {/* Edit Form & Password */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Informations personnelles</CardTitle>
                    <CardDescription>Modifiez vos informations de profil</CardDescription>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      Modifier
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      Nom complet
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    Rôle
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {adminProfile.role === 'admin' ? 'Administrateur' : 'Invité'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Les rôles sont gérés par le système
                    </span>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSave} className="gap-2">
                      <Save className="h-4 w-4" />
                      Enregistrer
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      Annuler
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Password Change Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      Sécurité
                    </CardTitle>
                    <CardDescription>Modifiez votre PIN administrateur</CardDescription>
                  </div>
                  {!showPasswordSection && (
                    <Button variant="outline" onClick={() => setShowPasswordSection(true)}>
                      Changer le PIN
                    </Button>
                  )}
                </div>
              </CardHeader>
              {showPasswordSection && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPin">PIN actuel</Label>
                    <div className="relative">
                      <Input
                        id="currentPin"
                        type={showCurrentPin ? 'text' : 'password'}
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPin(!showCurrentPin)}
                      >
                        {showCurrentPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPin">Nouveau PIN (6 chiffres)</Label>
                    <div className="relative">
                      <Input
                        id="newPin"
                        type={showNewPin ? 'text' : 'password'}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPin(!showNewPin)}
                      >
                        {showNewPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPin">Confirmer le nouveau PIN</Label>
                    <div className="relative">
                      <Input
                        id="confirmPin"
                        type={showConfirmPin ? 'text' : 'password'}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="••••••"
                        maxLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPin(!showConfirmPin)}
                      >
                        {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button onClick={handlePasswordChange} className="gap-2">
                      <Lock className="h-4 w-4" />
                      Mettre à jour le PIN
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowPasswordSection(false);
                        setCurrentPin('');
                        setNewPin('');
                        setConfirmPin('');
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Image Cropper Dialog */}
      {selectedImage && (
        <ImageCropperDialog
          open={cropperOpen}
          onOpenChange={(open) => {
            setCropperOpen(open);
            if (!open) setSelectedImage(null);
          }}
          imageSrc={selectedImage.src}
          fileName={selectedImage.name}
          fileSize={selectedImage.size}
          onCropComplete={handleCropComplete}
        />
      )}
    </AdminLayout>
  );
}
