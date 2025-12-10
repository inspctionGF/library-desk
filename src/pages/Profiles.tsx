import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLibraryStore, UserProfile } from '@/hooks/useLibraryStore';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Pencil, Trash2, Users, Shield, User } from 'lucide-react';
import { ProfileFormDialog } from '@/components/profiles/ProfileFormDialog';
import { DeleteProfileDialog } from '@/components/profiles/DeleteProfileDialog';

export default function Profiles() {
  const { toast } = useToast();
  const { userProfiles, addUserProfile, updateUserProfile, deleteUserProfile } = useLibraryStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'guest'>('all');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);

  const filteredProfiles = userProfiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || profile.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: userProfiles.length,
    admins: userProfiles.filter(p => p.role === 'admin').length,
    guests: userProfiles.filter(p => p.role === 'guest').length,
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAdd = () => {
    setSelectedProfile(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setFormDialogOpen(true);
  };

  const handleDelete = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = (data: Omit<UserProfile, 'id' | 'createdAt'>) => {
    if (selectedProfile) {
      updateUserProfile(selectedProfile.id, data);
      toast({
        title: 'Profil mis à jour',
        description: `Le profil de "${data.name}" a été modifié avec succès.`,
      });
    } else {
      addUserProfile(data);
      toast({
        title: 'Profil créé',
        description: `Le profil de "${data.name}" a été créé avec succès.`,
      });
    }
    setFormDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedProfile) {
      deleteUserProfile(selectedProfile.id);
      toast({
        title: 'Profil supprimé',
        description: `Le profil de "${selectedProfile.name}" a été supprimé.`,
        variant: 'destructive',
      });
      setDeleteDialogOpen(false);
      setSelectedProfile(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Gestion des Profils</h1>
            <p className="text-sm text-muted-foreground">Gérer les comptes administrateurs et invités</p>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Profil
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Profils</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Administrateurs</CardTitle>
              <Shield className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.admins}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Invités</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.guests}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={roleFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter('all')}
                >
                  Tous
                </Button>
                <Button
                  variant={roleFilter === 'admin' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter('admin')}
                >
                  Admin
                </Button>
                <Button
                  variant={roleFilter === 'guest' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter('guest')}
                >
                  Invité
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profiles Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profil</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucun profil trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={profile.avatarUrl} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(profile.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{profile.name}</p>
                            {profile.notes && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {profile.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{profile.email}</TableCell>
                      <TableCell className="text-muted-foreground">{profile.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={profile.role === 'admin' ? 'default' : 'secondary'}
                          className={profile.role === 'admin' ? 'bg-primary/10 text-primary border-primary/20' : ''}
                        >
                          {profile.role === 'admin' ? 'Admin' : 'Invité'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(profile.createdAt).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(profile)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(profile)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ProfileFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        profile={selectedProfile}
        onSubmit={handleFormSubmit}
      />

      <DeleteProfileDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        profileName={selectedProfile?.name || ''}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}
