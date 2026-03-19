const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const serverless = require('serverless-http');

console.log('API function initialized');

const app = express();

app.use(cors());
app.use(express.json());

let todos = [
    { id: '1', text: 'Netlify-da ishlash', completed: false },
    { id: '2', text: 'API ulanishini tekshirish', completed: false }
];

const router = express.Router();

router.get('/todos', (req, res) => {
    console.log('GET /todos reached');
    res.status(200).json(todos);
});

router.post('/todos', (req, res) => {
    console.log('POST /todos reached', req.body);
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ message: 'Text kiritilishi shart!' });
    }

    const newTodo = {
        id: Math.random().toString(36).substr(2, 9),
        text,
        completed: false
    };

    todos.push(newTodo);
    res.status(201).json(newTodo);
});

router.put('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { text, completed } = req.body;
    const index = todos.findIndex(t => t.id === id);
    if (index === -1) return res.status(404).json({ message: 'Todo topilmadi!' });
    todos[index] = { ...todos[index], text, completed };
    res.status(200).json(todos[index]);
});

router.patch('/todos/:id', (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const todo = todos.find(t => t.id === id);
    if (!todo) return res.status(404).json({ message: 'Todo topilmadi!' });
    if (completed !== undefined) todo.completed = completed;
    res.status(200).json(todo);
});

router.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
    todos = todos.filter(t => t.id !== id);
    res.status(204).send();
});

// Diagnostic endpoint
router.get('/ping', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Flexible routing for Netlify
app.use('/.netlify/functions/api', router);
app.use('/api', router);
app.use('/', router); // Default

module.exports.handler = serverless(app);
