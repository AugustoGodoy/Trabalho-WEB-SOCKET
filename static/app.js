(function () {
  const logEl      = document.getElementById("log");
  const dotEl      = document.getElementById("dot");
  const statusText = document.getElementById("status-text");
  const nameInput  = document.getElementById("name");
  const msgInput   = document.getElementById("message");
  const btnSend    = document.getElementById("btnSend");
  const btnName    = document.getElementById("btnName");

  const scheme = window.location.protocol === "https:" ? "wss" : "ws";
  const wsUrl  = scheme + "://" + window.location.host + "/ws";

  let socket = null;

  function addBubble(type, content) {
    const wrap = document.createElement("div");

    if (type === "chat") {
      wrap.className = "bubble bubble-chat";
      const sender = document.createElement("div");
      sender.className = "sender";
      sender.textContent = content.from || "?";
      const text = document.createElement("div");
      text.textContent = content.text || "";
      wrap.appendChild(sender);
      wrap.appendChild(text);
    } else if (type === "system") {
      wrap.className = "bubble bubble-system";
      wrap.textContent = content;
    } else {
      wrap.className = "bubble bubble-error";
      wrap.textContent = content;
    }

    logEl.appendChild(wrap);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setConnected(connected) {
    dotEl.className      = "status-dot" + (connected ? " connected" : "");
    statusText.textContent = connected ? "Conectado" : "Desconectado";
    btnSend.disabled     = !connected;
  }

  function connect() {
    socket = new WebSocket(wsUrl);

    socket.onopen = () => setConnected(true);

    socket.onclose = () => {
      setConnected(false);
      addBubble("system", "Conexão encerrada. Recarregue para reconectar.");
    };

    socket.onerror = () => addBubble("error", "Erro na conexão WebSocket.");

    socket.onmessage = (ev) => {
      let data;
      try { data = JSON.parse(ev.data); }
      catch { addBubble("error", ev.data); return; }

      switch (data.type) {
        case "welcome":
          nameInput.placeholder = data.displayName || "Seu apelido...";
          addBubble("system", "Você entrou na sala.");
          break;
        case "system":
          addBubble("system", data.text || "");
          break;
        case "chat":
          addBubble("chat", { from: data.from, text: data.text });
          break;
        case "error":
          addBubble("error", data.text || "Erro");
          break;
        default:
          addBubble("system", ev.data);
      }
    };
  }

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
    socket.send(JSON.stringify({ type: "set_name", name: nameInput.value.trim() }));
  });

  msgInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); btnSend.click(); }
  });

  connect();
})();
