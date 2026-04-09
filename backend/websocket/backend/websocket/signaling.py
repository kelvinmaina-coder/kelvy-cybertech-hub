import asyncio
import json
import uuid
from typing import Dict, Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Kelvy WebSocket Signaling Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.user_status: Dict[str, Dict] = {}
        self.call_rooms: Dict[str, Set[str]] = {}
        self.group_call_rooms: Dict[str, Set[str]] = {}

    async def connect(self, websocket: WebSocket, user_id: str, user_name: str, user_role: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_status[user_id] = {
            "user_id": user_id,
            "name": user_name,
            "role": user_role,
            "status": "online"
        }
        await self.broadcast_user_list()

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_status:
            self.user_status[user_id]["status"] = "offline"
        asyncio.create_task(self.broadcast_user_list())

    async def broadcast_user_list(self):
        message = {
            "type": "user_list",
            "users": list(self.user_status.values())
        }
        for user_id, connection in self.active_connections.items():
            try:
                await connection.send_json(message)
            except:
                pass

    async def send_to_user(self, target_user_id: str, data: dict):
        if target_user_id in self.active_connections:
            try:
                await self.active_connections[target_user_id].send_json(data)
                return True
            except:
                return False
        return False

    async def create_call_room(self, caller_id: str, callee_id: str):
        room_id = f"call_{caller_id}_{callee_id}_{uuid.uuid4().hex[:8]}"
        self.call_rooms[room_id] = {caller_id, callee_id}
        return room_id

manager = ConnectionManager()

@app.websocket("/ws/{user_id}/{user_name}/{user_role}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, user_name: str, user_role: str):
    await manager.connect(websocket, user_id, user_name, user_role)
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            
            if msg_type == "call:offer":
                target = data.get("target")
                await manager.send_to_user(target, {
                    "type": "incoming_call",
                    "from": user_id,
                    "from_name": user_name,
                    "from_role": user_role,
                    "offer": data.get("offer"),
                    "call_type": data.get("call_type", "video")
                })
            
            elif msg_type == "call:answer":
                target = data.get("target")
                await manager.send_to_user(target, {
                    "type": "call:answer",
                    "from": user_id,
                    "answer": data.get("answer")
                })
            
            elif msg_type == "call:ice-candidate":
                target = data.get("target")
                await manager.send_to_user(target, {
                    "type": "call:ice-candidate",
                    "from": user_id,
                    "candidate": data.get("candidate")
                })
            
            elif msg_type == "call:end":
                target = data.get("target")
                await manager.send_to_user(target, {
                    "type": "call:end",
                    "from": user_id
                })
            
            elif msg_type == "call:decline":
                target = data.get("target")
                await manager.send_to_user(target, {
                    "type": "call:decline",
                    "from": user_id
                })

    except WebSocketDisconnect:
        manager.disconnect(user_id)

@app.get("/users")
async def get_users():
    return list(manager.user_status.values())

@app.get("/health")
async def health():
    return {
        "status": "online",
        "active_connections": len(manager.active_connections),
        "total_users": len(manager.user_status)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
