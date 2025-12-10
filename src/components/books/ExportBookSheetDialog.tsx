import { useState, useRef } from 'react';
import { Printer, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookTechnicalSheet } from './BookTechnicalSheet';
import type { Book, Category } from '@/hooks/useLibraryStore';

interface ExportBookSheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  books: Book[];
  categories: Category[];
  getCategoryById: (id: string) => Category | undefined;
}

type LayoutOption = '1' | '2' | '4';

export function ExportBookSheetDialog({
  open,
  onOpenChange,
  books,
  categories,
  getCategoryById,
}: ExportBookSheetDialogProps) {
  const [layout, setLayout] = useState<LayoutOption>('2');
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const layoutClass = layout === '1' ? 'sheets-1' : layout === '2' ? 'sheets-2' : 'sheets-4';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Fiches Techniques - Impression</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Inter', system-ui, sans-serif; background: white; color: #1a1a2e; }
            
            .print-container { padding: 10mm; }
            
            .sheets-grid {
              display: grid;
              gap: 8mm;
            }
            
            .sheets-1 .sheets-grid { grid-template-columns: 1fr; }
            .sheets-2 .sheets-grid { grid-template-columns: 1fr; }
            .sheets-4 .sheets-grid { grid-template-columns: repeat(2, 1fr); }
            
            .book-sheet {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              overflow: hidden;
              page-break-inside: avoid;
            }
            
            .sheets-1 .book-sheet { padding: 24px; }
            .sheets-2 .book-sheet { padding: 16px; }
            .sheets-4 .book-sheet { padding: 12px; font-size: 11px; }
            
            .sheet-header {
              display: flex;
              align-items: center;
              gap: 8px;
              padding-bottom: 12px;
              margin-bottom: 12px;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .sheet-header svg { width: 16px; height: 16px; color: #4361ee; }
            .sheet-header h2 { font-size: 14px; font-weight: 600; }
            
            .sheets-4 .sheet-header { padding-bottom: 8px; margin-bottom: 8px; }
            .sheets-4 .sheet-header svg { width: 12px; height: 12px; }
            .sheets-4 .sheet-header h2 { font-size: 11px; }
            
            .sheet-content { display: flex; gap: 16px; }
            .sheets-4 .sheet-content { gap: 10px; }
            
            .sheet-cover {
              width: 80px;
              height: 100px;
              background: #f3f4f6;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
              overflow: hidden;
            }
            
            .sheets-4 .sheet-cover { width: 50px; height: 65px; }
            
            .sheet-cover img { width: 100%; height: 100%; object-fit: cover; }
            
            .sheet-qr { flex-shrink: 0; text-align: center; }
            .sheet-qr p { font-size: 8px; color: #6b7280; margin-top: 4px; }
            
            .sheets-1 .sheet-qr svg { width: 120px; height: 120px; }
            .sheets-2 .sheet-qr svg { width: 100px; height: 100px; }
            .sheets-4 .sheet-qr svg { width: 70px; height: 70px; }
            
            .sheet-info { flex: 1; min-width: 0; }
            .sheet-info h3 { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
            .sheet-info .author { color: #6b7280; font-size: 13px; }
            
            .sheets-4 .sheet-info h3 { font-size: 12px; }
            .sheets-4 .sheet-info .author { font-size: 10px; }
            
            .sheet-details { margin-top: 12px; }
            .sheets-4 .sheet-details { margin-top: 8px; }
            
            .sheet-details > div { 
              display: flex; 
              align-items: center; 
              gap: 8px; 
              margin-bottom: 4px;
              font-size: 13px;
            }
            
            .sheets-4 .sheet-details > div { font-size: 10px; gap: 4px; }
            
            .sheet-details .label { color: #6b7280; }
            .sheet-details .value { color: #1a1a2e; }
            .sheet-details .mono { font-family: monospace; }
            
            .category-dot {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              display: inline-block;
            }
            
            .sheets-4 .category-dot { width: 6px; height: 6px; }
            
            .sheet-footer {
              border-top: 1px solid #e5e7eb;
              margin-top: 12px;
              padding-top: 8px;
              font-size: 10px;
              color: #9ca3af;
            }
            
            .sheets-4 .sheet-footer { margin-top: 8px; padding-top: 6px; font-size: 8px; }
            
            @media print {
              @page { 
                size: A4; 
                margin: 10mm; 
              }
              
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
              
              .sheets-1 .book-sheet { page-break-after: always; }
              .sheets-2 .book-sheet:nth-child(2n) { page-break-after: always; }
              .sheets-4 .book-sheet:nth-child(4n) { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          <div class="print-container ${layoutClass}">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isCompact = layout === '4';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Exporter les fiches techniques ({books.length} livres)</DialogTitle>
        </DialogHeader>

        {/* Layout Options */}
        <div className="flex items-center gap-4 py-3 border-b border-border">
          <Label className="text-sm text-muted-foreground">Mise en page:</Label>
          <RadioGroup 
            value={layout} 
            onValueChange={(v) => setLayout(v as LayoutOption)}
            className="flex gap-4"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="1" id="layout-1" />
              <Label htmlFor="layout-1" className="text-sm cursor-pointer">1 par page</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="2" id="layout-2" />
              <Label htmlFor="layout-2" className="text-sm cursor-pointer">2 par page</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="4" id="layout-4" />
              <Label htmlFor="layout-4" className="text-sm cursor-pointer">4 par page</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Preview */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div 
            ref={printRef}
            className={`sheets-grid grid gap-4 py-4 ${
              layout === '4' ? 'grid-cols-2' : 'grid-cols-1'
            }`}
          >
            {books.map((book) => (
              <BookTechnicalSheet
                key={book.id}
                book={book}
                category={getCategoryById(book.categoryId)}
                compact={isCompact}
              />
            ))}
          </div>
        </ScrollArea>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4 mr-2" />
            Fermer
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
