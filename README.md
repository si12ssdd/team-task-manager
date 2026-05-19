# Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt

## Project Structure

```
team-task-manager/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── .env.example
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── utils/
│   ├── .env.example
│   └── index.html
└── README.md
```

## Roles

- **Admin** – Can create/delete projects, manage members, create/update/delete tasks
- **Member** – Can view assigned projects/tasks, update task status only

## Setup Instructions

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone the repo

```bash
git clone <repo-url>
cd team-task-manager
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your MongoDB URI and JWT secret in .env
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Make sure VITE_API_URL matches your backend port
npm run dev
```

### 4. Seed Dummy Data (optional)

```bash
cd backend
node seed/seed.js
```

This creates:
- Admin user: `admin@example.com` / `password123`
- Member user: `member@example.com` / `password123`
- 2 sample projects with tasks

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

## MongoDB Schema Relations

- **User** – standalone, referenced by Project and Task
- **Project** – has `createdBy` (User ref) and `members` (array of User refs)
- **Task** – belongs to a `project` (Project ref), has `assignedTo` (User ref)

Relation flow: `User → Project → Task`, where tasks link back to both a project and a user.
