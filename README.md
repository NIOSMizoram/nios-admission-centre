# NIOS Admission Centre — GitHub Pages + OpenAI Chatbot

Minimal landing page using the provided NIOS Admission Centre logo.

## Architecture

- `index.html`, `styles.css`, `app.js` → GitHub Pages frontend
- `worker/index.js` → Cloudflare Worker backend
- OpenAI Responses API + File Search → answers from the NIOS Knowledge Base
- WhatsApp → `+91 60017 85085`

GitHub Pages is a static hosting service, so the OpenAI API key must NOT be placed in the browser code. Keep the API key on the server/Worker. See OpenAI's API security guidance.

## 1. Put the site on GitHub

Create a repository, upload:

- `index.html`
- `styles.css`
- `app.js`
- `assets/logo.png`

Then enable GitHub Pages from Settings → Pages.

## 2. Create the OpenAI Knowledge Base

Copy the Word knowledge-base file into this project root:

`NIOS_AI_Chatbot_Knowledge_Base_Handbook_2026-27_Mizo.docx`

Then:

```bash
npm install
OPENAI_API_KEY="your-key" npm run upload-kb
```

The script prints a `VECTOR_STORE_ID`.

## 3. Deploy the backend

Cloudflare Worker is used because GitHub Pages cannot safely hold an OpenAI API secret.

Install Wrangler if needed:

```bash
npm install -g wrangler
wrangler login
```

Set secrets:

```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put VECTOR_STORE_ID
```

Edit `worker/wrangler.toml`:

- `ALLOWED_ORIGIN = "https://YOUR-USERNAME.github.io"`
- `OPENAI_MODEL = "gpt-5.6-luna"`

Deploy:

```bash
wrangler deploy worker/index.js
```

Copy the Worker URL, for example:

`https://nios-admission-chatbot.example.workers.dev`

## 4. Connect the landing page to the Worker

Open `app.js` and change:

```js
const CHAT_API = "https://YOUR-WORKER.your-subdomain.workers.dev/chat";
```

to your actual Worker URL.

Commit/push to GitHub.

## 5. Important

Never put `OPENAI_API_KEY` inside `index.html`, `app.js`, or any GitHub Pages file.

The chatbot uses OpenAI File Search against the configured vector store. If you update the Knowledge Base later, upload the new file and point the Worker to the updated vector store/file.

