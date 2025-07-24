// index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const docController = require('./backend/controllers/docController');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Routes
const docRoutes = require('./backend/routes/docroutes');
const llmRoutes = require('./backend/routes/llmroutes');

app.use('/api/docs', docRoutes);
app.use('/api/llm', llmRoutes);

// Serve static frontend
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath));

// Routes for HTML pages
app.get('/upload', (req, res) => {
  res.sendFile(path.join(frontendPath, 'upload.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(frontendPath, 'chat.html'));
});

// Default route
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'upload.html'));
});

app.post('/upload', upload.single('file'), docController.uploadDocument);

// Start the server
app.listen(PORT, () => {
  console.log(` Server running at http://localhost:${PORT}`);
});
