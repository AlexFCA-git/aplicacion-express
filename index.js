// Importamos las librarías requeridas
const express = require('express')
const bodyParser = require('body-parser')
const sqlite3 = require('sqlite3').verbose()

const app = express()
const jsonParser = bodyParser.json()

// Abre la base de datos de SQLite
let db = new sqlite3.Database('./base.sqlite3', (err) => {
    if (err) {
        console.error(err.message)
    } else {
        console.log('Conectado a la base de datos SQLite.')
    }

    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        todo TEXT NOT NULL,
        created_at INTEGER
    )`, (err) => {
        if (err) {
            console.error(err.message)
        } else {
            console.log('Tabla tareas creada o ya existente.')
        }
    })
})

// Endpoint raíz
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ status: 'ok2' }))
})

// Endpoint POST para insertar una nueva tarea
app.post('/insert', jsonParser, function (req, res) {
    const { todo } = req.body
    console.log(todo)

    if (!todo) {
        res.status(400).json({ error: 'Falta información necesaria' })
        return
    }

    const stmt = db.prepare('INSERT INTO todos (todo, created_at) VALUES (?, strftime("%s", "now"))')

    stmt.run(todo, function (err) {
        if (err) {
            console.error("Error al insertar:", err)
            res.status(500).json({ error: 'Error al guardar en la base de datos' })
            return
        }

        console.log("Insert fue exitoso")
        res.status(201).json({ id: this.lastID, todo })
    })

    stmt.finalize()
})

// Endpoint GET para listar todas las tareas
app.get('/listar_todos', (req, res) => {
    db.all('SELECT * FROM todos', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message })
            return
        }

        res.setHeader('Content-Type', 'application/json')
        res.status(200).json(rows)
    })
})

// Endpoint extra de ejemplo
app.post('/login', jsonParser, function (req, res) {
    console.log(req.body)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ status: 'ok' }))
})

// Ejecutar servidor
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`)
})
