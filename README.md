# StudyKarle

StudyKarle is a full-stack academic resource platform for engineering
students. It organizes notes, previous year papers, and other study
material by year, semester, and subject, and gives students a clean
dashboard to browse, search, preview, and save resources — with a
separate admin panel for managing content and users.

## Features

- Email/password signup and login with secure, HTTP-only session cookies
- Browse resources by Year → Semester → Subject → Notes
- In-browser PDF preview and download
- Full-text search across notes and subjects
- Save notes for later / bookmarking
- User profile management (details, password change)
- Admin dashboard: upload/manage notes, manage subjects, manage users,
  view platform analytics and activity log
- Responsive layout (desktop sidebar navigation, mobile bottom nav)

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router
- Tailwind CSS
- Axios

**Backend**
- Node.js + Express
- PostgreSQL with Knex.js (query builder + migrations)
- JWT-based authentication (HTTP-only cookies)
- Google Drive API for file storage
- express-validator for input validation
- express-rate-limit for rate limiting
- Helmet, CORS, Morgan

## Project Structure

```
studykarle/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # Axios API modules
│   │   ├── components/     # Shared, layout, and feature components
│   │   ├── context/        # Auth and Toast contexts
│   │   ├── hooks/          # Custom hooks (useAuth, useFetch, useDebounce)
│   │   ├── pages/          # Route-level pages (public, app, admin)
│   │   └── utils/          # Formatters and constants
│   └── package.json
│
└── server/                 # Express backend
    ├── src/
    │   ├── config/         # Env, DB, constants
    │   ├── controllers/    # Route handlers
    │   ├── db/
    │   │   ├── migrations/ # Knex migrations
    │   │   └── seeds/      # Knex seeds
    │   ├── middleware/     # Auth, validation, rate limiting, error handling
    │   ├── models/         # Knex query modules
    │   ├── routes/         # Express routers
    │   ├── services/       # Business logic (auth, notes, Drive uploads)
    │   ├── utils/          # ApiResponse, ApiError, logger
    │   ├── validators/     # express-validator schemas
    │   └── app.js
    ├── knexfile.js
    └── server.js
```

## Prerequisites

- Node.js 18+
- PostgreSQL
- A Google Cloud project with Drive API enabled and a service account /
  OAuth credentials (for note file storage)

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd studykarle

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Configure environment variables

**server/.env**
```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=studykarle
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=replace-with-a-strong-random-secret
COOKIE_NAME=studykarle_token

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=your-redirect-uri
GOOGLE_REFRESH_TOKEN=your-refresh-token
GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id
```

**client/.env**
```
VITE_API_URL=http://localhost:5000/api
```

> Adjust variable names to match whatever your `config/env.js` actually
> reads — the list above reflects what the codebase expects.

### 3. Set up the database

```bash
cd server
npm run migrate
npm run seed
```

### 4. Run the app

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## Available Scripts

**Backend (`server/`)**
| Script | Description |
|---|---|
| `npm run dev` | Start the API with nodemon |
| `npm start` | Start the API in production mode |
| `npm run migrate` | Run pending Knex migrations |
| `npm run migrate:rollback` | Roll back the last migration batch |
| `npm run seed` | Run database seeds |

**Frontend (`client/`)**
| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview the production build locally |

## Roles

- **Student** — browse, search, preview, download, and save notes;
  manage their own profile.
- **Admin** — everything a student can do, plus upload/edit/delete notes
  and subjects, manage user roles, and view analytics/activity/view-history.

## License

Add your license here (e.g. MIT).
