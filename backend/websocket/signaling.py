import asyncio
import json
import uuid
from typing import Dict, Set
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

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
        self.group_rooms: Dict[str, Set[str]] = {}
        self.pending_calls: Dict[str, Dict] = {}

    async def connect(self, websocket: WebSocket, user_id: str, user_name: str, user_role: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_status[user_id] = {
            "user_id": user_id,
            "name": user_name,
            "role": user_role,
            "status": "online",
            "last_seen": datetime.now().isoformat()
        }
        await self.broadcast_user_list()
        await self.broadcast({"type": "user:online", "user_id": user_id, "user_name": user_name})

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
        if user_id in self.user_status:
            self.user_status[user_id]["status"] = "offline"
            self.user_status[user_id]["last_seen"] = datetime.now().isoformat()
        asyncio.create_task(self.broadcast_user_list())
        asyncio.create_task(self.broadcast({"type": "user:offline", "user_id": user_id}))

    async def broadcast_user_list(self):
        message = {"type": "user_list", "users": list(self.user_status.values())}
        await self.broadcast(message)

    async def broadcast(self, message: dict):
        for connection in self.active_connections.values():
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

    async def create_call(self, caller_id: str, callee_id: str, call_type: str):
        call_id = str(uuid.uuid4())
        self.pending_calls[call_id] = {
            "caller": caller_id,
            "callee": callee_id,
            "type": call_type,
            "status": "pending",
            "started_at": datetime.now().isoformat()
        }
        return call_id

    async def end_call(self, call_id: str):
        if call_id in self.pending_calls:
            self.pending_calls[call_id]["status"] = "ended"
            del self.pending_calls[call_id]

    async def join_group_room(self, room_id: str, user_id: str, user_name: str, user_role: str):
        if room_id not in self.group_rooms:
            self.group_rooms[room_id] = set()
        self.group_rooms[room_id].add(user_id)
        await self.broadcast_to_room(room_id, {
            "type": "group-call:participant-joined",
            "user_id": user_id,
            "user_name": user_name,
            "user_role": user_role
        })

    async def leave_group_room(self, room_id: str, user_id: str):
        if room_id in self.group_rooms:
            self.group_rooms[room_id].discard(user_id)
            await self.broadcast_to_room(room_id, {
                "type": "group-call:participant-left",
                "user_id": user_id
            })

    async def broadcast_to_room(self, room_id: str, data: dict):
        if room_id in self.group_rooms:
            for user_id in self.group_rooms[room_id]:
                if user_id in self.active_connections:
                    try:
                        await self.active_connections[user_id].send_json(data)
                    except:
                        pass

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
                call_id = await manager.create_call(user_id, target, data.get("call_type", "video"))
                await manager.send_to_user(target, {
                    "type": "incoming_call",
                    "call_id": call_id,
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
                call_id = data.get("call_id")
                await manager.end_call(call_id)
                await manager.send_to_user(target, {"type": "call:end", "from": user_id})
            
            elif msg_type == "call:decline":
                target = data.get("target")
                call_id = data.get("call_id")
                await manager.end_call(call_id)
                await manager.send_to_user(target, {"type": "call:decline", "from": user_id})
            
            elif msg_type == "group-call:join":
                room_id = data.get("room_id")
                await manager.join_group_room(room_id, user_id, user_name, user_role)
            
            elif msg_type == "group-call:leave":
                room_id = data.get("room_id")
                await manager.leave_group_room(room_id, user_id)
            
            elif msg_type == "group-call:raise-hand":
                room_id = data.get("room_id")
                await manager.broadcast_to_room(room_id, {
                    "type": "group-call:hand-raised",
                    "user_id": user_id,
                    "user_name": user_name
                })
            
            elif msg_type == "group-call:lower-hand":
                room_id = data.get("room_id")
                await manager.broadcast_to_room(room_id, {
                    "type": "group-call:hand-lowered",
                    "user_id": user_id
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
