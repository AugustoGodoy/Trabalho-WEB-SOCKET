(function () {
  const logEl = document.getElementById("log");
  const statusEl = document.getElementById("status");
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");
  const btnSend = document.getElementById("btnSend");
  const btnName = document.getElementById("btnName");

  const scheme = window.location.protocol === "https:" ? "wss" : "ws";
  const wsUrl = scheme + "://" + window.location.host + "/ws";

  let socket = null;

  function appendLine(className, text) {
    const div = document.createElement("div");
    div.className = className;
    div.textContent = text;
    logEl.appendChild(div);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setConnected(connected) {
    if (connected) {
      statusEl.textContent = "Conectado";
      statusEl.className = "connected";
      btnSend.disabled = false;
    } else {
      statusEl.textContent = "Desconectado";
      statusEl.className = "disconnected";
      btnSend.disabled = true;
    }
  }

  function connect() {
    socket = new WebSocket(wsUrl);

    socket.onopen = function () {
      setConnected(true);
    };

    socket.onclose = function () {
      setConnected(false);
      appendLine("msg-system", "[Conexão encerrada. Recarregue a página para reconectar.]");
    };

    socket.onerror = function () {
      appendLine("msg-error", "[Erro no WebSocket.]");
    };

    socket.onmessage = function (ev) {
      let data;
      try {
        data = JSON.parse(ev.data);
      } catch {
        appendLine("msg-error", ev.data);
        return;
      }
      if (data.type === "welcome") {
        nameInput.placeholder = data.displayName || "Apelido";
        appendLine("msg-system", "Bem-vindo. Seu id: " + (data.clientId || "?"));
        return;
      }
      if (data.type === "system") {
        appendLine("msg-system", data.text || "");
        return;
      }
      if (data.type === "chat") {
        appendLine("msg-chat", (data.from || "?") + ": " + (data.text || ""));
        return;
      }
      if (data.type === "error") {
        appendLine("msg-error", data.text || "Erro");
        return;
      }
      appendLine("msg-system", ev.data);
    };
  }

  btnSend.addEventListener("click", function () {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const text = messageInput.value.trim();
    if (!text) return;
    socket.send(JSON.stringify({ type: "chat", text: text }));
    messageInput.value = "";
    messageInput.focus();
  });

  btnName.addEventListener("click", function () {
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    const name = nameInput.value.trim();
    socket.send(JSON.stringify({ type: "set_name", name: name }));
  });

  messageInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      btnSend.click();
    }
  });

  connect();
})();
