# Smart Job Tracker

A full-stack job discovery and application tracker with an Express/MongoDB backend and a React/Vite frontend.

## Live application

Visit the deployed application:

**[Smart Job Tracker](https://smart-job-tracker.vercel.app/)**

The production frontend is hosted on Vercel and uses the deployed Express API on Render.

## Features

- JWT registration and login with Job Seeker and Company roles
- Protected, user-scoped job tracking
- Create, edit, delete, search, and filter applications
- Job statuses: pending, applied, interview, offer, and rejected
- Live job discovery with optional Adzuna integration
- Safe fallback listings when external provider credentials are unavailable
- External job-posting links
- Separate discovered-job application records
- Duplicate application protection
- Application status history and timeline
- Resume text storage for each user
- Resume-to-job match scores and best-match sorting
- Built-in job and support assistant
- Optional Gemini integration for broader career guidance
- Responsive React interface

## Project structure

- `backend/` - Express API, MongoDB models, authentication, and job CRUD operations.
- `frontend/` - React application powered by Vite.
- `backend/models/Application.js` - Discovered-job application records and status timelines.
- `backend/services/jobDiscovery.js` - Adzuna integration and fallback discovery listings.
- `backend/services/jobMatching.js` - Resume-to-job match scoring.
- `frontend/src/pages/Discover.jsx` - Job discovery, resume matching, and application tracking UI.

## Getting started

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The local backend uses port `5001` in this project because port `5000` is occupied
by macOS system services. The frontend defaults to:

```text
http://localhost:5001/api
```

Set `VITE_API_URL` in `frontend/.env` to override it.

## Environment variables

### Backend

Copy `backend/.env.example` to `backend/.env` and configure:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
PORT=5001
```

Optional integrations:

```env
ADZUNA_APP_ID=your_adzuna_app_id
ADZUNA_APP_KEY=your_adzuna_app_key
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

Without Adzuna credentials, the discovery page uses clearly labeled fallback
listings. Without Gemini credentials, the built-in assistant continues to work.

### Frontend

Create `frontend/.env` when using a non-default API:

```env
VITE_API_URL=https://smart-job-tracker-api-d4ph.onrender.com/api
```

## API routes

```text
GET    /api/health
POST   /api/auth/register
POST   /api/auth/login
GET    /api/jobs
POST   /api/jobs
PATCH  /api/jobs/:id
DELETE /api/jobs/:id
GET    /api/discovery/jobs
GET    /api/applications
POST   /api/applications
PATCH  /api/applications/:id
DELETE /api/applications/:id
GET    /api/resume
PUT    /api/resume
DELETE /api/resume
POST   /api/chat
```

## Validation

Build the frontend:

```bash
cd frontend
npm run build
```

Validate backend syntax from the project root:

```bash
for file in backend/**/*.js backend/*.js; do node --check "$file" || exit 1; done
```

## Deployment

- Frontend: Vercel
- Backend: Render
- Database: MongoDB

Never commit `.env` files or API keys. Only the `.env.example` templates belong
in source control.
