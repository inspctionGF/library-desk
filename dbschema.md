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

## User Profiles Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| name | string | Full name |
| email | string | Email address |
| role | enum | 'admin' \| 'guest' |
| phone | string (optional) | Phone number |
| notes | string (optional) | Additional notes |
| avatarUrl | string (optional) | URL to avatar image |
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

---

## System Configuration

| Column | Type | Description |
|--------|------|-------------|
| cdejNumber | string | Numéro CDEJ (format: HA-####) |
| churchName | string | Nom de l'église |
| directorName | string | Nom du directeur |
| documentationManagerName | string | Nom du responsable du centre |
| email | string | Email du centre |
| address | string | Adresse complète |
| phone | string | Numéro de téléphone |
| adminPin | string | PIN administrateur (6 chiffres) |
| isConfigured | boolean | État de configuration |
| configuredAt | Date | Date de configuration |

---

## Guest PINs Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| pin | string | PIN à 6 chiffres |
| createdAt | Date | Date de création |
| expiresAt | Date | Date d'expiration (24h après création) |
| usedAt | Date (optional) | Date d'utilisation |
| isActive | boolean | État du PIN (actif/révoqué) |

Notes:
- Les PINs invités sont à usage unique
- Ils expirent automatiquement après 24 heures
- L'admin peut les révoquer manuellement

---

## Extra Activity Types Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| name | string | Nom du type (ex: Réunion staff, Évangélisation) |
| color | string | Couleur pour l'affichage |
| description | string (optional) | Description du type |
| createdAt | Date | Date de création |

---

## Extra Activities Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| activityTypeId | string (FK) | Référence vers Extra Activity Types |
| date | Date | Date de l'activité |
| memo | string | Notes/mémo sur l'activité |
| createdAt | Date | Date de création |

Notes:
- Les activités extra sont des événements non liés aux lectures
- Exemples : Réunion staff, Évangélisation, Formation, Visite

---

## Book Resumes Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| participantNumber | string | Numéro participant (format: HA-XXXX-XXXXX) |
| bookId | string (FK) | Référence vers Books |
| date | Date | Date de la fiche |
| status | enum | 'generated' \| 'submitted' \| 'reviewed' |
| summary | string (optional) | Résumé écrit par le participant |
| whatILearned | string (optional) | Ce que le participant a appris |
| rating | number (optional) | Note de 1 à 5 |
| submittedAt | Date (optional) | Date de soumission |
| reviewedAt | Date (optional) | Date de révision |
| createdAt | Date | Date de création |

Notes:
- Les fiches sont générées pour impression avec espaces vides pour écrire
- Le contenu peut être archivé numériquement par l'admin
- QR code embarque les données participant/livre/date
