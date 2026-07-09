# Basic Gemini Chat

A small static web chatbot powered by Google's Gemini API. It runs as plain HTML, CSS, and JavaScript, so you can use it locally or deploy it with GitHub Pages.

## Features

- Gemini 2.5 Flash chat from a static web page
- Local browser memory using `localStorage`
- Memory commands like `remember that my name is Chad`
- Memory Log modal for viewing saved memories
- Downloadable `memory.log` export
- Clear Memory option for starting fresh
- GitHub Pages workflow with secret injection

## Prerequisites

- A Google Gemini API key from Google AI Studio
- Your own GitHub repository
- GitHub Pages enabled for the repository
- A GitHub Actions secret named `CHATBOT_API`
- Git installed locally if you want to edit and push changes

## Important Security Note

This is a static browser app. After deployment, the Gemini API key is injected into `chat_api.js`, which means it can be viewed by anyone who opens the deployed site.

For personal projects, restrict your Gemini API key in Google Cloud or Google AI Studio as much as possible. For private or production use, the safer pattern is to call Gemini through a backend server instead of exposing the key in browser JavaScript.

## Local Setup

1. Clone your repository:

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO
```

2. For quick local testing, replace the placeholder in `chat_api.js`:

```js
const API_KEY = 'YOUR_GEMINI_API_KEY';
```

3. Open `index.html` in your browser.

For normal repository use, keep this placeholder committed:

```js
const API_KEY = '__CHATBOT_API__';
```

The GitHub Pages workflow replaces it during deployment.

## GitHub Pages Deployment

1. Push this project to your own GitHub repository.

2. In GitHub, open your repository settings.

3. Go to `Settings > Secrets and variables > Actions`.

4. Create a new repository secret:

```text
Name: CHATBOT_API
Value: your Gemini API key
```

5. Go to `Settings > Pages`.

6. Set the source to GitHub Actions.

7. Push to the `main` branch.

The workflow at `.github/workflows/deploy-pages.yml` will:

- Check out the repo
- Configure GitHub Pages
- Replace `__CHATBOT_API__` in `chat_api.js` with `${{ secrets.CHATBOT_API }}`
- Upload the site artifact
- Deploy to GitHub Pages

## Memory Usage

Memory is stored locally in each user's browser with `localStorage`. It is not committed to the repo and it is not shared between users.

Example memory commands:

```text
remember that my name is Chad
commit this to memory: I like concise answers
save this to memory: My favorite language is JavaScript
memory: I prefer examples with code
```

Saved memory entries appear in the Memory Log modal with timestamps like:

```text
[2026-Jul-09 10:32:30 PM (GMT+8)] I like concise answers
```

## Memory Log

Open `Memory Log` to view saved local memories.

Inside the modal you can:

- Download the memory log as `memory.log`
- Clear all saved local memories
- Close the modal with the close button, Escape, or by clicking outside it

The `.gitignore` file ignores local memory log exports:

```gitignore
memory.log
*.memory.log
```

## Customizing The Bot

Edit `buildPrompt()` in `chat_api.js` to change the chatbot's behavior:

```js
function buildPrompt(userInput, memories = []) {
  const memoryBlock = formatMemoryPrompt(memories);

  return `You are a friendly, practical chatbot. Keep replies clear, concise, and helpful.
${memoryBlock}
User: ${userInput}`;
}
```

## File Overview

- `index.html` - app layout and memory modal
- `style.css` - page, chat, and modal styles
- `script.js` - chat UI, memory commands, modal controls
- `chat_api.js` - Gemini API calls, prompt building, local memory helpers
- `.github/workflows/deploy-pages.yml` - GitHub Pages deployment
- `.gitignore` - ignores local memory log exports

## Troubleshooting

If you see this error:

```text
Gemini API key is not configured.
```

Check that:

- `CHATBOT_API` exists as a GitHub Actions secret
- GitHub Pages is using GitHub Actions as the source
- The deployment workflow completed successfully
- `chat_api.js` still contains `__CHATBOT_API__` before deployment

If memory does not persist, check that:

- Your browser allows `localStorage`
- You are using the same browser and site URL
- You did not click `Clear Memory`
