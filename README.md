# TaskFlow — Team Task Manager

A full-stack task management app I built for managing projects and tasks across a team. Supports two roles — Admin and Member — with different levels of access.

Built with React, Node/Express, MongoDB Atlas, and JWT auth.

---

## What it does

- Admins can create projects, add team members, and manage tasks
- Members can view their assigned tasks and update status
- Dashboard shows a quick overview of task counts and recent activity
- Kanban-style board on the project detail page (Todo / In Progress / Done)
- Tasks have priority levels, due dates, and assignees

---

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas (Mongoose)
- **Auth:** JWT + bcrypt

---

## Running locally

You'll need Node 18+ and a MongoDB connection (local or Atlas).

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# fill in MONGO_URI and JWT_SECRET
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# set VITE_API_URL=http://localhost:5000/api
npm run dev
```

**Seed some dummy data:**
```bash
cd backend
node seed/seed.js
```

This creates two users:
- `admin@example.com` / `password123` (Admin)
- `member@example.com` / `password123` (Member)

---

## Deploying to Vercel

The project is split into two separate Vercel deployments — one for the backend (serverless), one for the frontend.

### Backend

1. Import the repo on Vercel, set root directory to `backend`
2. Add env vars: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN=7d`, `FRONTEND_URL`
3. Deploy

### Frontend

1. Import the same repo, set root directory to `frontend`
2. Add env var: `VITE_API_URL=https://your-backend.vercel.app/api`
3. Deploy

After both are live, go back to the backend project and set `FRONTEND_URL` to the frontend URL, then redeploy.

---

## API overview

| Method | Route | Auth | Notes |
|--------|-------|------|-------|
| POST | /api/auth/register | — | |
| POST | /api/auth/login | — | |
| GET | /api/auth/me | ✓ | |
| GET | /api/projects | ✓ | |
| POST | /api/projects | Admin | |
| GET | /api/projects/:id | ✓ | |
| PUT | /api/projects/:id | Admin | |
| DELETE | /api/projects/:id | Admin | |
| POST | /api/projects/:id/members | Admin | |
| DELETE | /api/projects/:id/members/:userId | Admin | |
| GET | /api/tasks | ✓ | |
| POST | /api/tasks | Admin | |
| PUT | /api/tasks/:id | ✓ | members can only update status |
| DELETE | /api/tasks/:id | Admin | |
| GET | /api/tasks/project/:projectId | ✓ | |
| GET | /api/dashboard | ✓ | |

---

## Folder structure

```
backend/
  api/          vercel serverless entry
  controllers/
  middleware/   auth + role check
  models/       User, Project, Task
  routes/
  seed/

frontend/
  src/
    api/        axios instance
    components/ Layout, Sidebar, Modal, badges, etc.
    context/    AuthContext
    pages/      Login, Register, Dashboard, Projects, Tasks
    utils/      date helpers
```
