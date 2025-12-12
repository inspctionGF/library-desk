# BiblioSystem Backend

Node.js/Express backend with SQLite database for BiblioSystem library management.

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

   Server starts at `http://localhost:3001`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production server |
| `npm run migrate` | Run database migrations |

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with PIN
- `POST /api/auth/guest-pin` - Generate guest PIN (admin)
- `GET /api/auth/guest-pins` - List guest PINs (admin)
- `DELETE /api/auth/guest-pins/:id` - Delete guest PIN (admin)

### Books
- `GET /api/books` - List books (with filters)
- `GET /api/books/:id` - Get book details
- `POST /api/books` - Create book
- `PUT /api/books/:id` - Update book
- `DELETE /api/books/:id` - Delete book

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Loans
- `GET /api/loans` - List loans
- `POST /api/loans` - Create loan
- `POST /api/loans/:id/return` - Return book
- `POST /api/loans/:id/renew` - Renew loan

### Participants
- `GET /api/participants` - List participants
- `GET /api/participants/:id` - Get participant
- `GET /api/participants/:id/journal` - Get participant history
- `POST /api/participants` - Create participant
- `PUT /api/participants/:id` - Update participant
- `DELETE /api/participants/:id` - Delete participant

### Classes
- `GET /api/classes` - List classes
- `GET /api/classes/:id/participants` - Get class participants
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Configuration
- `GET /api/config` - Get system config
- `PUT /api/config` - Update config
- `POST /api/config/verify-pin` - Verify admin PIN
- `POST /api/config/change-pin` - Change admin PIN

## Project Structure

```
backend/
├── src/
│   ├── database/
│   │   ├── connection.ts      # SQLite connection
│   │   └── migrations/        # SQL migrations
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── validation.middleware.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── books.routes.ts
│   │   ├── categories.routes.ts
│   │   ├── classes.routes.ts
│   │   ├── config.routes.ts
│   │   ├── loans.routes.ts
│   │   ├── participants.routes.ts
│   │   └── tasks.routes.ts
│   ├── types/
│   │   └── index.ts
│   └── index.ts               # Express entry point
├── data/                      # SQLite database location
├── package.json
├── tsconfig.json
└── .env
```

## Database

SQLite database is created automatically at `data/bibliosystem.db`.

Migrations run automatically on server start.

## Authentication

Use `X-Admin-PIN` header for admin requests:
```
X-Admin-PIN: 123456
```

Guest access uses `X-Guest-PIN` header.

## Connecting Frontend

Update Vite config to proxy API requests:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
});
```

Or set `VITE_API_URL` environment variable.
