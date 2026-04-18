# Chat em tempo real com WebSocket (Python + Tornado)

Aplicação simples de **sala única**: mensagens enviadas por qualquer cliente são **replicadas para todos** os conectados. Demonstra conexão/desconexão, broadcast e uso do protocolo WebSocket com o framework **Tornado**.

## Integrantes do grupo

- Nome 1 — papel (ex.: servidor WebSocket)
- Nome 2 — papel (ex.: cliente HTML/JS)
- Nome 3 — papel (ex.: documentação / apresentação)

_Substitua pelos nomes reais do grupo._

## Requisitos

- Python **3.10** ou superior
- Navegador moderno (Chrome, Firefox, Edge, etc.)

## Instalação

No diretório do projeto:

```bash
python -m venv .venv
```

Ative o ambiente virtual:

- **Windows (PowerShell):** `.\.venv\Scripts\Activate.ps1`
- **Linux/macOS:** `source .venv/bin/activate`

Instale as dependências:

```bash
pip install -r requirements.txt
```

## Execução

```bash
python server.py
```

Abra no navegador: **http://127.0.0.1:8888**

O servidor escuta em `0.0.0.0:8888`, permitindo acesso na rede local (útil para demo em celular na mesma rede).

- Página estática e assets: HTTP na porta **8888**
- WebSocket: `ws://127.0.0.1:8888/ws` (o cliente JS monta a URL automaticamente)

Para testar **múltiplos clientes**, abra várias abas ou navegadores na mesma URL.

## Estrutura do projeto

| Arquivo / pasta | Descrição |
|-----------------|-----------|
| `server.py` | Servidor Tornado, rota `/ws` (WebSocket) e arquivos estáticos |
| `static/index.html` | Interface do chat |
| `static/app.js` | Cliente WebSocket no navegador |
| `requirements.txt` | Dependências Python |

## Entrega (GitHub + AVA)

1. Crie um repositório **público** no GitHub (ou privado **com acesso liberado** ao professor).
2. Envie o código: `git init`, `git add .`, `git commit`, `git remote add origin ...`, `git push -u origin main` (ou `master`).
3. No **AVA**, entregue o **link do repositório** e os arquivos solicitados pelo professor, até **24/04/2026 23:59**.

## Apresentação (resumo técnico)

- **Handshake:** o cliente inicia com HTTP; o servidor responde com upgrade para WebSocket (ex.: status 101).
- **Persistência:** após o handshake, o canal permanece aberto para frames bidirecionais.
- **Encerramento:** fechamento pelo navegador ou servidor dispara `on_close` no handler; ping keep-alive ajuda a detectar quedas.

No código, `ChatSocketHandler.open` / `on_close` tratam entrada e saída; `on_message` processa JSON e `write_message` envia aos clientes.
