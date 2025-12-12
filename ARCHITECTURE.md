# BiblioSystem Architecture Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Application Structure](#application-structure)
3. [Component Architecture](#component-architecture)
4. [State Management](#state-management)
5. [Routing & Navigation](#routing--navigation)
6. [Data Models](#data-models)
7. [Node.js + SQLite Integration Guide](#nodejs--sqlite-integration-guide)
8. [Deployment Considerations](#deployment-considerations)

---

## Project Overview

BiblioSystem is a library management system designed for CDEJ documentation centers. It manages books, participants, loans, reading sessions, and various administrative functions. The application is built as a React SPA with localStorage persistence, designed for future migration to a Node.js/SQLite backend.

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| State Management | Zustand (via custom hooks) |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Current Storage | localStorage |
| Future Backend | Node.js + Express + SQLite |

---

## Application Structure

```
BiblioSystem/
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── placeholder.svg
├── src/
│   ├── assets/                    # Static assets
│   │   ├── bibliosystem-icon.svg
│   │   ├── bibliosystem-logo.svg
│   │   └── developer-photo.png
│   ├── components/                # Reusable components
│   │   ├── ui/                    # shadcn/ui base components (40+)
│   │   ├── layout/                # AdminLayout, AdminSidebar
│   │   ├── books/                 # Book-related components
│   │   ├── loans/                 # Loan management (POS interface)
│   │   ├── participants/          # Participant management
│   │   ├── classes/               # Class management
│   │   ├── materials/             # Materials & entities
│   │   ├── inventory/             # Inventory sessions
│   │   ├── reading-sessions/      # Reading session tracking
│   │   ├── reports/               # Report generation
│   │   ├── dashboard/             # Dashboard widgets
│   │   ├── tasks/                 # Task management
│   │   ├── notifications/         # Notification system
│   │   ├── feedback/              # User feedback
│   │   ├── book-issues/           # Issue tracking
│   │   ├── extra-activities/      # Extra activities
│   │   ├── other-readers/         # Non-participant readers
│   │   ├── profiles/              # User profiles
│   │   ├── onboarding/            # Onboarding flow
│   │   ├── guide/                 # Welcome guide
│   │   ├── search/                # Global search
│   │   └── skeletons/             # Loading skeletons
│   ├── data/                      # Static data
│   │   └── welcomeGuideSteps.ts
│   ├── hooks/                     # Custom React hooks
│   │   ├── useLibraryStore.ts     # Main data store
│   │   ├── useAuditedLibraryStore.ts # Audit wrapper
│   │   ├── useAuth.ts             # Authentication
│   │   ├── useSystemConfig.ts     # System configuration
│   │   ├── useAuditLog.ts         # Audit logging
│   │   ├── useGlobalSearch.ts     # Search functionality
│   │   ├── useGuestPins.ts        # Guest PIN management
│   │   ├── useGuideState.ts       # Welcome guide state
│   │   ├── useLoadingState.ts     # Loading states
│   │   ├── usePagination.ts       # Table pagination
│   │   └── use-mobile.tsx         # Mobile detection
│   ├── lib/                       # Utilities
│   │   ├── utils.ts               # General utilities
│   │   └── ageRanges.ts           # Age range helpers
│   ├── pages/                     # Page components (29 pages)
│   ├── App.tsx                    # Main app with routing
│   ├── App.css                    # Global styles
│   ├── index.css                  # Tailwind + design tokens
│   ├── main.tsx                   # Entry point
│   └── vite-env.d.ts
├── dbschema.md                    # Database schema documentation
├── ARCHITECTURE.md                # This file
├── README.md
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## Component Architecture

### Hierarchy

```
App.tsx
├── AdminLayout (authenticated routes)
│   ├── AdminSidebar
│   │   ├── NavLink
│   │   ├── ProfileDropdown
│   │   ├── GlobalSearch
│   │   └── Database Widget
│   └── Page Components
│       ├── Feature Components
│       │   └── Dialog Components
│       └── UI Components (shadcn/ui)
└── Public Routes (Login, Onboarding)
```

### Feature Modules

| Module | Components | Purpose |
|--------|------------|---------|
| `books/` | BookCard, BookList, BookFormDialog, etc. | Book catalog management |
| `loans/` | POSLoanInterface, BookSearchGrid, CheckoutCart, etc. | POS-style loan management |
| `participants/` | ParticipantFormDialog, ImportDialog, JournalDialog | Participant management |
| `classes/` | ClassFormDialog, DeleteClassDialog | Class/grade management |
| `materials/` | MaterialCard, EntityCard, LoanFormDialog | Non-book resource tracking |
| `inventory/` | StartInventoryDialog, InventoryBookCard | Stock verification |
| `reports/` | ReportTabs (Book, Class, Participant, Loan, etc.) | Analytics & reporting |
| `dashboard/` | StatCard, Charts, Widgets | Dashboard components |

### UI Component Library (shadcn/ui)

Located in `src/components/ui/`, includes 40+ base components:
- Layout: Card, Dialog, Sheet, Tabs, Accordion
- Forms: Input, Select, Checkbox, Radio, Switch, Calendar
- Navigation: Button, Dropdown, Command, Navigation Menu
- Feedback: Toast, Alert, Badge, Progress, Skeleton
- Data Display: Table, Avatar, Separator, Tooltip

---

## State Management

### Core Store: `useLibraryStore`

The main Zustand store managing all application data:

```typescript
// src/hooks/useLibraryStore.ts

interface LibraryState {
  // Data collections
  books: Book[];
  categories: Category[];
  participants: Participant[];
  classes: Class[];
  loans: Loan[];
  readingSessions: ReadingSession[];
  tasks: Task[];
  materials: Material[];
  // ... more collections

  // CRUD operations
  addBook: (book: Omit<Book, 'id' | 'createdAt'>) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  // ... more operations

  // Queries
  getBookById: (id: string) => Book | undefined;
  getActiveLoansForParticipant: (id: string) => Loan[];
  getLoanStats: () => LoanStats;
  // ... more queries
}
```

### Audited Store: `useAuditedLibraryStore`

Wrapper that intercepts all mutations for audit logging:

```typescript
// src/hooks/useAuditedLibraryStore.ts

// Wraps useLibraryStore operations to automatically log:
// - CREATE: addBook, addLoan, addParticipant, etc.
// - UPDATE: updateBook, renewLoan, etc.
// - DELETE: deleteBook, returnLoan, etc.
```

### Supporting Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Authentication state (admin PIN, guest access) |
| `useSystemConfig` | CDEJ configuration, admin settings |
| `useAuditLog` | Audit log operations with hash chain |
| `useGuestPins` | Temporary guest PIN management |
| `usePagination` | Table pagination logic |
| `useGlobalSearch` | Cross-module search |

---

## Routing & Navigation

### Route Structure

```typescript
// src/App.tsx

<Routes>
  {/* Public Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/onboarding" element={<Onboarding />} />

  {/* Protected Routes (Admin) */}
  <Route element={<AdminLayout />}>
    <Route path="/" element={<Index />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/books" element={<Books />} />
    <Route path="/categories" element={<Categories />} />
    <Route path="/classes" element={<Classes />} />
    <Route path="/participants" element={<Participants />} />
    <Route path="/loans" element={<Loans />} />
    <Route path="/reading-sessions" element={<ReadingSessions />} />
    <Route path="/book-resumes" element={<BookResumes />} />
    <Route path="/materials" element={<Materials />} />
    <Route path="/inventory" element={<Inventory />} />
    <Route path="/book-issues" element={<BookIssues />} />
    <Route path="/reports" element={<Reports />} />
    <Route path="/tasks" element={<Tasks />} />
    <Route path="/extra-activities" element={<ExtraActivities />} />
    <Route path="/other-readers" element={<OtherReaders />} />
    <Route path="/notifications" element={<Notifications />} />
    <Route path="/guest-pins" element={<GuestPins />} />
    <Route path="/audit-log" element={<AuditLog />} />
    <Route path="/profiles" element={<Profiles />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/settings" element={<Settings />} />
    <Route path="/feedback" element={<Feedback />} />
    <Route path="/help" element={<Help />} />
    <Route path="/about" element={<About />} />
  </Route>

  <Route path="*" element={<NotFound />} />
</Routes>
```

### Navigation Groups (Sidebar)

1. **Vue d'ensemble**: Dashboard
2. **Catalogue**: Books, Categories, Materials
3. **Personnes**: Classes, Participants, Other Readers
4. **Activités**: Reading Sessions, Loans, Book Resumes, Extra Activities
5. **Suivi & Contrôle**: Inventory, Book Issues, Audit Log
6. **Analyses**: Reports
7. **Administration**: Tasks, Guest PINs, Profiles, Settings

---

## Data Models

See `dbschema.md` for complete schema. Key entities:

### Core Entities

```typescript
interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  categoryId: string;
  quantity: number;
  availableCopies: number;
  coverUrl?: string;
  createdAt: string;
}

interface Participant {
  id: string;
  number: string;           // Format: HA-{CDEJ}-XXXXX
  firstName: string;
  lastName: string;
  age: number;
  ageRange: string;
  classId: string;
  gender: 'M' | 'F';
  createdAt: string;
}

interface Loan {
  id: string;
  bookId: string;
  borrowerType: 'participant' | 'other_reader';
  borrowerId: string;
  borrowerName: string;
  loanDate: string;
  dueDate: string;
  returnDate: string | null;
  status: 'active' | 'overdue' | 'returned';
}
```

---

## Node.js + SQLite Integration Guide

### Recommended Backend Structure

```
bibliosystem-backend/
├── src/
│   ├── database/
│   │   ├── connection.ts         # SQLite connection
│   │   ├── migrations/
│   │   │   ├── 001_initial.sql
│   │   │   └── 002_indexes.sql
│   │   └── seeds/
│   │       └── initial-data.sql
│   ├── routes/
│   │   ├── index.ts              # Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── books.routes.ts
│   │   ├── loans.routes.ts
│   │   ├── participants.routes.ts
│   │   ├── classes.routes.ts
│   │   ├── materials.routes.ts
│   │   └── reports.routes.ts
│   ├── services/
│   │   ├── book.service.ts
│   │   ├── loan.service.ts
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts                  # Express entry point
├── data/
│   └── bibliosystem.db           # SQLite database file
├── package.json
├── tsconfig.json
└── .env
```

### Dependencies

```bash
# Backend dependencies
npm install express cors helmet morgan dotenv
npm install better-sqlite3
npm install zod                   # Validation (matches frontend)

# Dev dependencies
npm install -D typescript ts-node nodemon
npm install -D @types/express @types/cors @types/better-sqlite3
```

### SQLite Connection Setup

```typescript
// src/database/connection.ts

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/bibliosystem.db');

const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

export default db;
```

### Initial Migration (SQL)

```sql
-- src/database/migrations/001_initial.sql

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  bookCount INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Books
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  category_id TEXT REFERENCES categories(id),
  quantity INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  cover_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Classes
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age_range TEXT NOT NULL,
  monitor_name TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Participants
CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  age_range TEXT NOT NULL,
  class_id TEXT REFERENCES classes(id),
  gender TEXT CHECK(gender IN ('M', 'F')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Other Readers
CREATE TABLE IF NOT EXISTS other_readers (
  id TEXT PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  reader_type TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Loans
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id),
  borrower_type TEXT NOT NULL CHECK(borrower_type IN ('participant', 'other_reader')),
  borrower_id TEXT NOT NULL,
  borrower_name TEXT NOT NULL,
  loan_date TEXT DEFAULT (date('now')),
  due_date TEXT NOT NULL,
  return_date TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'overdue', 'returned')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Reading Sessions
CREATE TABLE IF NOT EXISTS reading_sessions (
  id TEXT PRIMARY KEY,
  participant_id TEXT REFERENCES participants(id),
  book_id TEXT REFERENCES books(id),
  date TEXT NOT NULL,
  reading_type TEXT NOT NULL,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  due_date TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- System Config
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  entity_id TEXT,
  entity_type TEXT,
  details TEXT,
  user_id TEXT,
  previous_hash TEXT,
  current_hash TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_participants_class ON participants(class_id);
CREATE INDEX IF NOT EXISTS idx_loans_book ON loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_borrower ON loans(borrower_type, borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_participant ON reading_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
```

### Express Server Setup

```typescript
// src/index.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import routes from './routes';
import { errorMiddleware } from './middleware/error.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling
app.use(errorMiddleware);

app.listen(PORT, () => {
  console.log(`BiblioSystem API running on port ${PORT}`);
});
```

### Example Route Implementation

```typescript
// src/routes/books.routes.ts

import { Router } from 'express';
import db from '../database/connection';
import { z } from 'zod';

const router = Router();

// Validation schema
const bookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  isbn: z.string().optional(),
  categoryId: z.string(),
  quantity: z.number().min(1).default(1),
  coverUrl: z.string().url().optional()
});

// GET /api/books
router.get('/', (req, res) => {
  const { category, available, search } = req.query;
  
  let query = 'SELECT * FROM books WHERE 1=1';
  const params: any[] = [];

  if (category) {
    query += ' AND category_id = ?';
    params.push(category);
  }

  if (available === 'true') {
    query += ' AND available_copies > 0';
  }

  if (search) {
    query += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ' ORDER BY created_at DESC';

  const books = db.prepare(query).all(...params);
  res.json(books);
});

// GET /api/books/:id
router.get('/:id', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }
  
  res.json(book);
});

// POST /api/books
router.post('/', (req, res) => {
  const result = bookSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({ error: result.error.issues });
  }

  const { title, author, isbn, categoryId, quantity, coverUrl } = result.data;
  const id = crypto.randomUUID();

  const stmt = db.prepare(`
    INSERT INTO books (id, title, author, isbn, category_id, quantity, available_copies, cover_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, title, author, isbn, categoryId, quantity, quantity, coverUrl);

  // Update category book count
  db.prepare('UPDATE categories SET bookCount = bookCount + 1 WHERE id = ?').run(categoryId);

  const newBook = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  res.status(201).json(newBook);
});

// PUT /api/books/:id
router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  
  if (!existing) {
    return res.status(404).json({ error: 'Book not found' });
  }

  const updates = req.body;
  const fields = Object.keys(updates)
    .map(key => `${toSnakeCase(key)} = ?`)
    .join(', ');
  const values = Object.values(updates);

  db.prepare(`UPDATE books SET ${fields} WHERE id = ?`).run(...values, req.params.id);

  const updated = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/books/:id
router.delete('/:id', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  
  if (!book) {
    return res.status(404).json({ error: 'Book not found' });
  }

  db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  db.prepare('UPDATE categories SET bookCount = bookCount - 1 WHERE id = ?').run(book.category_id);

  res.status(204).send();
});

// Helper
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export default router;
```

### Frontend API Service Layer

Create a service layer to replace localStorage calls:

```typescript
// src/services/api.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  // Books
  getBooks: (params?: { category?: string; available?: boolean; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.available) searchParams.set('available', 'true');
    if (params?.search) searchParams.set('search', params.search);
    return request<Book[]>(`/books?${searchParams}`);
  },
  getBook: (id: string) => request<Book>(`/books/${id}`),
  createBook: (data: CreateBookInput) => request<Book>('/books', { method: 'POST', body: JSON.stringify(data) }),
  updateBook: (id: string, data: Partial<Book>) => request<Book>(`/books/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBook: (id: string) => request<void>(`/books/${id}`, { method: 'DELETE' }),

  // Loans
  getLoans: () => request<Loan[]>('/loans'),
  createLoan: (data: CreateLoanInput) => request<Loan>('/loans', { method: 'POST', body: JSON.stringify(data) }),
  returnLoan: (id: string) => request<Loan>(`/loans/${id}/return`, { method: 'POST' }),
  renewLoan: (id: string, newDueDate: string) => request<Loan>(`/loans/${id}/renew`, { method: 'POST', body: JSON.stringify({ dueDate: newDueDate }) }),

  // Add more endpoints as needed...
};
```

### Migrating useLibraryStore to API

```typescript
// src/hooks/useLibraryStore.ts (migrated version)

import { create } from 'zustand';
import { api } from '@/services/api';

interface LibraryState {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  
  // Async actions
  fetchBooks: () => Promise<void>;
  addBook: (book: CreateBookInput) => Promise<void>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  books: [],
  isLoading: false,
  error: null,

  fetchBooks: async () => {
    set({ isLoading: true, error: null });
    try {
      const books = await api.getBooks();
      set({ books, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addBook: async (bookData) => {
    try {
      const newBook = await api.createBook(bookData);
      set((state) => ({ books: [...state.books, newBook] }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  updateBook: async (id, updates) => {
    try {
      const updated = await api.updateBook(id, updates);
      set((state) => ({
        books: state.books.map((b) => (b.id === id ? updated : b)),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  deleteBook: async (id) => {
    try {
      await api.deleteBook(id);
      set((state) => ({
        books: state.books.filter((b) => b.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },
}));
```

### Alternative: React Query Integration

```typescript
// src/hooks/useBooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

export function useBooks(params?: { category?: string }) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: () => api.getBooks(params),
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ['books', id],
    queryFn: () => api.getBook(id),
    enabled: !!id,
  });
}

export function useCreateBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useUpdateBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Book> }) => 
      api.updateBook(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['books', id] });
    },
  });
}

export function useDeleteBook() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
```

### Vite Proxy Configuration

```typescript
// vite.config.ts

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

---

## Deployment Considerations

### Development Setup

```bash
# Terminal 1: Start backend
cd bibliosystem-backend
npm run dev

# Terminal 2: Start frontend
cd bibliosystem-frontend
npm run dev
```

### Production Build

```bash
# Build frontend
npm run build
# Output: dist/

# Build backend
npm run build
# Output: dist/
```

### Electron Packaging (Desktop App)

For offline desktop deployment:

```bash
npm install electron electron-builder --save-dev
```

```javascript
// electron/main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  // Start backend server
  backendProcess = spawn('node', [path.join(__dirname, '../backend/dist/index.js')]);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load frontend
  mainWindow.loadFile(path.join(__dirname, '../frontend/dist/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy backend
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --production

COPY backend/dist ./backend/dist
COPY backend/data ./backend/data

# Copy frontend build
COPY frontend/dist ./frontend/dist

# Serve frontend with backend
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### Backup Strategy

```typescript
// src/routes/backup.routes.ts

import { Router } from 'express';
import db from '../database/connection';
import fs from 'fs';
import path from 'path';

const router = Router();

// Export database as SQL dump
router.get('/export', (req, res) => {
  const backup = db.serialize();
  const filename = `bibliosystem_backup_${new Date().toISOString().split('T')[0]}.db`;
  
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(backup);
});

// Export as JSON
router.get('/export/json', (req, res) => {
  const tables = ['books', 'categories', 'participants', 'classes', 'loans', 'reading_sessions', 'tasks'];
  const data: Record<string, any[]> = {};

  tables.forEach(table => {
    data[table] = db.prepare(`SELECT * FROM ${table}`).all();
  });

  const filename = `bibliosystem_backup_${new Date().toISOString().split('T')[0]}.json`;
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.json(data);
});

export default router;
```

---

## Migration Checklist

When transitioning from localStorage to SQLite backend:

- [ ] Set up Node.js/Express backend project
- [ ] Create SQLite database with migrations
- [ ] Implement all API routes
- [ ] Create frontend API service layer
- [ ] Update useLibraryStore to use API calls
- [ ] Add loading states to UI components
- [ ] Handle API errors gracefully
- [ ] Test all CRUD operations
- [ ] Migrate existing localStorage data to SQLite
- [ ] Update authentication to use backend sessions
- [ ] Configure CORS and security headers
- [ ] Set up backup automation
- [ ] Package for distribution (Electron or Docker)

---

## Support

For questions or issues:
- Review `dbschema.md` for data model details
- Check component documentation in respective folders
- Contact: EXTENDED Software Development

---

*Last updated: December 2024*
*Version: 1.0.0*
