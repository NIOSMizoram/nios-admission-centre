const CHAT_API = "https://nios-admission-ai.lsventuresmz.workers.dev/chat";

const overlay = document.getElementById("chatOverlay");
const openButtons = [
  document.getElementById("openChat"),
  document.getElementById("chatFab")
];
const closeBtn = document.getElementById("closeChat");
const form = document.getElementById("chatForm");
const input = document.getElementById("chatInput");
const messages = document.getElementById("messages");
const conversationHistory = [];
const newChatBtn = document.getElementById("newChat");

newChatBtn.addEventListener("click", () => {
  conversationHistory.length = 0;
  messages.innerHTML = "";
  addMessage("New chat started. Eng emaw zawt rawh.", "bot");
  input.focus();
});

function openChat() {
  overlay.classList.add("open");
  overlay.setAttribute("aria-hidden", "false");
  setTimeout(() => input.focus(), 100);
}

function closeChat() {
  overlay.classList.remove("open");
  overlay.setAttribute("aria-hidden", "true");
}

openButtons.forEach(button => {
  if (button) {
    button.addEventListener("click", openChat);
  }
});

closeBtn.addEventListener("click", closeChat);

overlay.addEventListener("click", e => {
  if (e.target === overlay) {
    closeChat();
  }
});

document.querySelectorAll(".quick-prompts button").forEach(btn => {
  btn.addEventListener("click", () => {
    input.value = btn.dataset.prompt;
    input.focus();
  });
});

function addMessage(text, type) {
  const div = document.createElement("div");
  div.className = `msg ${type}`;

  const cleanText = text
    .replace(/\*\*/g, "")
    .replace(/^#+\s*/gm, "");

  div.textContent = cleanText;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;

  return div;
}

async function askAssistant(question) {
  if (!CHAT_API || CHAT_API.includes("YOUR-WORKER")) {
    addMessage(
      "Chatbot backend is not connected yet. Please set CHAT_API in app.js after deploying the Cloudflare Worker.",
      "bot"
    );
    return;
  }

  const loading = addMessage("Lo nghak det aw...", "bot");

  try {
    const res = await fetch(CHAT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: question,
        history: conversationHistory
      })
    });

    const data = await res.json();

    loading.remove();

    if (!res.ok) {
      throw new Error(data.error || "Request failed");
    }

    addMessage(
      data.answer || "Answer awm lo. Please try again.",
      "bot"
    );

    if (
      Array.isArray(data.suggestions) &&
      data.suggestions.length > 0
    ) {
      const suggestionBox = document.createElement("div");
      suggestionBox.className = "suggestion-box";

      data.suggestions.slice(0, 3).forEach(question => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "suggestion-btn";
        button.textContent = question;

        button.addEventListener("click", () => {
          input.value = question;
          form.requestSubmit();
        });

        suggestionBox.appendChild(button);
      });

      messages.appendChild(suggestionBox);
      messages.scrollTop = messages.scrollHeight;
    }

    conversationHistory.push(
      {
        role: "user",
        content: question
      },
      {
        role: "assistant",
        content: data.answer || ""
      }
    );

  } catch (err) {
    loading.remove();

    addMessage(
      "Chatbot backend-ah problem a awm. WhatsApp hmangin kan contact theih bawk.",
      "bot"
    );
  }
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const q = input.value.trim();

  if (!q) return;

  addMessage(q, "user");

  input.value = "";

  await askAssistant(q);
});
