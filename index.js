const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware'lar
app.use(cors()); // Frontend bilan bog'lanish uchun
app.use(express.json());

let todos = [
    { id: uuidv4(), text: 'Node.js ni o\'rganish', completed: false },
    { id: uuidv4(), text: 'React loyihasini boshlash', completed: false }
];

app.get('/todos', (req, res) => {
    res.status(200).json(todos);
});

app.post('/todos', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'Text kiritilishi shart!' });
    }

    const newTodo = {
        id: uuidv4(),
        text,
        completed: false
    };

    todos.push(newTodo);
    res.status(201).json(newTodo); // Yangi ma'lumot qo'shilganda 201 status qaytariladi
});

app.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;

    const index = todos.findIndex(t => t.id === id);
    if (index === -1) {
        return res.status(404).json({ message: 'Todo topilmadi!' });
    }

    todos[index] = { ...todos[index], text, completed };
    res.status(200).json(todos[index]);
});

app.patch('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;

    const todo = todos.find(t => t.id === id);
    if (!todo) {
        return res.status(404).json({ message: 'Todo topilmadi!' });
    }

    if (completed !== undefined) todo.completed = completed;
    res.status(200).json(todo);
});

app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    const initialLength = todos.length;
    todos = todos.filter(t => t.id !== id);

    if (todos.length === initialLength) {
        return res.status(404).json({ message: 'Todo topilmadi!' });
    }

    res.status(204).send(); // O'chirilganda content yo'qligini bildirish (yoki 200)
});

const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please try a different port or kill the process.`);
    } else {
        console.error('Server error:', err);
    }
});