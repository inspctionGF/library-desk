# BiblioSystem Database Schema

This document tracks the database structure for all modules in the application.

---

## Books Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| title | string | Book title |
| author | string | Author name |
| isbn | string | ISBN number |
| category | string | Category name |
| quantity | number | Total copies available |
| available | number | Currently available copies |
| coverUrl | string (optional) | URL to book cover image |
| createdAt | Date | Creation timestamp |

---

## Categories Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| name | string | Category name |
| color | string | Color code for display |
| bookCount | number | Number of books in category |

---

## Tasks Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| title | string | Task title |
| description | string (optional) | Task description |
| priority | enum | 'low' \| 'medium' \| 'high' |
| status | enum | 'pending' \| 'in-progress' \| 'completed' |
| dueDate | Date (optional) | Due date for the task |
| createdAt | Date | Creation timestamp |

---

## Classes Module (Planned)

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| name | string | Class/grade name |
| teacherName | string | Teacher's name |
| participantCount | number | Number of students |
| createdAt | Date | Creation timestamp |

---

## Participants Module (Planned)

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| firstName | string | First name |
| lastName | string | Last name |
| classId | string (FK) | Reference to Classes |
| pin | string | PIN code for login |
| createdAt | Date | Creation timestamp |

---

## Loans Module (Planned)

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| bookId | string (FK) | Reference to Books |
| participantId | string (FK) | Reference to Participants |
| checkoutDate | Date | Date book was borrowed |
| dueDate | Date | Expected return date |
| returnDate | Date (optional) | Actual return date |
| status | enum | 'active' \| 'returned' \| 'overdue' |

---

## Reading Sessions Module (Planned)

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| participantId | string (FK) | Reference to Participants |
| bookId | string (FK) | Reference to Books |
| sessionDate | Date | Date of reading session |
| notes | string (optional) | Session notes |
