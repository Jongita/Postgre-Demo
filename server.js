const express = require('express');
const { Pool } = require('pg');  // Import pg module
const app = express();
app.use(express.json());

// Set up the PostgreSQL pool connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'movies-db',
    password: 'your_password',
    port: 5432,
});

// Helper function to validate date
const isValidDate = (date) => new Date(date) <= new Date();

// Get all actors
app.get('/actors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM actors');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get actor by ID
app.get('/actors/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM actors WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ text: 'Actor not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new actor
app.post('/actors', async (req, res) => {
    const { firstName, lastName, dateOfBirth } = req.body;
    if (!isValidDate(dateOfBirth))
        return res.status(400).json({ text: 'Date of birth cannot be in the future' });

    try {
        const result = await pool.query(
            'INSERT INTO actors (first_name, last_name, date_of_birth) VALUES ($1, $2, $3) RETURNING *',
            [firstName, lastName, dateOfBirth]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update actor by ID
app.put('/actors/:id', async (req, res) => {
    const { firstName, lastName, dateOfBirth } = req.body;
    if (!isValidDate(dateOfBirth))
        return res.status(400).json({ text: 'Invalid date' });

    try {
        const result = await pool.query(
            'UPDATE actors SET first_name = $1, last_name = $2, date_of_birth = $3 WHERE id = $4 RETURNING *',
            [firstName, lastName, dateOfBirth, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ text: 'Actor not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete actor by ID
app.delete('/actors/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM actors WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ text: 'Actor not found' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new movie
app.post('/movies', async (req, res) => {
    const { title, creationDate, actorId } = req.body;
    try {
        const actorResult = await pool.query('SELECT * FROM actors WHERE id = $1', [actorId]);
        if (actorResult.rows.length === 0) {
            return res.status(400).json({ text: 'Invalid actor' });
        }

        const result = await pool.query(
            'INSERT INTO movies (title, creation_date, actor_id) VALUES ($1, $2, $3) RETURNING *',
            [title, creationDate, actorId]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all movies
app.get('/movies', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM movies');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get movie by ID
app.get('/movies/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ text: 'Movie not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update movie by ID
app.put('/movies/:id', async (req, res) => {
    const { title, creationDate, actorId } = req.body;

    try {
        if (actorId) {
            const actorResult = await pool.query('SELECT * FROM actors WHERE id = $1', [actorId]);
            if (actorResult.rows.length === 0) {
                return res.status(400).json({ text: 'Invalid actor' });
            }
        }

        const result = await pool.query(
            'UPDATE movies SET title = $1, creation_date = $2, actor_id = $3 WHERE id = $4 RETURNING *',
            [title, creationDate, actorId, req.params.id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ text: 'Movie not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete movie by ID
app.delete('/movies/:id', async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM movies WHERE id = $1 RETURNING *', [req.params.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ text: 'Movie not found' });
        }
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(2999, 'localhost', () => {
    console.log('Server running on localhost:2999');
});