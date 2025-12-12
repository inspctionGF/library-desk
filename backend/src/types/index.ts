// Core entity types matching frontend

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category_id?: string;
  quantity: number;
  available_copies: number;
  cover_url?: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  book_count: number;
  created_at: string;
}

export interface Class {
  id: string;
  name: string;
  age_range: string;
  monitor_name?: string;
  created_at: string;
}

export interface Participant {
  id: string;
  number: string;
  first_name: string;
  last_name: string;
  age: number;
  age_range: string;
  class_id?: string;
  gender: 'M' | 'F';
  created_at: string;
}

export interface OtherReader {
  id: string;
  number: string;
  first_name: string;
  last_name: string;
  reader_type: 'parent' | 'instructor' | 'staff' | 'other';
  phone?: string;
  email?: string;
  notes?: string;
  created_at: string;
}

export interface Loan {
  id: string;
  book_id: string;
  borrower_type: 'participant' | 'other_reader';
  borrower_id: string;
  borrower_name: string;
  loan_date: string;
  due_date: string;
  return_date?: string;
  status: 'active' | 'overdue' | 'returned';
  created_at: string;
}

export interface ReadingSession {
  id: string;
  participant_id: string;
  book_id: string;
  date: string;
  reading_type: 'assignment' | 'research' | 'normal';
  notes?: string;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: string;
  created_at: string;
}

export interface Material {
  id: string;
  name: string;
  type_id?: string;
  serial_number?: string;
  quantity: number;
  available_quantity: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  created_at: string;
}

export interface BookIssue {
  id: string;
  book_id: string;
  issue_type: 'not_returned' | 'damaged' | 'torn' | 'lost';
  quantity: number;
  borrower_name?: string;
  loan_id?: string;
  report_date: string;
  status: 'open' | 'resolved' | 'written_off';
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
  module: string;
  entity_id?: string;
  entity_type?: string;
  details?: string;
  user_id?: string;
  previous_hash?: string;
  current_hash?: string;
  created_at: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
