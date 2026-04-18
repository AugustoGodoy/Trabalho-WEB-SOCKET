# Chat ao vivo — WebSocket com Python e Tornado

Chat em tempo real onde qualquer mensagem enviada aparece para todo mundo que estiver na sala. Feito com Python, Tornado e HTML/JavaScript puro.

## Integrantes do grupo

- Nome 1
- Nome 2
- Nome 3

## Como rodar

**1. Crie um ambiente virtual e instale as dependências:**

```bash
python -m venv .venv
```

Ative o ambiente:

- Windows (PowerShell): `.\.venv\Scripts\Activate.ps1`
- Linux/macOS: `source .venv/bin/activate`

```bash
pip install -r requirements.txt
```

**2. Inicie o servidor:**

```bash
python server.py
```

**3. Abra no navegador:**

```
http://127.0.0.1:8080
```

Para testar com vários usuários ao mesmo tempo, abra em duas abas ou dois navegadores.

## Testar de outro PC ou celular (mesma rede Wi-Fi)

1. No PC que roda o servidor, descubra o IP com `ipconfig` (procure o IPv4 do Wi-Fi, ex.: `192.168.1.17`).
2. No outro aparelho, abra: `http://192.168.1.17:8080`
3. O celular precisa estar no **mesmo Wi-Fi** que o PC servidor, com dados móveis desligados.

## Se não conseguir conectar de outro aparelho

**Opção 1 — Liberar a porta no firewall do Windows** (precisa de administrador):

```bat
netsh advfirewall firewall add rule name="Chat 8080" dir=in action=allow protocol=TCP localport=8080
```

**Opção 2 — Túnel público** (funciona mesmo quando o roteador bloqueia dispositivos entre si):

```bash
cloudflared tunnel --url http://127.0.0.1:8080
```

O programa vai mostrar um endereço `https://....trycloudflare.com`. Abra esse link em qualquer aparelho, em qualquer rede. Feche o túnel quando terminar.

> Para instalar o cloudflared: `winget install --id Cloudflare.cloudflared`

## Arquivos do projeto

| Arquivo | O que faz |
|---------|-----------|
| `server.py` | Servidor WebSocket (Tornado) |
| `static/index.html` | Página do chat |
| `static/app.js` | Lógica do chat no navegador |
| `requirements.txt` | Dependências Python |
| `scripts/abrir_firewall_8080.bat` | Abre a porta 8080 no firewall (rodar como administrador) |
