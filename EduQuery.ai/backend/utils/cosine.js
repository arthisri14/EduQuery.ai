// cosine.js

const axios = require('axios');

/**
 * Sends text to embedding server and receives embedding vector.
 * @param {string} text
 * @returns {Promise<number[]>} Embedding vector
 */
async function getEmbedding(text) {
  const response = await axios.post('http://localhost:5000/embedding', { text });
  return response.data.embedding;
}

/**
 * Computes cosine similarity between two vectors.
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dot / (magA * magB);
}

/**
 * Sends prompt to LLM server to generate a response.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function askLLM(prompt) {
  const response = await axios.post('http://localhost:5000/generate', { prompt });
  return response.data.answer;
}

module.exports = { getEmbedding, cosineSimilarity, askLLM };
