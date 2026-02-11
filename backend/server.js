const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = "MY_SECRET_KEY";

const db = new sqlite3.Database("todos.db");

//database setup

db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
)`);

db.run(`
CREATE TABLE IF NOT EXISTS todo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task TEXT,
  is_completed INTEGER DEFAULT 0,
  user_id INTEGER
)`);

//authentication middleware

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, SECRET_KEY, (err, payload) => {
    if (err) return res.sendStatus(403);
    req.userId = payload.userId;
    next();
  });
}

//auth routes(i.e.,, register and login routes)

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
   `INSERT INTO users (username, password) VALUES ('${username}', '${hashedPassword}')`,
    err => {
      if (err) return res.status(400).send("User already exists");
      res.send("Registered successfully");
    }
  );
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (!user) return res.status(400).send("Invalid credentials");

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(400).send("Invalid credentials");

      const token = jwt.sign({ userId: user.id }, SECRET_KEY, {
        expiresIn: "1h"
      });

      res.json({ token });
    }
  );
});

//todo routes/updating

app.get("/todos", authenticateToken, (req, res) => {
  db.all(
    "SELECT * FROM todo WHERE user_id = ?",
    [req.userId],
    (err, rows) => res.json(rows)
  );
});

app.post("/todos", authenticateToken, (req, res) => {
  const { task } = req.body;
  db.run(
    "INSERT INTO todo (task, user_id) VALUES (?, ?)",
    [task, req.userId],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

app.put("/todos/:id", authenticateToken, (req, res) => {
  db.run(
    "UPDATE todo SET is_completed = ? WHERE id = ? AND user_id = ?",
    [req.body.is_completed, req.params.id, req.userId],
    () => res.send("Updated")
  );
});

app.delete("/todos/:id", authenticateToken, (req, res) => {
  db.run(
    `DELETE FROM todo WHERE id = ${req.params.id} AND user_id = ${req.userId}`,
    () => res.send("Deleted")
  );
});


//server

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});