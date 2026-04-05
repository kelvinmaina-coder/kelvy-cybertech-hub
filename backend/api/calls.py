"""Calls & meetings API."""
from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class CallRequest(BaseModel):
    caller_id: str
    receiver_id: str
    call_type: str = "audio"


class MeetingRequest(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_at: str
    duration_minutes: int = 30
    host_id: str
    invitees: list[str] = []


@router.post("/calls/initiate")
async def initiate_call(req: CallRequest):
    return {"status": "initiated", "call_type": req.call_type, "message": "Call signaling handled via WebSocket/Supabase Realtime"}


@router.post("/calls/accept")
async def accept_call(call_id: str):
    return {"status": "accepted", "call_id": call_id}


@router.post("/calls/reject")
async def reject_call(call_id: str):
    return {"status": "rejected", "call_id": call_id}


@router.post("/calls/end")
async def end_call(call_id: str):
    return {"status": "ended", "call_id": call_id}


@router.get("/calls/history")
async def call_history(user_id: str):
    return {"calls": [], "message": "Call history stored in Supabase calls table"}


@router.post("/meetings/schedule")
async def schedule_meeting(req: MeetingRequest):
    import uuid
    meeting_link = f"https://meet.kelvy.tech/{uuid.uuid4().hex[:8]}"
    return {
        "status": "scheduled",
        "meeting_link": meeting_link,
        "title": req.title,
        "scheduled_at": req.scheduled_at,
    }


@router.get("/meetings")
async def list_meetings(user_id: str):
    return {"meetings": [], "message": "Meetings stored in Supabase meetings table"}


@router.post("/meetings/join")
async def join_meeting(meeting_id: str, user_id: str):
    return {"status": "joined", "meeting_id": meeting_id}
