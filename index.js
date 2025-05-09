const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const jsonParser = bodyParser.json();

// Conexión y creación de la tabla
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Conectado a la base de datos SQLite.');

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Tabla "todos" creada o ya existente.');
        }
    });
});

// Endpoint para insertar tareas
app.post('/agrega_todo', jsonParser, (req, res) => {
    const { todo } = req.body;

    if (!todo) {
        return res.status(400).json({ error: 'Falta el campo "todo"' });
    }

    const created_at = Math.floor(Date.now() / 1000);
    const sql = 'INSERT INTO todos (todo, created_at) VALUES (?, ?)';
    const params = [todo, created_at];

    db.run(sql, params, function (err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Error al insertar' });
        }

        res.status(201).json({
            message: 'Tarea agregada correctamente',
            id: this.lastID
        });
    });
});

// Endpoint para listar tareas
app.get('/listar_todos', (req, res) => {
    db.all('SELECT * FROM todos', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: 'Error al obtener las tareas' });
        }

        res.status(200).json(rows);
    });
});

// Ruta raíz
app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ status: 'ok' }));
});

// Iniciar servidor (corregido para Render)
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`);
});
