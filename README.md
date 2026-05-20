# Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express (Vercel Serverless)
- **Database:** MongoDB Atlas
- **Auth:** JWT + bcrypt

## Project Structure

```
team-task-manager/
├── backend/
│   ├── api/            Vercel serverless entry point
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── vercel.json
│   ├── .env.example
│   └── server.js       (local dev only)
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   ├── vercel.json
│   ├── .env.example
│   └── index.html
└── README.md
```

---

## Local Development

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

```bash
# Backend
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI and JWT_SECRET
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

Seed dummy data:
```bash
cd backend
node seed/seed.js
# admin@example.com / password123
# member@example.com / password123
```

---

## Deploying to Vercel

You'll deploy **backend** and **frontend** as two separate Vercel projects.

### Step 1 — Set up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free cluster
2. Create a database user (username + password)
3. Whitelist all IPs: `0.0.0.0/0` (required for Vercel serverless)
4. Copy your connection string — it looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/team-task-manager
   ```

### Step 2 — Deploy the Backend

1. Push your code to GitHub (if not already)
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your repo, set **Root Directory** to `backend`
4. Add these **Environment Variables** in Vercel:

   | Key | Value |
   |-----|-------|
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | any long random string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `FRONTEND_URL` | *(leave blank for now, add after frontend deploy)* |

5. Click **Deploy**
6. Copy the deployed URL, e.g. `https://team-task-manager-backend.vercel.app`

### Step 3 — Deploy the Frontend

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import the same repo, set **Root Directory** to `frontend`
3. Add this **Environment Variable**:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend.vercel.app/api` |

4. Click **Deploy**
5. Copy the frontend URL, e.g. `https://team-task-manager-frontend.vercel.app`

### Step 4 — Link them together

1. Go back to your **backend** project on Vercel
2. Settings → Environment Variables → add/update:
   ```
   FRONTEND_URL = https://team-task-manager-frontend.vercel.app
   ```
3. Redeploy the backend (Deployments → Redeploy)

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/projects | Get all projects for user |
| POST | /api/projects | Create project (Admin) |
| GET | /api/projects/:id | Get single project |
| PUT | /api/projects/:id | Update project (Admin) |
| DELETE | /api/projects/:id | Delete project (Admin) |
| POST | /api/projects/:id/members | Add member (Admin) |
| DELETE | /api/projects/:id/members/:userId | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all tasks for user |
| POST | /api/tasks | Create task (Admin) |
| GET | /api/tasks/:id | Get single task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task (Admin) |
| GET | /api/tasks/project/:projectId | Get tasks by project |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Get dashboard stats |

---

## MongoDB Schema Relations

- **User** – standalone, referenced by Project and Task
- **Project** – has `createdBy` (User ref) and `members` (array of User refs)
- **Task** – belongs to a `project` (Project ref), has `assignedTo` (User ref)

Relation flow: `User → Project → Task`
