import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, BookOpen, FolderOpen } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLibraryStore, Category } from '@/hooks/useLibraryStore';
import { useToast } from '@/hooks/use-toast';

const colorOptions = [
  'hsl(262, 83%, 58%)', // Purple
  'hsl(174, 72%, 40%)', // Teal
  'hsl(25, 95%, 53%)',  // Orange
  'hsl(340, 75%, 55%)', // Pink
  'hsl(200, 80%, 50%)', // Blue
  'hsl(142, 70%, 45%)', // Green
  'hsl(48, 95%, 50%)',  // Yellow
  'hsl(0, 70%, 55%)',   // Red
];

export default function Categories() {
  const navigate = useNavigate();
  const { categories, books, addCategory, updateCategory, deleteCategory } = useLibraryStore();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: colorOptions[0],
  });

  const getBookCount = (categoryId: string) => {
    return books.filter(b => b.categoryId === categoryId).length;
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: colorOptions[0] });
    setFormOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
    });
    setFormOpen(true);
  };

  const handleDelete = (category: Category) => {
    const bookCount = getBookCount(category.id);
    if (bookCount > 0) {
      toast({
        title: 'Cannot Delete',
        description: `This category has ${bookCount} books. Remove them first.`,
        variant: 'destructive',
      });
      return;
    }
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory(editingCategory.id, formData);
      toast({ title: 'Category Updated', description: `"${formData.name}" has been updated.` });
    } else {
      addCategory(formData);
      toast({ title: 'Category Added', description: `"${formData.name}" has been created.` });
    }
    setFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteCategory(categoryToDelete.id);
      toast({ title: 'Category Deleted', description: `"${categoryToDelete.name}" has been removed.` });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Categories</h1>
            <p className="text-sm text-muted-foreground">{categories.length} categories</p>
          </div>
          <Button onClick={handleAdd} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const bookCount = getBookCount(category.id);
            return (
              <Card 
                key={category.id} 
                className="group overflow-hidden bg-card border border-border shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
                onClick={() => navigate(`/books?category=${category.id}`)}
              >
                <div 
                  className="h-1.5" 
                  style={{ backgroundColor: category.color }}
                />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="rounded-lg p-2.5" 
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <FolderOpen 
                          className="h-5 w-5" 
                          style={{ color: category.color }}
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {bookCount} {bookCount === 1 ? 'book' : 'books'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8" 
                        onClick={(e) => { e.stopPropagation(); handleEdit(category); }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(category); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Adventure"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-8 h-8 rounded-lg transition-all ${formData.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Save Changes' : 'Add Category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}