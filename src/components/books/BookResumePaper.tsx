import { QRCodeSVG } from 'qrcode.react';
import { Star, BookOpen } from 'lucide-react';
import type { Book, Category } from '@/hooks/useLibraryStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BookResumePaperProps {
  book: Book;
  category?: Category;
  participantNumber: string;
  date: Date;
  config: {
    churchName: string;
    cdejNumber: string;
  };
}

export function BookResumePaper({ book, category, participantNumber, date, config }: BookResumePaperProps) {
  // Build QR code data
  const qrData = `📖 FICHE RÉSUMÉ
👤 ${participantNumber}
📚 ${book.title}
✍️ ${book.author}
📁 ${category?.name || 'N/A'}
📅 ${format(date, 'dd/MM/yyyy')}
🏛️ ${config.churchName}`;

  return (
    <div className="book-resume-paper w-full bg-white text-black p-6 border border-gray-300" style={{ minHeight: '297mm', maxWidth: '210mm' }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">FICHE DE RÉSUMÉ DE LECTURE</h1>
        </div>
        <p className="text-sm text-gray-600">{config.churchName} • CDEJ {config.cdejNumber}</p>
      </div>

      {/* Info Section */}
      <div className="flex gap-6 mb-6 pb-4 border-b border-gray-300">
        <div className="flex-shrink-0">
          <QRCodeSVG 
            value={qrData}
            size={100}
            level="M"
            className="border border-gray-200 p-1"
          />
        </div>
        <div className="flex-1 space-y-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div>
              <span className="font-semibold">Participant :</span>
              <span className="ml-2">{participantNumber}</span>
            </div>
            <div>
              <span className="font-semibold">Date :</span>
              <span className="ml-2">{format(date, 'dd MMMM yyyy', { locale: fr })}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-200">
            <p className="font-semibold text-lg">{book.title}</p>
            <p className="text-gray-600">par {book.author}</p>
            {category && (
              <span className="inline-flex items-center gap-1.5 text-sm mt-1" style={{ color: category.color }}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </span>
            )}
          </div>
        </div>
        {book.coverUrl && (
          <div className="flex-shrink-0 w-16 h-24 bg-gray-100 rounded overflow-hidden">
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="mb-6">
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-primary rounded-full" />
          RÉSUMÉ DU LIVRE
        </h2>
        <div className="border border-gray-300 rounded-lg p-4 min-h-[180px]">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="border-b border-gray-200 h-7 last:border-b-0" />
          ))}
        </div>
      </div>

      {/* What I Learned Section */}
      <div className="mb-6">
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-secondary rounded-full" />
          CE QUE J'AI APPRIS / AIMÉ
        </h2>
        <div className="border border-gray-300 rounded-lg p-4 min-h-[120px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border-b border-gray-200 h-7 last:border-b-0" />
          ))}
        </div>
      </div>

      {/* Rating Section */}
      <div className="mb-6">
        <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
          <span className="w-1 h-5 bg-accent rounded-full" />
          MA NOTE
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 mr-2">Colorie les étoiles :</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-8 w-8 text-gray-300 stroke-gray-400" strokeWidth={1} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-300 flex justify-between items-end">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">Signature du participant :</p>
          <div className="border-b border-gray-400 w-48 h-8" />
        </div>
        <div className="flex-1 text-right">
          <p className="text-sm text-gray-600 mb-2">Date :</p>
          <div className="border-b border-gray-400 w-32 h-8 ml-auto" />
        </div>
      </div>
    </div>
  );
}
