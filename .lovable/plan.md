## Phase 1: Theme System & Visual Effects
1. Add 6 color themes (Cyberpunk, Sunset, Forest, Ocean, Royal, Matrix) + theme switcher in sidebar
2. Add glassmorphism, animated glows, pulse effects, scanline toggle

## Phase 2: Module Upgrades (Real CRUD with Supabase)
3. ERP: Real invoice CRUD (create/edit/delete invoices, M-Pesa ref tracking)
4. Security Hub: Real scan history from DB, threat severity charts, live event feed
5. Client Portal: Clients see ONLY their own tickets, invoices, projects
6. IDE: Code editor with syntax highlighting + send code to Ollama for AI review
7. Network Hub: Connect to backend for device discovery, real metrics display

## Phase 3: AI & Automation Enhancements
8. AI Assistant: Add system prompt presets (Security Analyst, Code Assistant, Business Advisor), markdown rendering
9. Upgrade Python backend script with all 70+ tools organized by category
10. Automation page: Show scheduled tasks with status, add ability to trigger manual runs

## What stays frontend-only (can't run in Lovable):
- Desktop Electron app, Mobile React Native app, Voice assistant (VOSK/Coqui)
- These require separate repos — I'll note how to set them up

## Not changing:
- Auth system (already working)
- Role-based access (already working)
- Database schema (already set up)
