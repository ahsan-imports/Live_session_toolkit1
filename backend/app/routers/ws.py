from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from ..ws_manager import manager

router = APIRouter()


@router.websocket("/ws/session/{code}")
async def session_socket(websocket: WebSocket, code: str):
    code = code.upper()
    await manager.connect(code, websocket)
    try:
        while True:
            # Facilitator/participant clients don't need to send anything;
            # this just keeps the connection open and detects disconnects.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(code, websocket)
