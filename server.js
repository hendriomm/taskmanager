const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 3000;
const SECRET_KEY = "AAAAAA";

// Middleware to parse JSON
app.use(bodyParser.json());

// Routes
app.get('/', (req, res) => {
    res.send('Task Manager API is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

let tasks = [];

// Get all tasks
app.get('/tasks', (req, res) => {
    res.json(tasks);
});

// Add a new task
app.post('/tasks', (req, res) => {
    const { title, completed } = req.body;
    const newTask = { id: tasks.length + 1, title, completed: completed || false };
    tasks.push(newTask);
    res.status(201).json(newTask);
});

// Update a task
app.put('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { title, completed } = req.body;
    const task = tasks.find(task => task.id === parseInt(id));
    if (!task) 
        return res.status(404).json({ error: 'Task not found'});

    task.title = title !== undefined ? title : task.title;
    task.completed = completed !== undefined ? completed : task.completed;

    res.json(task);
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const index = tasks.findIndex(task => task.id === parseInt(id));
    if (index === -1)
        return res.status(404).json({ error: 'Task not found' });

    tasks.splice(index, 1);
    res.status(204).send();
});


// Authentication & Users

let users = [];

//Register User
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    users.push({ username, password: hashedPassword });
    res.status(201).json({ message: "User registered successfully" });
});

// Login User
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = users.find((u) => u.username === username);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}

// Protect task routes
app.get("/tasks", authenticateToken, (req, res) => {
    res.json(tasks);
});
