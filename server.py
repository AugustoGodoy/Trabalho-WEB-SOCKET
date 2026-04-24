"""
Servidor WebSocket com Tornado: chat em sala única (broadcast).
"""
import json
import os
import uuid

import tornado.ioloop
import tornado.web
import tornado.websocket


MAX_MESSAGE_LEN = 2000
MAX_NAME_LEN = 40

DEFAULT_PORT = 8080
PORT = int(os.environ.get("PORT", str(DEFAULT_PORT)))


class ChatSocketHandler(tornado.websocket.WebSocketHandler):
    clients: set["ChatSocketHandler"] = set()

    def check_origin(self, origin: str) -> bool:
        return True

    async def open(self) -> None:
        self.client_id = str(uuid.uuid4())[:8]
        self.display_name = f"Visitante-{self.client_id}"
        ChatSocketHandler.clients.add(self)
        await self._broadcast(
            {
                "type": "system",
                "text": f"{self.display_name} entrou na sala.",
                "online": len(ChatSocketHandler.clients),
            }
        )
        await self.write_message(
            json.dumps(
                {
                    "type": "welcome",
                    "clientId": self.client_id,
                    "displayName": self.display_name,
                    "online": len(ChatSocketHandler.clients),
                }
            )
        )

    async def on_message(self, message: str | bytes) -> None:
        if isinstance(message, bytes):
            message = message.decode("utf-8", errors="replace")
        if len(message) > MAX_MESSAGE_LEN:
            await self.write_message(
                json.dumps({"type": "error", "text": "Mensagem muito longa."})
            )
            return
        try:
            data = json.loads(message)
        except json.JSONDecodeError:
            await self.write_message(
                json.dumps({"type": "error", "text": "JSON inválido."})
            )
            return

        msg_type = data.get("type")

        if msg_type == "typing":
            # Repassa para todos exceto o remetente
            raw = json.dumps(
                {"type": "typing", "name": self.display_name},
                ensure_ascii=False,
            )
            for client in ChatSocketHandler.clients:
                if client is not self:
                    try:
                        await client.write_message(raw)
                    except tornado.websocket.WebSocketClosedError:
                        pass
            return

        if msg_type == "set_name":
            name = (data.get("name") or "").strip()
            if not name:
                name = self.display_name
            else:
                name = name[:MAX_NAME_LEN]
            old = self.display_name
            self.display_name = name
            await self._broadcast(
                {
                    "type": "system",
                    "text": f"{old} agora é {self.display_name}.",
                    "online": len(ChatSocketHandler.clients),
                }
            )
            return

        if msg_type == "chat":
            text = (data.get("text") or "").strip()
            if not text:
                return
            await self._broadcast(
                {
                    "type": "chat",
                    "from": self.display_name,
                    "clientId": self.client_id,
                    "text": text,
                }
            )
            return

        await self.write_message(
            json.dumps({"type": "error", "text": "Tipo de mensagem desconhecido."})
        )

    async def on_close(self) -> None:
        ChatSocketHandler.clients.discard(self)
        await self._broadcast(
            {
                "type": "system",
                "text": f"{self.display_name} saiu da sala.",
                "online": len(ChatSocketHandler.clients),
            }
        )

    async def _broadcast(self, payload: dict) -> None:
        raw = json.dumps(payload, ensure_ascii=False)
        dead: list[ChatSocketHandler] = []
        for client in ChatSocketHandler.clients:
            try:
                await client.write_message(raw)
            except tornado.websocket.WebSocketClosedError:
                dead.append(client)
        for c in dead:
            ChatSocketHandler.clients.discard(c)


def make_app() -> tornado.web.Application:
    return tornado.web.Application(
        [
            (r"/ws", ChatSocketHandler),
            (
                r"/(.*)",
                tornado.web.StaticFileHandler,
                {"path": "static", "default_filename": "index.html"},
            ),
        ],
        websocket_ping_interval=25,
        websocket_ping_timeout=20,
    )


def main() -> None:
    app = make_app()
    app.listen(PORT, address="0.0.0.0")
    print(f"Servidor em http://127.0.0.1:{PORT}  (WebSocket: /ws)")
    tornado.ioloop.IOLoop.current().start()


if __name__ == "__main__":
    main()
