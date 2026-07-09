const chatBox = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');

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
