import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Category } from '@/hooks/useLibraryStore';

interface ImportBooksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  onImport: (books: Array<{
    title: string;
    author: string;
    isbn: string;
    categoryId: string;
    quantity: number;
    coverUrl: string;
  }>) => void;
}

interface ParsedBook {
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  coverUrl: string;
}

export function ImportBooksDialog({ open, onOpenChange, categories, onImport }: ImportBooksDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [parsedBooks, setParsedBooks] = useState<ParsedBook[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const resetState = () => {
    setFile(null);
    setParsedBooks([]);
    setErrors([]);
    setIsProcessing(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setErrors(['Please select a CSV file.']);
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = async (csvFile: File) => {
    setIsProcessing(true);
    setErrors([]);
    setParsedBooks([]);

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        setErrors(['CSV file must have a header row and at least one data row.']);
        setIsProcessing(false);
        return;
      }

      const header = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
      const requiredColumns = ['title', 'author'];
      const missingColumns = requiredColumns.filter(col => !header.includes(col));

      if (missingColumns.length > 0) {
        setErrors([`Missing required columns: ${missingColumns.join(', ')}`]);
        setIsProcessing(false);
        return;
      }

      const titleIdx = header.indexOf('title');
      const authorIdx = header.indexOf('author');
      const isbnIdx = header.indexOf('isbn');
      const categoryIdx = header.indexOf('category');
      const quantityIdx = header.indexOf('quantity');
      const coverUrlIdx = header.indexOf('coverurl') !== -1 ? header.indexOf('coverurl') : header.indexOf('cover_url');

      const books: ParsedBook[] = [];
      const parseErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        
        const title = values[titleIdx]?.trim();
        const author = values[authorIdx]?.trim();

        if (!title || !author) {
          parseErrors.push(`Row ${i + 1}: Missing title or author`);
          continue;
        }

        books.push({
          title,
          author,
          isbn: isbnIdx !== -1 ? values[isbnIdx]?.trim() || '' : '',
          category: categoryIdx !== -1 ? values[categoryIdx]?.trim() || '' : '',
          quantity: quantityIdx !== -1 ? parseInt(values[quantityIdx]) || 1 : 1,
          coverUrl: coverUrlIdx !== -1 ? values[coverUrlIdx]?.trim() || '' : '',
        });
      }

      setParsedBooks(books);
      setErrors(parseErrors);
    } catch (error) {
      setErrors(['Failed to parse CSV file. Please check the format.']);
    }

    setIsProcessing(false);
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const findCategoryId = (categoryName: string): string => {
    if (!categoryName) return categories[0]?.id || '';
    const found = categories.find(c => 
      c.name.toLowerCase() === categoryName.toLowerCase()
    );
    return found?.id || categories[0]?.id || '';
  };

  const handleImport = () => {
    const booksToImport = parsedBooks.map(book => ({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      categoryId: findCategoryId(book.category),
      quantity: book.quantity,
      coverUrl: book.coverUrl,
    }));

    onImport(booksToImport);
    resetState();
    onOpenChange(false);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Import Books from CSV</DialogTitle>
          <DialogDescription>
            Upload a CSV file with columns: title, author, isbn (optional), category (optional), quantity (optional)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-foreground">
                <FileText className="h-5 w-5" />
                <span className="font-medium">{file.name}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to select a CSV file or drag and drop
                </p>
              </div>
            )}
          </div>

          {/* Processing indicator */}
          {isProcessing && (
            <p className="text-sm text-muted-foreground text-center">Processing file...</p>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.slice(0, 5).map((error, idx) => (
                    <li key={idx} className="text-sm">{error}</li>
                  ))}
                  {errors.length > 5 && (
                    <li className="text-sm">...and {errors.length - 5} more errors</li>
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Success Preview */}
          {parsedBooks.length > 0 && (
            <Alert className="border-primary/50 bg-primary/5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                <strong>{parsedBooks.length} books</strong> ready to import
                <div className="mt-2 max-h-32 overflow-y-auto text-sm text-muted-foreground">
                  {parsedBooks.slice(0, 5).map((book, idx) => (
                    <div key={idx}>• {book.title} by {book.author}</div>
                  ))}
                  {parsedBooks.length > 5 && (
                    <div>...and {parsedBooks.length - 5} more</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={parsedBooks.length === 0 || isProcessing}
          >
            Import {parsedBooks.length > 0 ? `${parsedBooks.length} Books` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}