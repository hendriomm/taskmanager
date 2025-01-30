const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

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