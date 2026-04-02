## Phase 1 (This message): Foundation
1. Enable Lovable Cloud for database/auth
2. Create database schema (profiles, clients, tickets, invoices, scans, etc.)
3. Build Login/Register page with email verification
4. Set up role-based access control with route protection
5. Create Supabase client integration

## Phase 2: Core modules with real data
6. Connect Dashboard to real DB counts
7. CRM with full CRUD operations
8. ITSM with real ticket management
9. ERP with invoicing
10. Settings with user management (super_admin only)

## Phase 3: AI & Security
11. AI Assistant with vision model support (image upload for qwen3-vl)
12. Linux Tools frontend calling backend API
13. Security Hub with real scan history from DB

## Notes:
- Backend for Linux tool execution (port 8000) cannot run inside Lovable - will provide a Python FastAPI script the user runs on their laptop
- All frontend modules will connect to real Supabase data
- Role-based route protection enforced client-side + RLS server-side