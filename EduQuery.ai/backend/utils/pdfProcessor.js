// pdfprocessor.js

const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Cleans raw text from a PDF file.
 * @param {string} text
 * @returns {string}
 */
function cleanText(text) {
  return text
    .replace(/\/[A-Za-z]+(?:\s*\([^)]+\))?/g, '') // Remove metadata
    .replace(/(?:FontName|CIDFontType|Producer|Creator|CreationDate):?.*/gi, '')
    .replace(/https?:\/\/[^\s]+/g, '')           // Remove URLs
    .replace(/[^\x20-\x7E]/g, '')                // Remove non-printable ASCII
    .replace(/\s{2,}/g, ' ')                     // Collapse multiple spaces
    .trim();
}

/**
 * Chunk cleaned text into overlapping sections.
 * @param {string} text
 * @param {number} chunkSize
 * @param {number} overlap
 * @returns {string[]}
 */
function chunkText(text, chunkSize = 300, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ').trim();
    if (
      chunk.length < 10 ||
      !/[a-zA-Z]{4,}/.test(chunk) ||
      /\/Font|\/CID|\/Type|\/Author|\/Producer/i.test(chunk)
    ) continue;
    chunks.push(chunk);
  }

  return chunks;
}

/**
 * Full PDF processing pipeline.
 * @param {string} filePath
 * @returns {Promise<string[]>} Array of cleaned and chunked text
 */
async function processPDF(filePath) {
  const buffer = fs.readFileSync(filePath);
  const pdf = await pdfParse(buffer);
  const cleanedText = cleanText(pdf.text);
  return chunkText(cleanedText);
}

module.exports = {
  cleanText,
  chunkText,
  processPDF,
};
