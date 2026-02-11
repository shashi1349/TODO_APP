# 📝 Task Manager Application

A full-stack Task Manager (Todo) application with user authentication and persistent storage. Users can securely create, update, delete, and track the completion progress of their tasks.

---

## 🚀 Features

- 🔐 User Authentication (Register / Login / Logout)
- 🧾 Create, Read, Update, Delete (CRUD) tasks
- ✅ Mark tasks as completed
- 📊 Dynamic task completion progress bar
- 💾 Persistent storage using SQLite
- 🔑 JWT-based authorization
- 🎨 Clean and responsive UI

---

## 🛠️ Tech Stack

**Frontend**
- HTML
- CSS
- JavaScript
- Bootstrap / Tailwind CSS

**Backend**
- Node.js
- Express.js
- SQLite
- JSON Web Token (JWT)
- bcrypt

---

## 📂 Project Structure
TODO_APP/
├── frontend/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── backend/
│   ├── server.js
│   └── todos.db
└── README.md

---

## 🔐 Authentication Flow

1. User registers with a username and password
2. Password is hashed using bcrypt
3. On login, a JWT token is generated
4. Token is stored on the client
5. Protected routes require a valid token

---

## 📊 Progress Calculation

Progress is calculated dynamically on the frontend:
The progress bar updates automatically when:
- A task is completed or unchecked
- A task is deleted
- Tasks are loaded after login

---

## ⚙️ API Endpoints

### Authentication
- `POST /register` → Register a new user
- `POST /login` → Login and receive JWT token

### Todos (Protected)
- `GET /todos` → Fetch all tasks for logged-in user
- `POST /todos` → Create a new task
- `PUT /todos/:id` → Update task completion status
- `DELETE /todos/:id` → Delete a task

---

## ▶️ Run Locally

### 
1️⃣ Clone the repository
```bash
git clone https://github.com/shashi1349/TODO_APP.git
cd todo_app

2️⃣ Install backend dependencies
cd backend
npm install

3️⃣ Start the server
node server.js
Server will run at:
    http://localhost:3000

4️⃣ Open frontend
Open frontend/index.html in a browser.

## 🚀 Deployment

- Frontend hosted on Netlify
- Backend hosted on Render

## 🌍 Live Demo

- Frontend: https://todo-optimize.netlify.app/
- Backend API: https://todo-app-hnw7.onrender.com