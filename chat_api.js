// --- YOUR GOOGLE GEMINI API KEY ---
const API_KEY = '__CHATBOT_API__';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
const API_KEY_PLACEHOLDERS = new Set(['', 'CHATBOT_API', ['__', 'CHATBOT_API', '__'].join('')]);
const MEMORY_STORAGE_KEY = 'gemini-chat-memory-log';

// --- Build Gemini Prompt ---
function buildPrompt(userInput, memories = []) {
  // --- Custom Prompt Start ---
  // Replace this block when a future project needs its own reusable prompt.
  const memoryBlock = formatMemoryPrompt(memories);

  return `You are a friendly, practical chatbot. Keep replies clear, concise, and helpful.
${memoryBlock}
User: ${userInput}`;
  // --- Custom Prompt End ---
}

// --- Local Memory Helpers ---
function getStoredMemories() {
  if (typeof localStorage === 'undefined') return [];

  try {
    const stored = JSON.parse(localStorage.getItem(MEMORY_STORAGE_KEY) || '[]');
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.warn('Could not read local memory:', error);
    return [];
  }
}

function setStoredMemories(memories) {
  if (typeof localStorage === 'undefined') return memories;

  localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(memories));
  return memories;
}

function addMemory(text) {
  const cleanText = String(text || '').trim();
  if (!cleanText) return null;

  const memory = {
    text: cleanText,
    createdAt: new Date().toISOString()
  };

  setStoredMemories([...getStoredMemories(), memory]);
  return memory;
}

function clearMemories() {
  return setStoredMemories([]);
}

function formatMemoryPrompt(memories = getStoredMemories()) {
  const lines = memories
    .map(memory => typeof memory === 'string' ? memory : memory?.text)
    .filter(Boolean);

  if (!lines.length) return '';

  return `

Remember these saved user facts and preferences when they are relevant:
${lines.map(line => `- ${line}`).join('\n')}`;
}

function formatMemoryLog(memories = getStoredMemories()) {
  const lines = memories
    .map(memory => {
      const text = typeof memory === 'string' ? memory : memory?.text;
      const createdAt = typeof memory === 'string' ? null : memory?.createdAt;
      return text ? `[${createdAt || 'unknown'}] ${text}` : '';
    })
    .filter(Boolean);

  return lines.join('\n');
}

function extractMemoryCommand(message) {
  const text = String(message || '').trim();
  const patterns = [
    /^(?:please\s+)?(?:commit|save|add)\s+(?:this\s+)?(?:to|in)\s+memory[:\s-]*(.+)$/i,
    /^(?:please\s+)?remember(?:\s+that)?[:\s-]*(.+)$/i,
    /^(?:please\s+)?memorize(?:\s+that)?[:\s-]*(.+)$/i,
    /^memory[:\s-]+(.+)$/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) return match[1].trim();
  }

  const inlineMatch = text.match(/\b(?:commit|save|add)\s+(?:this\s+)?(?:to|in)\s+memory\b[:\s-]*(.*)$/i);
  return inlineMatch?.[1]?.trim() || '';
}

// --- Parse Gemini JSON Response ---
function parseGeminiJson(data) {
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  const clean = raw.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// --- Parse Gemini Text Response ---
function parseGeminiText(data) {
  return data?.candidates?.[0]?.content?.parts
    ?.map(part => part.text || '')
    .join('')
    .trim() || '';
}

// --- Main Gemini Function ---
async function askGemini(prompt, options = {}) {
  if (API_KEY_PLACEHOLDERS.has(API_KEY)) {
    throw new Error('Gemini API key is not configured. Replace the API key placeholder before using chat_api.js.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: buildPrompt(prompt, options.memories || getStoredMemories()) }]
        }
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {})
      }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('API error:', data);
    throw new Error(data?.error?.message || 'API request failed');
  }

  return data;
}

// --- Main Gemini Text Function ---
async function askGeminiText(prompt, options = {}) {
  const data = await askGemini(prompt, options);
  return parseGeminiText(data);
}

// --- Main Gemini JSON Function ---
async function askGeminiJson(prompt, options = {}) {
  const data = await askGemini(prompt, {
    ...options,
    responseMimeType: 'application/json'
  });

  return parseGeminiJson(data);
}

// --- Main Gemini Chat Function ---
function createGeminiChat(options = {}) {
  const history = [...(options.history || [])];
  const getMemories = options.getMemories || getStoredMemories;

  return {
    history,
    async sendMessage(message) {
      history.push({
        role: 'user',
        parts: [{ text: buildPrompt(message, getMemories()) }]
      });

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: history,
          generationConfig: {
            temperature: options.temperature ?? 0.2
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API error:', data);
        throw new Error(data?.error?.message || 'API request failed');
      }

      const reply = parseGeminiText(data);

      history.push({
        role: 'model',
        parts: [{ text: reply }]
      });

      return reply;
    }
  };
}

// --- Export for Browser, Node, or n8n ---
const GeminiApi = {
  API_KEY,
  API_URL,
  API_KEY_PLACEHOLDERS,
  MEMORY_STORAGE_KEY,
  addMemory,
  buildPrompt,
  clearMemories,
  extractMemoryCommand,
  formatMemoryLog,
  formatMemoryPrompt,
  getStoredMemories,
  askGemini,
  askGeminiText,
  askGeminiJson,
  createGeminiChat,
  parseGeminiJson,
  parseGeminiText
};

if (typeof window !== 'undefined') {
  window.GeminiApi = GeminiApi;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeminiApi;
}
