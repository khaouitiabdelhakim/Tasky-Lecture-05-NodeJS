const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3001;

// MySQL connection pool
const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'tasky-spring'
});

app.use(cors());
app.use(bodyParser.json());

// Fetch tasks from the database
app.get('/api/tasks', (req, res) => {
    pool.query('SELECT * FROM task', (error, results, fields) => {
        if (error) {
            console.error('Error fetching tasks:', error);
            res.status(500).send('Internal Server Error');
        } else {
            res.json(results);
        }
    });
});

// Add a new task to the database
app.post('/api/tasks', (req, res) => {
    const { text } = req.body;
    pool.query('INSERT INTO task (text, completed) VALUES (?, ?)', [text, false], (error, results, fields) => {
        if (error) {
            console.error('Error adding task:', error);
            res.status(500).send('Internal Server Error');
        } else {
            res.json({ id: results.insertId, text, completed: false });
        }
    });
});

// Update a task in the database
app.put('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { text, completed } = req.body;
    pool.query('UPDATE task SET text = ?, completed = ? WHERE id = ?', [text, completed, id], (error, results, fields) => {
        if (error) {
            console.error('Error updating task:', error);
            res.status(500).send('Internal Server Error');
        } else if (results.affectedRows === 0) {
            res.status(404).send('Task not found');
        } else {
            res.json({ id, text, completed });
        }
    });
});

// Delete a task from the database
app.delete('/api/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    pool.query('DELETE FROM task WHERE id = ?', [id], (error, results, fields) => {
        if (error) {
            console.error('Error deleting task:', error);
            res.status(500).send('Internal Server Error');
        } else if (results.affectedRows === 0) {
            res.status(404).send('Task not found');
        } else {
            res.status(204).send();
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
