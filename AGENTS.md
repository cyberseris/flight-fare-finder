# Agent notes

- The backend is the project's own Supabase project. Client config lives in
  `src/integrations/supabase/client.ts` and reads `VITE_SUPABASE_URL` /
  `VITE_SUPABASE_PUBLISHABLE_KEY` from `.env`.
- Keep the Sign Up / Sign In / Sign Out flow in `src/pages/Auth.tsx` and
  `src/pages/Dashboard.tsx` intact.
