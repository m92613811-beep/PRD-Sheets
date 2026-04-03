const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Database file
const DB_FILE = path.join(__dirname, 'db.json');

// Load data from db.json
function loadData() {
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { files: [] };
    }
}

// Save data to db.json
function saveData(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Load initial data
let db = loadData();

// Default files if none in db
const defaultFiles = [
    { id: 1, name: "PRD Marketing Plan", owner: "You", date: "Apr 2, 2026" },
    { id: 2, name: "Sales Data Q1", owner: "You", date: "Apr 1, 2026" },
    { id: 3, name: "Client Reports", owner: "Team", date: "Mar 30, 2026" },
    { id: 4, name: "Product Roadmap", owner: "You", date: "Mar 28, 2026" },
    { id: 5, name: "Project Alpha Budget", owner: "Admin", date: "Mar 25, 2026" }
];

let files = db.files && db.files.length > 0 ? db.files : defaultFiles;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Enable CORS
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route to render main page
app.get('/', (req, res) => {
    res.render('index', { files: files });
});

// Routes for different pages
app.get('/task', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'task.html'));
});

app.get('/budget', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'budget.html'));
});

app.get('/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
});

app.get('/reports', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reports.html'));
});

// API Route to get all files
app.get('/api/files', (req, res) => {
    res.json(files);
});

// API Route to add a new file
app.post('/api/files', (req, res) => {
    const { name, owner } = req.body;
    if (!name || !owner) {
        return res.status(400).json({ error: 'Name and owner are required' });
    }

    const newFile = {
        id: files.length + 1,
        name,
        owner,
        date: new Date().toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    };

    files.push(newFile);
    db.files = files;
    saveData(db);

    res.status(201).json(newFile);
});

// API Route to delete a file
app.delete('/api/files/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = files.findIndex(f => f.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'File not found' });
    }

    files.splice(index, 1);
    db.files = files;
    saveData(db);

    res.status(204).send();
});

// API Route to search files
app.get('/api/files/search', (req, res) => {
    const query = req.query.q.toLowerCase();
    const filtered = files.filter(f =>
        f.name.toLowerCase().includes(query)
    );
    res.json(filtered);
});

// ✅ FIXED PORT (only declared once)
const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});
