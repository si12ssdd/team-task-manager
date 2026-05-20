# TaskFlow — Team Task Manager

A full-stack project I built for managing team tasks and projects. The idea was simple — admins create projects, add people, assign tasks. Members log in and see what's assigned to them and update progress.

Tech: React + Vite, Node/Express, MongoDB Atlas, JWT auth, Tailwind CSS.

---

## Features

- JWT-based login and registration
- Two roles: **Admin** (full control) and **Member** (view + update status only)
- Create projects, add/remove team members
- Tasks with priority, due date, and assignee
- Kanban board per project (Todo → In Progress → Done)
- Dashboard with task counts and recent activity
- Overdue task highlighting

---

## Local Setup

You need Node 18+ and either a local MongoDB or an Atlas URI.

**1. Backend**

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:

```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=anything_random_here
JWT_EXPIRES_IN=7d
```

```bash
npm run dev
# runs on http://localhost:5000
```

**2. Frontend**

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_URL=http://localhost:5000/api` in the `.env`, then:

```bash
npm run dev
# runs on http://localhost:5173
```

**3. Seed test data (optional but useful)**

```bash
cd backend
node seed/seed.js
```

Creates these accounts:
- `admin@example.com` / `password123`
- `member@example.com` / `password123`

---

## Deploying on Vercel

This is deployed as two separate Vercel projects — backend (serverless) and frontend (static).

### Backend first

1. Go to [vercel.com](https://vercel.com) → New Project → import this repo
2. Set **Root Directory** to `backend`
3. Add these environment variables:

```
MONGO_URI        = your Atlas connection string
JWT_SECRET       = some random secret
JWT_EXPIRES_IN   = 7d
FRONTEND_URL     = (leave blank for now, add after frontend is deployed)
```

4. Deploy. Copy the URL it gives you — something like `https://taskflow-backend.vercel.app`

### Frontend

1. New Project again → same repo
2. Set **Root Directory** to `frontend`
3. Add this env variable:

```
VITE_API_URL = https://your-backend-url.vercel.app/api
```

Make sure to add `/api` at the end — that's the base path for all API routes.

4. Deploy. Copy the frontend URL.

### Last step

Go back to the **backend** Vercel project → Settings → Environment Variables → add:

```
FRONTEND_URL = https://your-frontend-url.vercel.app
```

Then redeploy the backend. This is needed for CORS to work properly.

---

## MongoDB Atlas note

If you're using Atlas (required for Vercel), make sure you go to **Network Access** and add `0.0.0.0/0` to allow connections from anywhere. Vercel uses dynamic IPs so you can't whitelist a specific one.

---

## API Routes

**Auth**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` — requires token

**Projects** — all require token, write operations are admin only
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/members`
- `DELETE /api/projects/:id/members/:userId`

**Tasks** — all require token, members can only update status
- `GET /api/tasks`
- `POST /api/tasks` — admin only
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id` — admin only
- `GET /api/tasks/project/:projectId`

**Dashboard**
- `GET /api/dashboard`

---

## Project Structure

```
backend/
├── api/index.js        Vercel serverless entry point
├── controllers/
├── middleware/         JWT auth + role check
├── models/             User, Project, Task
├── routes/
└── seed/

frontend/src/
├── api/                axios setup
├── components/         Sidebar, Modal, badges, Layout
├── context/            AuthContext (login/logout/session)
├── pages/              Login, Register, Dashboard, Projects, Tasks
└── utils/              date formatting helpers
```
