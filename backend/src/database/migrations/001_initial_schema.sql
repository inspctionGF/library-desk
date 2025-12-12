-- BiblioSystem Initial Schema
-- Version: 1.0.0

-- System Configuration
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  book_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Books
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
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
  class_id TEXT REFERENCES classes(id) ON DELETE SET NULL,
  gender TEXT CHECK(gender IN ('M', 'F')),
  created_at TEXT DEFAULT (datetime('now'))
);

-- Other Readers
CREATE TABLE IF NOT EXISTS other_readers (
  id TEXT PRIMARY KEY,
  number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  reader_type TEXT NOT NULL CHECK(reader_type IN ('parent', 'instructor', 'staff', 'other')),
  phone TEXT,
  email TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Loans
CREATE TABLE IF NOT EXISTS loans (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
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
  participant_id TEXT REFERENCES participants(id) ON DELETE CASCADE,
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  reading_type TEXT NOT NULL CHECK(reading_type IN ('assignment', 'research', 'normal')),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Class Reading Sessions
CREATE TABLE IF NOT EXISTS class_reading_sessions (
  id TEXT PRIMARY KEY,
  class_id TEXT REFERENCES classes(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  attendee_count INTEGER NOT NULL,
  session_type TEXT DEFAULT 'bulk' CHECK(session_type IN ('bulk', 'detailed')),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed')),
  due_date TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Guest PINs
CREATE TABLE IF NOT EXISTS guest_pins (
  id TEXT PRIMARY KEY,
  pin TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL,
  used INTEGER DEFAULT 0,
  used_at TEXT
);

-- Material Types
CREATE TABLE IF NOT EXISTS material_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#14B8A6',
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Materials
CREATE TABLE IF NOT EXISTS materials (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type_id TEXT REFERENCES material_types(id) ON DELETE SET NULL,
  serial_number TEXT,
  quantity INTEGER DEFAULT 1,
  available_quantity INTEGER DEFAULT 1,
  condition TEXT DEFAULT 'good' CHECK(condition IN ('excellent', 'good', 'fair', 'poor')),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Entities (External organizations)
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  contact_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Material Loans
CREATE TABLE IF NOT EXISTS material_loans (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  borrower_type TEXT NOT NULL CHECK(borrower_type IN ('participant', 'entity')),
  borrower_id TEXT NOT NULL,
  borrower_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  loan_date TEXT DEFAULT (date('now')),
  due_date TEXT NOT NULL,
  return_date TEXT,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'overdue', 'returned')),
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Extra Activity Types
CREATE TABLE IF NOT EXISTS extra_activity_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#F97316',
  description TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Extra Activities
CREATE TABLE IF NOT EXISTS extra_activities (
  id TEXT PRIMARY KEY,
  type_id TEXT REFERENCES extra_activity_types(id) ON DELETE SET NULL,
  date TEXT NOT NULL,
  memo TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Book Resumes
CREATE TABLE IF NOT EXISTS book_resumes (
  id TEXT PRIMARY KEY,
  participant_id TEXT REFERENCES participants(id) ON DELETE CASCADE,
  participant_number TEXT NOT NULL,
  book_id TEXT REFERENCES books(id) ON DELETE CASCADE,
  date TEXT DEFAULT (date('now')),
  status TEXT DEFAULT 'generated' CHECK(status IN ('generated', 'submitted', 'reviewed')),
  summary_text TEXT,
  learning_notes TEXT,
  rating INTEGER CHECK(rating BETWEEN 1 AND 5),
  reviewed_at TEXT,
  reviewer_notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Inventory Sessions
CREATE TABLE IF NOT EXISTS inventory_sessions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  session_type TEXT DEFAULT 'annual' CHECK(session_type IN ('annual', 'quarterly', 'adhoc')),
  status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'completed', 'cancelled')),
  start_date TEXT DEFAULT (date('now')),
  end_date TEXT,
  total_books INTEGER DEFAULT 0,
  checked_books INTEGER DEFAULT 0,
  discrepancy_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES inventory_sessions(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  expected_quantity INTEGER NOT NULL,
  found_quantity INTEGER,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'checked', 'discrepancy')),
  notes TEXT,
  checked_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Book Issues
CREATE TABLE IF NOT EXISTS book_issues (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  issue_type TEXT NOT NULL CHECK(issue_type IN ('not_returned', 'damaged', 'torn', 'lost')),
  quantity INTEGER DEFAULT 1,
  borrower_name TEXT,
  loan_id TEXT REFERENCES loans(id) ON DELETE SET NULL,
  report_date TEXT DEFAULT (date('now')),
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'resolved', 'written_off')),
  resolution_notes TEXT,
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  action TEXT NOT NULL CHECK(action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')),
  module TEXT NOT NULL,
  entity_id TEXT,
  entity_type TEXT,
  details TEXT,
  user_id TEXT,
  previous_hash TEXT,
  current_hash TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('task', 'loan', 'issue', 'inventory', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_id TEXT,
  entity_type TEXT,
  read INTEGER DEFAULT 0,
  read_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Feedback
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('bug', 'feature', 'question', 'other')),
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'reviewed')),
  reviewed_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- User Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT DEFAULT 'admin',
  phone TEXT,
  address TEXT,
  avatar_data TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
