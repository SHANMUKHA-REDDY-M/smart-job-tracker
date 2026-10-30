# Smart Job Tracker

A full-stack job application tracker with an Express/MongoDB backend and a React/Vite frontend.

## Project structure

- `backend/` - Express API, MongoDB models, authentication, and job CRUD operations.
- `frontend/` - React application powered by Vite.

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

The frontend expects the API at `http://localhost:5000/api` by default. Set
`VITE_API_URL` in `frontend/.env` to override it.

