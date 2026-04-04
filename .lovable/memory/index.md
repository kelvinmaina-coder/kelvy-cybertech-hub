# Project Memory

## Core
Dark cyber theme with 7 switchable themes. Ollama AI (localhost:11434) for all AI features.
Kenya-focused: KES currency, M-Pesa Daraja API ready. Super admin: kelvinmaina4925@gmail.com.
Roles: super_admin, manager, security_analyst, technician, client, guest. Client = default on signup.
Python FastAPI backend on port 8000 for Linux security tools. No mock data — real Supabase queries.
Landing page at /. Dashboard at /dashboard. Chat system with real-time messaging. Notification bell in header.

## Memories
- [Theme system](mem://design/themes) — 7 themes: default, cyberpunk, sunset, forest, ocean, royal, matrix
- [Auth & roles](mem://features/auth) — Email signup with verification, role-based access, super_admin approval, forgot password flow
- [Ollama config](mem://features/ollama) — Models: qwen3-vl:8b (vision), qwen2.5:7b (chat), nomic-embed-text
- [Backend tools](mem://features/backend) — Python FastAPI on port 8000, 70+ Linux security tools
- [Chat system](mem://features/chat) — Real-time direct & group messaging via Supabase Realtime
- [Notifications](mem://features/notifications) — In-app bell, broadcast notices, per-user prefs
