  // index.js
  const express = require('express');
  const cors = require('cors');
  const dotenv = require('dotenv');
  const path = require('path');
  const bodyParser = require('body-parser');

  dotenv.config();

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  // Routes
  const docRoutes = require('./backend/routes/docroutes');
  const llmRoutes = require('./backend/routes/llmroutes');

  app.use('/api/docs', docRoutes);
  app.use('/api/llm', llmRoutes);

  // Serve static frontend
  const frontendPath = path.join(__dirname, 'frontend');
  app.use(express.static(frontendPath));

  // Routes for upload.html and chat.html
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

  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
