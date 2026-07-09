const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadMemoryBtn = document.getElementById('downloadMemoryBtn');

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

downloadMemoryBtn.addEventListener('click', downloadMemoryLog);

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

function downloadMemoryLog() {
  const log = GeminiApi.formatMemoryLog();
  const content = log || '# No local memories saved yet.';
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'memory.log';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
