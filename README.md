# Team Task Manager

A full-stack, role-based project and task management application built with React, Node.js, Express, and MongoDB.

## 🚀 Live Demo

> Deploy to Railway or Vercel and update this URL.

## 🧪 Test Credentials (after running seed script)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@test.com | Admin@1234 |
| Member | alice@test.com | Member@1234 |
| Member | bob@test.com | Member@1234 |

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Tailwind CSS, React Router v6, Axios, React Hook Form + Zod
- **Backend:** Node.js, Express.js, express-async-errors
- **Database:** MongoDB via Mongoose ODM
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Validation:** Zod (backend), React Hook Form + Zod (frontend)

## ✨ Key Features

- 🔐 JWT-based authentication with role-based access control (Admin/Member)
- 📋 Full project and task management (CRUD)
- 👥 Project membership management (Admin adds/removes members)
- 📊 Role-specific dashboards with stats, overdue tasks, progress bars
- ✅ Members can update status of their own assigned tasks
- 🎨 Precision Productivity design system (Indigo/Violet palette, Inter font)
- 🔔 Toast notifications for all actions
- 📱 Responsive layout (mobile-first)

## 📁 Folder Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth + error handler
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   ├── utils/          # Helpers (JWT, response, DB connect)
│   │   └── validations/    # Zod schemas
│   ├── scripts/seed.js     # DB seeder
│   ├── app.js              # Express app
│   └── server.js           # Entry point
└── frontend/
    └── src/
        ├── api/            # Axios API functions
        ├── components/     # Shared UI (layout, common)
        ├── context/        # AuthContext
        ├── hooks/          # useAuth
        └── pages/          # All page components
```

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

**backend/.env**
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/task-manager?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_min_32_chars
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**frontend/.env**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

### 4. Run

```bash
# Terminal 1 (backend)
cd backend
npm run dev

# Terminal 2 (frontend)
cd frontend
npm run dev
```

Open **http://localhost:5173**

## 🌐 API Endpoints

| Method | Route | Auth | Role | Description |
|--------|-------|------|------|-------------|
| POST | /api/auth/register | No | — | Register a new user |
| POST | /api/auth/login | No | — | Login, returns JWT |
| GET | /api/auth/me | Yes | Any | Get current user |
| GET | /api/users | Yes | admin | List all users |
| PATCH | /api/users/:id/role | Yes | admin | Change user role |
| GET | /api/projects | Yes | admin | All projects |
| GET | /api/projects/mine | Yes | member | My projects |
| POST | /api/projects | Yes | admin | Create project |
| GET | /api/projects/:id | Yes | Any | Project detail |
| PUT | /api/projects/:id | Yes | admin | Update project |
| DELETE | /api/projects/:id | Yes | admin | Delete project + all tasks |
| POST | /api/projects/:id/members | Yes | admin | Add member |
| DELETE | /api/projects/:id/members/:userId | Yes | admin | Remove member |
| POST | /api/projects/:id/tasks | Yes | admin | Create task in project |
| GET | /api/projects/:id/tasks | Yes | Any | Tasks in project |
| GET | /api/tasks/mine | Yes | Any | My assigned tasks |
| GET | /api/tasks/:id | Yes | Any | Task detail |
| PUT | /api/tasks/:id | Yes | admin | Update all task fields |
| PATCH | /api/tasks/:id/status | Yes | Any | Update status (assignee only for members) |
| DELETE | /api/tasks/:id | Yes | admin | Delete task |
| GET | /api/dashboard | Yes | Any | Role-specific dashboard data |
| GET | /api/health | No | — | Health check |

## 🔒 Role-Based Access Control

| Feature | Admin | Member |
|---------|-------|--------|
| View all projects | ✅ | ❌ (own only) |
| Create/edit/delete project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/edit/delete task | ✅ | ❌ |
| Update task status | ✅ | ✅ (assigned tasks only) |
| Admin dashboard | ✅ | ❌ |
| User management | ✅ | ❌ |

## 📋 Assumptions Documented

1. Members can only see projects where they are in the `members` array
2. Members can only see tasks assigned to them within a project
3. Members can update status of any task assigned to them
4. Admins can view and modify all tasks and projects
5. Deleting a project cascades to delete all its tasks
6. Duplicate email on register returns 409; wrong password returns 401 with same message as "not found" (security best practice)
7. The `/api/tasks/mine` route is defined before `/:id` to avoid route conflict in Express

## 🚀 Deployment

### Railway (Backend)
1. Connect GitHub repo to Railway
2. Set all env vars from backend/.env in Railway dashboard
3. Set root directory to `backend`
4. Deploy

### Vercel (Frontend)
1. Connect GitHub repo to Vercel
2. Set `VITE_API_BASE_URL` to your Railway backend URL
3. Set root directory to `frontend`
4. Deploy

## 🔮 Future Enhancements

1. **Real-time collaboration** — WebSocket notifications when tasks are updated
2. **File attachments** — Upload files to tasks via Cloudinary/S3
3. **Task comments** — Threaded discussion per task
4. **Time tracking** — Log hours worked per task
5. **Gantt chart view** — Visual project timeline
6. **Email notifications** — Notify members when assigned to tasks
7. **Activity audit log** — Full history of changes per project
8. **Kanban board** — Drag-and-drop task management
