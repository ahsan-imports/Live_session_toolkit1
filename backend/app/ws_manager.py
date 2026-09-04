from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    """Tracks live WebSocket connections per session code and broadcasts
    JSON-serialisable events to every connection watching that session.

    This is intentionally a simple in-memory manager: it is enough to run
    a single backend process locally. A production deployment serving
    multiple backend instances would swap this for a pub/sub layer
    (e.g. Redis) so broadcasts reach connections held by other instances.
    """

    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = defaultdict(set)

    async def connect(self, session_code: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self._connections[session_code].add(websocket)

    def disconnect(self, session_code: str, websocket: WebSocket) -> None:
        self._connections[session_code].discard(websocket)
        if not self._connections[session_code]:
            self._connections.pop(session_code, None)

    async def broadcast(self, session_code: str, message: dict) -> None:
        dead: list[WebSocket] = []
        for connection in self._connections.get(session_code, set()):
            try:
                await connection.send_json(message)
            except Exception:
                dead.append(connection)
        for connection in dead:
            self.disconnect(session_code, connection)


manager = ConnectionManager()
