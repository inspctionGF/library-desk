-- Performance Indexes
-- Version: 1.0.0

-- Books indexes
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_title ON books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON books(author);
CREATE INDEX IF NOT EXISTS idx_books_isbn ON books(isbn);

-- Participants indexes
CREATE INDEX IF NOT EXISTS idx_participants_class ON participants(class_id);
CREATE INDEX IF NOT EXISTS idx_participants_number ON participants(number);
CREATE INDEX IF NOT EXISTS idx_participants_name ON participants(last_name, first_name);

-- Loans indexes
CREATE INDEX IF NOT EXISTS idx_loans_book ON loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_borrower ON loans(borrower_type, borrower_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_due_date ON loans(due_date);

-- Reading sessions indexes
CREATE INDEX IF NOT EXISTS idx_reading_sessions_participant ON reading_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book ON reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_date ON reading_sessions(date);

-- Materials indexes
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type_id);
CREATE INDEX IF NOT EXISTS idx_material_loans_material ON material_loans(material_id);
CREATE INDEX IF NOT EXISTS idx_material_loans_status ON material_loans(status);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_session ON inventory_items(session_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_book ON inventory_items(book_id);

-- Book issues indexes
CREATE INDEX IF NOT EXISTS idx_book_issues_book ON book_issues(book_id);
CREATE INDEX IF NOT EXISTS idx_book_issues_status ON book_issues(status);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_log_module ON audit_log(module);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
