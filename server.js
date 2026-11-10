const express = require("express");
const path = require("path");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.log("Database connection failed:", err.message);
    } else {
        console.log("Connected to MySQL database");
    }
});

app.get("/api/tasks", (req, res) => {
    db.query("SELECT * FROM tasks ORDER BY id DESC", (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

app.post("/api/tasks", (req, res) => {
    const { title, status } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Task title is required" });
    }

    const sql = "INSERT INTO tasks (title, status) VALUES (?, ?)";

    db.query(sql, [title, status || "Pending"], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            id: result.insertId,
            title,
            status: status || "Pending"
        });
    });
});

app.delete("/api/tasks/:id", (req, res) => {
    db.query(
        "DELETE FROM tasks WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            res.json({ message: "Task deleted successfully" });
        }
    );
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});