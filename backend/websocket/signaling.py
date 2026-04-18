import asyncio
import json
from typing import Dict, Set
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_json(message)
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
            await connection.send_json(message)

manager = ConnectionManager()

async def signaling_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "call:offer":
                await manager.send_personal_message({"type": "call:offer", "offer": message["offer"], "from": user_id}, message["to"])
            elif message.get("type") == "call:answer":
                await manager.send_personal_message({"type": "call:answer", "answer": message["answer"], "from": user_id}, message["to"])
            elif message.get("type") == "call:ice-candidate":
                await manager.send_personal_message({"type": "call:ice-candidate", "candidate": message["candidate"], "from": user_id}, message["to"])
    except WebSocketDisconnect:
        manager.disconnect(user_id)
