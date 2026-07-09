const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const memoryLogBtn = document.getElementById('memoryLogBtn');
const clearMemoryBtn = document.getElementById('clearMemoryBtn');
const closeMemoryBtn = document.getElementById('closeMemoryBtn');
const memoryModal = document.getElementById('memoryModal');
const memoryLogOutput = document.getElementById('memoryLogOutput');

const chat = GeminiApi.createGeminiChat();

chatForm.addEventListener('submit', event => {
  event.preventDefault();
  sendMessage();
});

clearBtn.addEventListener('click', () => {
  chat.history.length = 0;
  chatBox.innerHTML = '<div class="message bot">Chat cleared. What would you like to talk about?</div>';
  chatInput.focus();
});

memoryLogBtn.addEventListener('click', openMemoryLog);
clearMemoryBtn.addEventListener('click', clearMemory);
closeMemoryBtn.addEventListener('click', closeMemoryLog);
memoryModal.addEventListener('click', event => {
  if (event.target === memoryModal) closeMemoryLog();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !memoryModal.hidden) closeMemoryLog();
});

function appendMessage(role, text) {
  const message = document.createElement('div');
  message.className = `message ${role}`;
  message.textContent = text;
  chatBox.appendChild(message);
  chatBox.scrollTop = chatBox.scrollHeight;
  return message;
}

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  chatInput.value = '';
  appendMessage('user', message);

  const memoryText = GeminiApi.extractMemoryCommand(message);
  if (memoryText) {
    GeminiApi.addMemory(memoryText);
    appendMessage('bot', `Saved to local memory: ${memoryText}`);
    chatInput.focus();
    return;
  }

  const typing = appendMessage('bot', 'Thinking...');
  sendBtn.disabled = true;

  try {
    const reply = await chat.sendMessage(message);
    typing.textContent = reply;
  } catch (error) {
    typing.className = 'message error';
    typing.textContent = error.message || 'Something went wrong. Please try again.';
  }

  sendBtn.disabled = false;
  chatInput.focus();
}

function openMemoryLog() {
  const log = GeminiApi.formatMemoryLog();
  memoryLogOutput.textContent = log || 'No local memories saved yet.';
  memoryModal.hidden = false;
  closeMemoryBtn.focus();
}

function closeMemoryLog() {
  memoryModal.hidden = true;
  memoryLogBtn.focus();
}

function clearMemory() {
  GeminiApi.clearMemories();
  if (!memoryModal.hidden) {
    memoryLogOutput.textContent = 'No local memories saved yet.';
  }
  appendMessage('bot', 'Local memory cleared. I will start fresh from here.');
  chatInput.focus();
}
