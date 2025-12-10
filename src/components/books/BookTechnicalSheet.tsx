import { QRCodeSVG } from 'qrcode.react';
import { BookCopy } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { Book, Category } from '@/hooks/useLibraryStore';

interface BookTechnicalSheetProps {
  book: Book;
  category?: Category;
  compact?: boolean;
}

export function BookTechnicalSheet({ book, category, compact = false }: BookTechnicalSheetProps) {
  // Create embedded data for QR code (readable offline)
  const qrData = [
    `📖 ${book.title}`,
    `👤 ${book.author}`,
    book.isbn ? `📕 ISBN: ${book.isbn}` : null,
    category ? `📁 Catégorie: ${category.name}` : null,
    `📦 Stock: ${book.availableCopies}/${book.quantity} disponibles`,
    `📅 Ajouté: ${format(new Date(book.createdAt), 'dd/MM/yyyy', { locale: fr })}`,
  ].filter(Boolean).join('\n');

  const qrSize = compact ? 80 : 120;

  return (
    <div 
      className={`book-sheet bg-card border border-border rounded-lg overflow-hidden ${compact ? 'p-3' : 'p-6'}`}
      style={{ pageBreakInside: 'avoid' }}
    >
      {/* Header */}
      <div className={`flex items-center gap-2 border-b border-border ${compact ? 'pb-2 mb-3' : 'pb-4 mb-4'}`}>
        <BookCopy className={`text-primary ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <h2 className={`font-semibold text-foreground ${compact ? 'text-sm' : 'text-base'}`}>
          Fiche Technique
        </h2>
      </div>

      {/* Content */}
      <div className={`flex gap-4 ${compact ? 'flex-row' : 'flex-col sm:flex-row'}`}>
        {/* Cover and QR */}
        <div className={`flex ${compact ? 'flex-row gap-3' : 'flex-col sm:flex-row gap-4'}`}>
          {/* Book Cover */}
          <div 
            className={`bg-muted rounded-md flex items-center justify-center overflow-hidden flex-shrink-0 ${
              compact ? 'w-16 h-20' : 'w-24 h-32'
            }`}
          >
            {book.coverUrl ? (
              <img 
                src={book.coverUrl} 
                alt={book.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <BookCopy className={`text-muted-foreground/40 ${compact ? 'h-6 w-6' : 'h-10 w-10'}`} />
            )}
          </div>

          {/* QR Code */}
          <div className="flex-shrink-0">
            <QRCodeSVG 
              value={qrData} 
              size={qrSize}
              level="M"
              includeMargin={false}
              className="rounded"
            />
            <p className={`text-muted-foreground text-center mt-1 ${compact ? 'text-[8px]' : 'text-[10px]'}`}>
              Scanner pour détails
            </p>
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-foreground ${compact ? 'text-sm line-clamp-1' : 'text-lg line-clamp-2'}`}>
            {book.title}
          </h3>
          <p className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
            par {book.author}
          </p>

          <div className={`mt-3 space-y-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
            {book.isbn && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">ISBN:</span>
                <span className="font-mono text-foreground">{book.isbn}</span>
              </div>
            )}
            {category && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Catégorie:</span>
                <span 
                  className="inline-flex items-center gap-1"
                  style={{ color: category.color }}
                >
                  <span 
                    className="h-2 w-2 rounded-full" 
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Stock:</span>
              <span className="text-foreground font-medium">
                {book.availableCopies} / {book.quantity} disponibles
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Ajouté le:</span>
              <span className="text-foreground">
                {format(new Date(book.createdAt), 'dd MMMM yyyy', { locale: fr })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`border-t border-border text-muted-foreground ${compact ? 'mt-3 pt-2 text-[8px]' : 'mt-4 pt-3 text-xs'}`}>
        Généré le {format(new Date(), 'dd/MM/yyyy à HH:mm', { locale: fr })}
      </div>
    </div>
  );
}
