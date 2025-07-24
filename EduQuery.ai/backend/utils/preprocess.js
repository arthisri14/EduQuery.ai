// preprocess.js

const pdfParse = require('pdf-parse');
const { cleanText, chunkText } = require('./pdfprocessor'); // use the smarter chunker
const { getEmbedding, cosineSimilarity } = require('./cosine');

/**
 * Preprocess document (can be text or PDF buffer)
 * @param {string|Buffer} input - raw text or PDF buffer
 * @param {string|null} question
 * @returns {Promise<string[]|string>} Array of chunks or best-matching chunk
 */
async function preprocessDocument(input, question = null) {
  let rawText;

  if (Buffer.isBuffer(input)) {
    // Handle PDF buffer input
    const parsed = await pdfParse(input);
    rawText = parsed.text;
    console.log("[PDF TEXT CONTENT]", rawText?.slice(0, 300));
  } else if (typeof input === 'string') {
    // Handle plain text input
    rawText = input;
    console.log("[Text File CONTENT]", rawText?.slice(0, 300));
  } else {
    throw new Error('Invalid input to preprocessDocument: expected string or Buffer');
  }

  // Clean and chunk
  const cleaned = cleanText(rawText);
  const chunks = chunkText(cleaned, 300, 50); // uses overlap-aware chunking

  console.log(`[Preprocessing] Chunks created: ${chunks.length}`);

  if (!question) {
    return chunks; // ✅ Return chunks for storing in DB
  }

  // Use embeddings to find most relevant chunk for the question
  const questionEmbedding = await getEmbedding(question);
  let bestChunk = '';
  let highestScore = -1;

  for (const chunk of chunks) {
    const chunkEmbedding = await getEmbedding(chunk);
    const score = cosineSimilarity(questionEmbedding, chunkEmbedding);
    if (score > highestScore) {
      highestScore = score;
      bestChunk = chunk;
    }
  }

  return bestChunk;
}

module.exports = { preprocessDocument };
