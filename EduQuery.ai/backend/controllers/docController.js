const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { preprocessDocument } = require('../utils/preprocess');
const { getEmbedding, cosineSimilarity } = require('../utils/cosine');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate embedding using Gemini's embedding model
async function getEmbeddingFromGemini(text) {
  try {
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    const result = await model.embedContent({
      content: { parts: [{ text }] },
      taskType: "retrieval_document"
    });
    return result?.embedding?.values || null;
  } catch (err) {
    console.error('[Gemini Embed Error]', err.message);
    return null;
  }
}

// Upload and process document
exports.uploadDocument = async (req, res) => {
  try {
    const file = req.file;
    console.log('[Debug] req.file:', file);
    console.log('[Debug] req.body:', req.body);

    if (!file) return res.status(400).json({ error: 'No file uploaded.' });

    const filePath = file.path;
    console.log('[Upload] File received:', file.originalname);

    let textContent = '';
    let chunks = [];

    try {
      const buffer = fs.readFileSync(filePath);
      chunks = await preprocessDocument(buffer); // ✅ single point of truth
      textContent = chunks.join('\n\n'); // store full content in DB
    } catch (err) {
      console.error('[Preprocessing Error]', err.message);
      return res.status(500).json({ error: 'Failed to read or preprocess document.' });
    }

    // Store cleaned content in DB
    let docId;
    try {
      const [docResult] = await db.execute(
        'INSERT INTO documents (name, content) VALUES (?, ?)',
        [file.originalname, textContent]
      );
      docId = docResult.insertId;
      console.log('[Upload] Document inserted with ID:', docId);
    } catch (dbErr) {
      console.error('[DB Insert Error]', dbErr.message);
      return res.status(500).json({ error: 'Failed to store document in database.' });
    }

    console.log('[Upload] Chunks created:', chunks.length);

    // Embed each chunk
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (!trimmed || trimmed.length < 10) continue;

      const embedding = await getEmbeddingFromGemini(trimmed);
      if (!embedding) {
        console.warn('[Embedding Skipped] Failed on chunk:', trimmed.slice(0, 30));
        continue;
      }

      try {
        await db.execute(
          'INSERT INTO embeddings (document_id, chunk, embedding) VALUES (?, ?, ?)',
          [docId, trimmed, JSON.stringify(embedding)]
        );
      } catch (embErr) {
        console.error('[Embedding DB Insert Error]', embErr.message);
      }
    }

    res.status(201).json({ message: 'Document uploaded and embedded.', docId });

  } catch (err) {
    console.error('[Upload Error]', err);
    res.status(500).json({ error: 'Upload failed.' });
  }
};

// Query documents using question and Gemini
exports.queryDocuments = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) return res.status(400).json({ error: 'No question provided.' });

    const queryEmbedding = await getEmbeddingFromGemini(question);
    if (!queryEmbedding) return res.status(500).json({ error: 'Failed to embed question.' });

    const [rows] = await db.execute(
      'SELECT chunk, embedding FROM embeddings WHERE embedding IS NOT NULL'
    );
    if (!rows.length) return res.status(404).json({ error: 'No embeddings found.' });

    const scoredChunks = rows.map(row => {
      try {
        const emb = JSON.parse(row.embedding);
        const score = cosineSimilarity(queryEmbedding, emb);
        return { chunk: row.chunk, score };
      } catch {
        return null;
      }
    }).filter(Boolean);

    const topChunks = scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const context = topChunks.map(c => c.chunk).join('\n---\n');

    //const prompt = `You are an expert assistant. Use the context below to answer the question.\n\nContext:\n${context}\n\nQuestion: ${question}`;
    const prompt = `You are an expert assistant specialized in generating structured, organized HTML content. Based on the context provided below, answer the user's question clearly and format your response as well-structured HTML code with proper headings, paragraphs, and bullet points where appropriate.

Context:
${context}

Question:
${question}

Instructions:
- Format the response as HTML.
- Use semantic HTML elements like <h1>, <p>, <ul>, <li>, etc.
- Ensure the content is easy to read and visually organized.
- Do not include any explanation outside of the HTML structure.
- Output only the HTML code.`;
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }]
    });

    const answer = await result.response.text();
    res.status(200).json({ answer });

  } catch (err) {
    console.error('[Query Error]', err.message);
    res.status(500).json({ error: 'Query failed.' });
  }
};

// Update document name
exports.updateDocumentName = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'New name required.' });

    const [result] = await db.execute(
      'UPDATE documents SET name = ? WHERE id = ?',
      [name, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    res.json({ message: 'Document name updated.' });

  } catch (err) {
    console.error('[Update Error]', err.message);
    res.status(500).json({ error: 'Update failed.' });
  }
};

// Get all uploaded documents
exports.getAllDocuments = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM documents');
    res.json({ documents: rows });
  } catch (err) {
    console.error('[Fetch Error]', err.message);
    res.status(500).json({ error: 'Failed to fetch documents.' });
  }
};
