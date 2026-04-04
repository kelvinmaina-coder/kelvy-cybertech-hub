## Phase 1: Database Migration
Create tables for: conversations, messages, message_reads, conversation_participants, notifications, notification_preferences, broadcast_notices, dismissed_notices, chat_history (AI), audit_logs + RLS policies + realtime

## Phase 2: Chat System UI
- `/chat` route with conversation list, message window, real-time messaging via Supabase Realtime
- Direct messages and group chats
- Contact list grouped by role

## Phase 3: Notification System
- NotificationBell component in header with unread count
- Notification dropdown panel
- `/notifications` full page
- Broadcast notices for super_admin
- Real-time notification updates

## Phase 4: Landing Page & UI Polish
- Professional landing/website page at `/` for unauthenticated users
- Dashboard moves to `/dashboard`
- Hero section, features grid, pricing, CTA
- Improved navigation and responsive design

## Phase 5: Enhanced Auth
- Forgot password flow with `/reset-password` page
- Profile settings page for all users (edit name, phone, company, avatar)

## Out of Scope (requires external setup)
- Google OAuth (needs credentials configured in Cloud)
- Phone/SMS verification (needs Twilio/Africa's Talking connector)
- Electron/Mobile apps (separate repos)
- Voice assistant (VOSK - desktop only)
