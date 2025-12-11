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
| avatarUrl | string (optional) | URL or base64 data URL to avatar image |
| avatarData | string (optional) | Base64 encoded image data for offline storage |
| createdAt | Date | Creation timestamp |

Notes:
- avatarData stores the profile picture as base64 for offline usage
- Password changes are handled via System Configuration (adminPin)

---

## Classes Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| name | string | Nom de la classe |
| ageRange | enum | '3-5' \| '6-8' \| '9-11' \| '12-14' \| '15-18' \| '19-22' |
| monitorName | string | Nom du moniteur |
| createdAt | Date | Date de création |

---

## Participants Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| participantNumber | string | Numéro participant (format: HA-{CDEJ}-XXXXX) |
| firstName | string | Prénom |
| lastName | string | Nom |
| age | number | Âge en années |
| ageRange | enum | '3-5' \| '6-8' \| '9-11' \| '12-14' \| '15-18' \| '19-22' (auto-calculé) |
| classId | string (FK) | Référence vers Classes (contrainte d'âge) |
| gender | enum | 'M' \| 'F' |
| createdAt | Date | Date de création |

Notes:
- La tranche d'âge est calculée automatiquement à partir de l'âge
- Un participant ne peut être assigné qu'à une classe de sa tranche d'âge

---

## Loans Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| bookId | string (FK) | Référence vers Books |
| participantId | string (FK) | Référence vers Participants |
| participantName | string | Nom complet (dénormalisé pour affichage) |
| loanDate | Date | Date du prêt |
| dueDate | Date | Date de retour prévue |
| returnDate | Date (optional) | Date de retour effective |
| status | enum | 'active' \| 'returned' \| 'overdue' |

Notes:
- Maximum 3 prêts actifs par participant
- availableCopies du livre diminue/augmente automatiquement
- Statut 'overdue' calculé automatiquement si dueDate < today

---

## Reading Sessions Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| participantId | string (FK) | Référence vers Participants |
| bookId | string (FK) | Référence vers Books |
| sessionDate | Date | Date de la session de lecture |
| readingType | enum | 'assignment' \| 'research' \| 'normal' |
| notes | string (optional) | Notes additionnelles |
| classSessionId | string (FK, optional) | Lien vers ClassReadingSession si créé via session de classe |
| createdAt | Date | Date de création |

Notes:
- assignment = Devoir (lecture assignée)
- research = Recherche (recherche documentaire)
- normal = Lecture normale (lecture libre)

---

## Class Reading Sessions Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| classId | string (FK) | Référence vers SchoolClass |
| sessionDate | Date | Date de la session |
| attendeeCount | number | Nombre de participants présents |
| sessionType | enum | 'bulk' \| 'detailed' |
| notes | string (optional) | Notes optionnelles |
| createdAt | Date | Date de création |

Notes:
- bulk = Enregistrement rapide (nombre de présents uniquement)
- detailed = Enregistrement détaillé (sessions individuelles générées pour chaque participant coché)

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

---

## Inventory Sessions Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| name | string | Nom de l'inventaire (ex: "Inventaire Annuel 2024") |
| type | enum | 'annual' \| 'adhoc' (annuel ou ponctuel) |
| status | enum | 'in_progress' \| 'completed' \| 'cancelled' |
| startDate | Date | Date de début |
| endDate | Date (optional) | Date de fin (quand complété) |
| totalBooks | number | Nombre total de livres à vérifier |
| checkedBooks | number | Nombre de livres vérifiés |
| foundBooks | number | Nombre de livres trouvés (somme des quantités trouvées) |
| missingBooks | number | Nombre de livres manquants |
| notes | string (optional) | Notes additionnelles |
| createdAt | Date | Date de création |

Notes:
- Un seul inventaire peut être en cours à la fois
- Les statistiques sont calculées automatiquement lors des vérifications

---

## Inventory Items Module

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| inventorySessionId | string (FK) | Référence vers InventorySession |
| bookId | string (FK) | Référence vers Books |
| expectedQuantity | number | Quantité attendue (selon le système) |
| foundQuantity | number (optional) | Quantité trouvée physiquement |
| status | enum | 'pending' \| 'checked' \| 'discrepancy' |
| checkedAt | Date (optional) | Date de vérification |
| notes | string (optional) | Notes (ex: livre endommagé) |

Notes:
- status = 'discrepancy' si foundQuantity != expectedQuantity
- Chaque livre du catalogue génère un InventoryItem au démarrage d'un inventaire

---

## Book Issues Module (Livres non retournés)

| Column | Type | Description |
|--------|------|-------------|
| id | string (UUID) | Primary key |
| bookId | string (FK) | Référence vers Books |
| issueType | enum | 'not_returned' \| 'damaged' \| 'torn' \| 'lost' \| 'other' |
| quantity | number | Nombre d'exemplaires affectés |
| loanId | string (FK, optional) | Référence vers Loans si lié à un prêt |
| borrowerName | string (optional) | Nom du dernier emprunteur |
| borrowerContact | string (optional) | Contact de l'emprunteur |
| reportDate | Date | Date du signalement |
| status | enum | 'open' \| 'resolved' \| 'written_off' |
| resolution | string (optional) | Description de la résolution |
| resolvedAt | Date (optional) | Date de résolution |
| notes | string (optional) | Notes détaillées |
| createdAt | Date | Date de création |

Notes:
- Ce module permet de justifier les écarts entre le stock système et le stock physique
- Utile lors des audits du bureau national
- Types: non retourné, endommagé, déchiré, perdu, autre
- Statuts: ouvert (en cours), résolu (réglé), radié (perte acceptée)

---

## Audit Log Module (Journal d'Audit)

| Column | Type | Description |
|--------|------|-------------|
| id | string | Identifiant unique (timestamp-random) |
| timestamp | string (ISO 8601) | Date et heure de l'action |
| action | enum | Type d'action (login, create, update, delete, etc.) |
| module | enum | Module concerné (auth, books, loans, participants, etc.) |
| details | string | Description de l'action |
| userId | string | Identifiant de l'utilisateur (admin par défaut) |
| previousHash | string | Hash SHA-256 de l'entrée précédente |
| hash | string | Hash SHA-256 de cette entrée |

Actions disponibles:
- login, login_failed, logout
- create, update, delete
- export, import, backup, restore
- config_change, pin_change
- loan_create, loan_return, loan_renew
- issue_report, issue_resolve
- inventory_start, inventory_complete

Modules disponibles:
- auth, books, loans, participants, classes, categories
- materials, reading_sessions, book_issues, inventory
- config, other_readers, extra_activities, system

Notes:
- Utilise une chaîne de hachage SHA-256 pour garantir l'intégrité
- Chaque entrée contient le hash de l'entrée précédente
- La première entrée a un previousHash de 64 zéros
- L'intégrité peut être vérifiée en recalculant les hashes
- Toute modification est détectable (mais pas empêchable côté client)
- L'export inclut un checksum global et les métadonnées de vérification
