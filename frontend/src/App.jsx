import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const API_URL = '/api/todos';

const TodoList = () => {
    const [todos, setTodos] = useState([]);
    const [text, setText] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [status, setStatus] = useState(null);

    // Barcha todo'larni olish
    const fetchTodos = async () => {
        try {
            const res = await axios.get(API_URL);
            setTodos(res.data);
        } catch (err) {
            console.error('Error fetching todos:', err);
            setStatus(`Error: ${err.message}`);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    // Status xabarini ko'rsatish
    const showStatus = (code) => {
        setStatus(code);
        setTimeout(() => setStatus(null), 3000);
    };

    // Todo qo'shish yoki tahrirlash
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        if (editingId) {
            // PUT - yangilash
            try {
                const res = await axios.put(`${API_URL}/${editingId}`, { text, completed: false });
                setTodos(todos.map(t => t.id === editingId ? res.data : t));
                setEditingId(null);
                setText('');
                showStatus(200);
            } catch (err) {
                console.error(err);
                alert('Update error: ' + err.message);
            }
        } else {
            // POST - qo'shish
            try {
                const res = await axios.post(API_URL, { text });
                setTodos([...todos, res.data]);
                setText('');
                showStatus(201); // 201 status kodini ko'rsatish
            } catch (err) {
                console.error(err);
                alert('Add error: ' + err.message);
            }
        }
    };

    // O'chirish (DELETE)
    const deleteTodo = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setTodos(todos.filter(t => t.id !== id));
            showStatus(204);
        } catch (err) {
            console.error(err);
        }
    };

    // Toggle completion (PATCH)
    const toggleTodo = async (id, completed) => {
        try {
            const res = await axios.patch(`${API_URL}/${id}`, { completed: !completed });
            setTodos(todos.map(t => t.id === id ? res.data : t));
        } catch (err) {
            console.error(err);
        }
    };

    // Edit holatiga o'tish
    const startEdit = (todo) => {
        setEditingId(todo.id);
        setText(todo.text);
    };

    return (
        <div className="container">
            <h1>To-Do List</h1>
            {status && (
                <div className="status-badge">
                    Status: {status} {status === 201 ? '(Created)' : ''}
                </div>
            )}

            <form onSubmit={handleSubmit} className="input-group">
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Vazifa kiriting..."
                />
                <button type="submit" className="btn btn-add">
                    {editingId ? 'Saqlash' : 'Qo\'shish'}
                </button>
            </form>

            <ul>
                {todos.map(todo => (
                    <li key={todo.id}>
                        <span
                            className={`todo-text ${todo.completed ? 'completed' : ''}`}
                            onClick={() => toggleTodo(todo.id, todo.completed)}
                        >
                            {todo.text}
                        </span>
                        <div className="actions">
                            <button onClick={() => startEdit(todo)} className="btn btn-edit">Edit</button>
                            <button onClick={() => deleteTodo(todo.id)} className="btn btn-delete">Delete</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<TodoList />} />
                {/* Boshqa route'lar ham qo'shish mumkin */}
            </Routes>
        </Router>
    );
};

export default App;
