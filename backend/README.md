# Task Management Backend Service 🚀

This is the backend service for the **Task Management App**. It is built using **Next.js (App Router)**, **Prisma ORM**, and **PostgreSQL**.

---

## 🛠️ Technology Stack
* **Framework:** Next.js 14 (TypeScript)
* **ORM:** Prisma Client
* **Database:** PostgreSQL
* **Security:** `bcryptjs` (password hashing) & `jsonwebtoken` (JWT token auth)
* **Validation:** `zod` (runtime schema validation)
* **Styling:** Tailwind CSS (for the API documentation page)

---

## 📁 Folder Structure

```text
backend/
├── prisma/
│   └── schema.prisma        # Database schema (User, Task, Subtask)
├── src/
│   ├── app/
│   │   ├── api/             # API Endpoints
│   │   │   ├── auth/
│   │   │   │   ├── register/route.ts
│   │   │   │   └── login/route.ts
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/route.ts
│   │   │   ├── dashboard/
│   │   │   │   └── route.ts
│   │   │   └── swagger/
│   │   │       └── route.ts # OpenAPI 3.0 Specification Route
│   │   ├── docs/
│   │   │   └── page.tsx     # Swagger UI Client page
│   │   ├── globals.css      # Tailwind base styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Interactive API Doc Dashboard
│   ├── lib/
│   │   ├── auth.ts          # Auth, JWT, and password hashing utility
│   │   └── prisma.ts        # Prisma client singleton instance
│   └── middleware.ts        # Global CORS configuration middleware
├── .env                     # Database connection & JWT secrets
├── next.config.mjs          # Next.js configurations
├── package.json             # Dev scripts and dependencies
├── tailwind.config.js       # CSS theme configurations
└── tsconfig.json            # TypeScript configuration
```

---

## ⚡ Quick Start Guide

### 1. Prerequisites
Make sure you have **Node.js** (v18 or higher) and a **PostgreSQL** instance running.

### 2. Install Dependencies
Navigate to the backend directory and run:
```bash
cd backend
npm install
```

### 3. Configure Environment Variables
Open the `.env` file in the `backend/` directory and configure your PostgreSQL database connection string and JWT secret:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/task_db?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### 4. Push Database Schema to PostgreSQL
Run the following Prisma command to push the models defined in `schema.prisma` directly to your PostgreSQL database:
```bash
npx prisma db push
```
*(This will automatically create the `users`, `tasks`, and `subtasks` tables with all relationships in your PostgreSQL instance and generate the Prisma Client).*

### 5. Launch the Server
Start the development server:
```bash
npm run dev
```
The server will boot up at **`http://localhost:5000`**. 

* Open **`http://localhost:5000`** in your browser to access the custom **Interactive API Control Console**.
* Open **`http://localhost:5000/docs`** to access the standard **Interactive Swagger UI Playground**, which allows you to test requests live.

---

## 🔌 API Documentation Summary

All API endpoints reside under `/api/*` and expect/return JSON.

### 📋 System & Docs Endpoints

| Endpoint | Method | Description | Response Type |
| :--- | :--- | :--- | :--- |
| `/docs` | `GET` | Interactive Swagger UI Playground | HTML |
| `/api/swagger` | `GET` | OpenAPI 3.0 JSON specification | JSON |

### 🔐 Authentication Endpoints

| Endpoint | Method | Description | Request Body |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Register a new user | `{ email, password, name }` |
| `/api/auth/login` | `POST` | Login & receive JWT token | `{ email, password }` |

### 📝 Tasks Endpoints (Requires `Authorization: Bearer <token>`)

| Endpoint | Method | Description | Request Body / Query Params |
| :--- | :--- | :--- | :--- |
| `/api/tasks` | `GET` | Retrieve user tasks | Params: `status`, `priority`, `search` |
| `/api/tasks` | `POST` | Create a new task with optional subtasks | `{ title, description, status, priority, dueDate, subtasks: [...] }` |
| `/api/tasks/[id]` | `GET` | Get details of a single task | None |
| `/api/tasks/[id]` | `PUT` | Update a task (syncs subtasks) | `{ title, status, priority, subtasks: [...] }` |
| `/api/tasks/[id]` | `DELETE` | Delete task & its subtasks | None |

### 📊 Dashboard Analytics (Requires `Authorization: Bearer <token>`)

| Endpoint | Method | Description | Response Details |
| :--- | :--- | :--- | :--- |
| `/api/dashboard` | `GET` | Get total tasks, completion percentage, distributions, and 7-day activity data | `{ summary, statusDistribution, priorityDistribution, subtaskAnalytics, activityOverTime }` |

---

## 📱 Connecting your React Native / Expo App

To connect the React Native frontend to this backend:

1. **Set Base URL:** Set your API base url. If testing on:
   * **Android Emulator:** Use `http://10.0.2.2:5000/api`
   * **iOS Simulator:** Use `http://localhost:5000/api`
   * **Physical Device:** Use your computer's local IP address (e.g., `http://192.168.1.50:5000/api`)

2. **Save Token:** Upon successful login or registration, store the returned JWT token securely using AsyncStorage:
   ```javascript
   import AsyncStorage from '@react-native-async-storage/async-storage';
   await AsyncStorage.setItem('authToken', token);
   ```

3. **Authenticate Requests:** For task or analytics endpoints, send the token in the `Authorization` header:
   ```javascript
   const fetchDashboard = async () => {
     const token = await AsyncStorage.getItem('authToken');
     const response = await fetch('http://localhost:5000/api/dashboard', {
       headers: {
         'Authorization': `Bearer ${token}`
       }
     });
     return await response.json();
   };
   ```
