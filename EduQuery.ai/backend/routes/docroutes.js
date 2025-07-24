  const express = require('express');
  const router = express.Router();
  const multer = require('multer');
  const path = require('path');
  const docController = require('../controllers/docController');

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = ['.txt', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedTypes.includes(ext)) {
      return cb(new Error('Only .txt or .pdf files are allowed!'), false);
    }
    cb(null, true);
  };

  const upload = multer({ storage, fileFilter });

  router.post('/upload', upload.single('file'), docController.uploadDocument);
  router.post('/query', docController.queryDocuments);
  router.put('/:id', docController.updateDocumentName);
  router.get('/', docController.getAllDocuments);

  module.exports = router;
