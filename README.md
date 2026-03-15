# ProjectBoard

You can try the project here: https://project-board-woad.vercel.app (might have to wait about a minute for the server to start)

A full-hstack project management app built wit **React**, **TypeScript**, **Node.js** and **PostgreSQL**. Organise work across multiple projects using a drag-and-drop Kanban board, collaborate with teammates in real time, and track progress through an analytics dashboard.

## Features
- **User Authentication**: Register, log in, and stay logged in with JWT session persistence.
- **Projects**: Create and manage projects, set a colour label, and invite collaborators by email.
- **Kanban Board**: Drag and drop tasks across To Do, In Progress, and Done columns.
- **Task Management**: Tasks support title, description, priority, due date, and assignee.
- **Real-time Collaboration**: Board changes are broadcast instantly to all connected members via WebSockets.
- **Analytics Dashboard**: Per-project stats — total, completed, in-progress, and overdue task counts, a completion-over-time chart, and a recent activity feed.
- **Search & Filter**: Filter tasks by priority and search by title within a project.
- **Role-Based Access**: Only project owners can add/remove members or delete the project.
- **Responsive Design**: Adapts to various screen sizes.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, TailwindCSS, Redux Toolkit, @dnd-kit, Recharts
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL, Socket.io
- **Testing**: Vitest + Testing Library (frontend), Jest + Supertest (backend)
- **Deployment**: Vercel (frontend), Render (backend + PostgreSQL)
- **Version Control**: Git, GitHub

## Screenshots
![Screenshot1](./screenshots/screenshot1.png)

![Screenshot2](./screenshots/screenshot2.png)

![Screenshot3](./screenshots/screenshot3.png)

![Screenshot4](./screenshots/screenshot4.png)

![Screenshot5](./screenshots/screenshot5.png)

## Setup and Installation

### Prerequisites
- **Node.js** 20+
- **npm** 10+
- **PostgreSQL** 14+

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/project-board.git
cd project-board
```

### 2. Install Dependencies
```bash
# Server dependencies
cd server
npm install

# Client dependencies
cd ../client
npm install
```

### 3. Set up Environment Variables

Create a `.env` file in `server/`:
```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/project_board"
JWT_SECRET="your-secret-key"
CLIENT_URL="http://localhost:5173"
PORT=3000
```

Create a `.env` file in `client/`:
```bash
VITE_API_URL=http://localhost:3000
```

### 4. Run Database Migrations
```bash
cd server
npx prisma migrate deploy
```

### 5. Run the Server
```bash
# From server/
npm run dev
```

### 6. Run the Client
```bash
# From client/
npm run dev
```

### 7. Seed Demo Data (optional)
Populates the database with two projects, realistic tasks spread across the past 14 days.
```bash
# From server/
cd server
npx ts-node src/db/seed.ts
```

Demo accounts (password: `password123`):
```
alice@example.com  — owns Website Redesign project
bob@example.com    — owns Mobile App MVP project
carol@example.com  — member on both projects
```
