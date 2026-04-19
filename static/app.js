(function () {
  // ── Tela de boas-vindas ──
  const welcomeScreen = document.getElementById("welcome-screen");
  const welcomeNameInput = document.getElementById("welcome-name");
  const btnEnter = document.getElementById("btnEnter");

  // ── Chat ──
  const chatCard    = document.getElementById("chat-card");
  const logEl       = document.getElementById("log");
  const dotEl       = document.getElementById("dot");
  const statusText  = document.getElementById("status-text");
  const typingEl    = document.getElementById("typing-indicator");
  const typingText  = document.getElementById("typing-text");
  const nameInput   = document.getElementById("name");
  const msgInput    = document.getElementById("message");
  const btnSend     = document.getElementById("btnSend");
  const btnName     = document.getElementById("btnName");

  const scheme = window.location.protocol === "https:" ? "wss" : "ws";
  const wsUrl  = scheme + "://" + window.location.host + "/ws";

  let socket         = null;
  let myId           = null;
  let pendingName    = null;
  let reconnectDelay = 2000;
  let typingTimer    = null;
  let typingThrottle = null;

  function now() {
    return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }

  function addMessage(type, content) {
    const wrap = document.createElement("div");
    wrap.className = "msg";

    if (type === "chat") {
      const isMine = content.clientId === myId;
      wrap.classList.add(isMine ? "msg-mine" : "msg-other");

      if (!isMine) {
        const sender = document.createElement("div");
        sender.className = "sender";
        sender.textContent = content.from || "?";
        wrap.appendChild(sender);
      }

      const bubble = document.createElement("div");
      bubble.className = "bubble";
      const text = document.createElement("span");
      text.className = "text";
      text.textContent = content.text || "";
      const time = document.createElement("span");
      time.className = "time";
      time.textContent = now();
      bubble.appendChild(text);
      bubble.appendChild(time);
      wrap.appendChild(bubble);

    } else if (type === "system") {
      wrap.className += " msg-system";
      wrap.textContent = content;
    } else {
      wrap.className += " msg-error";
      wrap.textContent = content;
    }

    logEl.appendChild(wrap);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setConnected(connected) {
    dotEl.className        = "dot" + (connected ? " online" : "");
    statusText.textContent = connected ? "Conectado" : "Desconectado";
    btnSend.disabled       = !connected;
  }

  function showTyping(name) {
    typingText.textContent = `${name} está digitando`;
    typingEl.classList.add("visible");
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => typingEl.classList.remove("visible"), 2500);
  }

  function connect() {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => setConnected(true);

    socket.onclose = () => {
      setConnected(false);
      addMessage("system", `Conexão perdida. Reconectando em ${reconnectDelay / 1000}s...`);
      setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 1.5, 15000);
    };

    socket.onerror = () => addMessage("error", "Erro na conexão WebSocket.");

    socket.onmessage = (ev) => {
      let data;
      try { data = JSON.parse(ev.data); }
      catch { addMessage("error", ev.data); return; }

      switch (data.type) {
        case "welcome":
          myId = data.clientId;
          nameInput.placeholder = data.displayName || "Seu apelido...";
          // Envia apelido escolhido na tela de boas-vindas
          if (pendingName) {
            socket.send(JSON.stringify({ type: "set_name", name: pendingName }));
            pendingName = null;
          } else {
            addMessage("system", "Você entrou na sala.");
          }
          break;
        case "system":
          addMessage("system", data.text || "");
          break;
        case "chat":
          addMessage("chat", { from: data.from, clientId: data.clientId, text: data.text });
          break;
        case "typing":
          showTyping(data.name || "Alguém");
          break;
        case "error":
          addMessage("error", data.text || "Erro");
          break;
        default:
          addMessage("system", ev.data);
      }
    };
  }

  function enterChat() {
    const name = welcomeNameInput.value.trim();
    pendingName = name || null;
    if (name) nameInput.value = name;

    welcomeScreen.style.display = "none";
    chatCard.classList.add("visible");
    connect();
    msgInput.focus();
  }

  btnEnter.addEventListener("click", enterChat);
  welcomeNameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); enterChat(); }
  });

  btnSend.addEventListener("click", () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const text = msgInput.value.trim();
    if (!text) return;
    socket.send(JSON.stringify({ type: "chat", text }));
    msgInput.value = "";
    msgInput.focus();
  });

  btnName.addEventListener("click", () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const name = nameInput.value.trim();
    socket.send(JSON.stringify({ type: "set_name", name }));
  });

  msgInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); btnSend.click(); return; }
    if (!typingThrottle && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "typing" }));
      typingThrottle = setTimeout(() => { typingThrottle = null; }, 1500);
    }
  });
})();
