import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLibraryStore, InventorySession } from '@/hooks/useLibraryStore';
import { useSystemConfig } from '@/hooks/useSystemConfig';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FileSpreadsheet, FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

interface ExportInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: InventorySession;
}

export function ExportInventoryDialog({ open, onOpenChange, session }: ExportInventoryDialogProps) {
  const { getInventoryItems, getInventoryStats, getBookById, getCategoryById } = useLibraryStore();
  const { config } = useSystemConfig();
  
  const [includeDiscrepancyOnly, setIncludeDiscrepancyOnly] = useState(false);
  
  const items = getInventoryItems(session.id);
  const stats = getInventoryStats(session.id);
  
  const getExportItems = () => {
    const filteredItems = includeDiscrepancyOnly 
      ? items.filter(i => i.status === 'discrepancy')
      : items;
    
    return filteredItems.map(item => {
      const book = getBookById(item.bookId);
      const category = book ? getCategoryById(book.categoryId) : null;
      const diff = (item.foundQuantity || 0) - item.expectedQuantity;
      
      return {
        title: book?.title || 'Inconnu',
        author: book?.author || 'Inconnu',
        isbn: book?.isbn || '',
        category: category?.name || 'Non catégorisé',
        expectedQuantity: item.expectedQuantity,
        foundQuantity: item.foundQuantity ?? 0,
        difference: diff,
        status: item.status === 'checked' ? 'Conforme' : item.status === 'discrepancy' ? 'Écart' : 'En attente'
      };
    });
  };
  
  const handleExportCSV = () => {
    const exportItems = getExportItems();
    
    const headers = ['Titre', 'Auteur', 'ISBN', 'Catégorie', 'Quantité attendue', 'Quantité trouvée', 'Différence', 'Statut'];
    const rows = exportItems.map(item => [
      `"${item.title.replace(/"/g, '""')}"`,
      `"${item.author.replace(/"/g, '""')}"`,
      item.isbn,
      `"${item.category}"`,
      item.expectedQuantity.toString(),
      item.foundQuantity.toString(),
      item.difference.toString(),
      item.status
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventaire_${format(new Date(session.startDate), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Export CSV téléchargé');
    onOpenChange(false);
  };
  
  const handleExportWord = () => {
    const exportItems = getExportItems();
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Rapport d'inventaire - ${session.name}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #333; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px; }
    h2 { color: #666; margin-top: 30px; }
    .header-info { margin-bottom: 30px; }
    .header-info p { margin: 5px 0; color: #555; }
    .stats { display: flex; gap: 20px; margin: 20px 0; }
    .stat-box { padding: 15px 20px; background: #f5f5f5; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: bold; color: #333; }
    .stat-label { font-size: 12px; color: #666; }
    .stat-success { background: #dcfce7; }
    .stat-success .stat-value { color: #16a34a; }
    .stat-warning { background: #fff7ed; }
    .stat-warning .stat-value { color: #ea580c; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background: #8B5CF6; color: white; }
    tr:nth-child(even) { background: #f9f9f9; }
    .positive { color: #16a34a; }
    .negative { color: #dc2626; }
    .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #ddd; padding-top: 20px; }
  </style>
</head>
<body>
  <h1>Rapport d'inventaire</h1>
  
  <div class="header-info">
    <p><strong>Centre:</strong> ${config?.churchName || 'Non configuré'}</p>
    <p><strong>Numéro CDEJ:</strong> HA-${config?.cdejNumber || '0000'}</p>
    <p><strong>Session:</strong> ${session.name}</p>
    <p><strong>Type:</strong> ${session.type === 'annual' ? 'Inventaire annuel' : 'Inventaire ponctuel'}</p>
    <p><strong>Date de début:</strong> ${format(new Date(session.startDate), 'd MMMM yyyy', { locale: fr })}</p>
    ${session.endDate ? `<p><strong>Date de fin:</strong> ${format(new Date(session.endDate), 'd MMMM yyyy', { locale: fr })}</p>` : ''}
  </div>
  
  <h2>Résumé</h2>
  <div class="stats">
    <div class="stat-box">
      <div class="stat-value">${stats.total}</div>
      <div class="stat-label">Total vérifié</div>
    </div>
    <div class="stat-box stat-success">
      <div class="stat-value">${stats.checked}</div>
      <div class="stat-label">Conformes</div>
    </div>
    <div class="stat-box stat-warning">
      <div class="stat-value">${stats.discrepancy}</div>
      <div class="stat-label">Écarts</div>
    </div>
  </div>
  
  <h2>Détails des livres${includeDiscrepancyOnly ? ' (écarts uniquement)' : ''}</h2>
  <table>
    <thead>
      <tr>
        <th>Titre</th>
        <th>Auteur</th>
        <th>ISBN</th>
        <th>Catégorie</th>
        <th>Attendu</th>
        <th>Trouvé</th>
        <th>Diff.</th>
        <th>Statut</th>
      </tr>
    </thead>
    <tbody>
      ${exportItems.map(item => `
        <tr>
          <td>${item.title}</td>
          <td>${item.author}</td>
          <td>${item.isbn}</td>
          <td>${item.category}</td>
          <td>${item.expectedQuantity}</td>
          <td>${item.foundQuantity}</td>
          <td class="${item.difference > 0 ? 'positive' : item.difference < 0 ? 'negative' : ''}">${item.difference > 0 ? '+' : ''}${item.difference}</td>
          <td>${item.status}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  
  <div class="footer">
    <p>Rapport généré le ${format(new Date(), 'd MMMM yyyy à HH:mm', { locale: fr })}</p>
    <p>BiblioSystem - Centre de Documentation et d'Évangélisation de la Jeunesse</p>
  </div>
</body>
</html>`;
    
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventaire_${format(new Date(session.startDate), 'yyyy-MM-dd')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Export Word téléchargé');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exporter l'inventaire
          </DialogTitle>
          <DialogDescription>
            Exportez le rapport de l'inventaire "{session.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="discrepancy-only"
              checked={includeDiscrepancyOnly}
              onCheckedChange={(checked) => setIncludeDiscrepancyOnly(checked === true)}
            />
            <Label htmlFor="discrepancy-only">
              Exporter uniquement les écarts ({stats.discrepancy} livres)
            </Label>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={handleExportCSV}
            >
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <span>Export CSV</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={handleExportWord}
            >
              <FileText className="h-8 w-8 text-blue-600" />
              <span>Export Word</span>
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
