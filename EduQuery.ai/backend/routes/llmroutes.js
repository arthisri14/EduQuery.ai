const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const modelEmbedding = genAI.getGenerativeModel({ model: 'embedding-001' });
const modelGenerate = genAI.getGenerativeModel({ model: 'gemini-pro' });

router.post('/embedding', async (req, res) => {
  try {
    const { text } = req.body;
    const result = await modelEmbedding.embedContent({
      content: { parts: [{ text }] },
    });
    res.json({ embedding: result.embedding.values });
  } catch (err) {
    console.error('Embedding error:', err.message);
    res.status(500).json({ error: 'Embedding failed' });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    const result = await modelGenerate.generateContent(prompt);
    const response = await result.response;
    res.json({ answer: response.text() });
  } catch (err) {
    console.error('Generation error:', err.message);
    res.status(500).json({ error: 'Generation failed' });
  }
});

module.exports = router;
