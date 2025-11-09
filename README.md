# AI Creative Studio (Google Generative AI)

This is a Next.js (App Router) + TypeScript project demonstrating a text-to-image workflow using Google Generative AI for prompt enhancement and image generation, with Supabase for auth, storage, and persistence.

The README below is structured with concise tables for quick reference: setup, environment variables, models used, and API route documentation.

---

## Quick setup

1. Copy `.env.example` -> `.env.local` and fill in values.
2. Create a Supabase project and enable Auth.
3. Create a `generations` table (example SQL) and a Storage bucket named `generations`:

```sql
create table public.generations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  original_prompt text,
  enhanced_prompt text,
  image_url text,
  created_at timestamptz default now()
);
```

4. Install deps and run (PowerShell):

```powershell
npm install
npm run dev
```

If you hit peer dependency errors (ERESOLVE) related to React/Next, confirm `react`/`react-dom` are `18.2.0` in `package.json`, or run `npm install --legacy-peer-deps` as a temporary workaround.

---

## Environment variables

| Name | Purpose | Notes |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Public (client) |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key | Public (client) |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key | Server-only: used by `lib/serverSupabase.ts` for uploads/inserts |
| GEMINI_API_KEY / GOOGLE_GEMINI_API_KEY | Google Generative AI key | Server-only: used by API routes |

Keep service keys out of client bundles. Only expose NEXT_PUBLIC_* variables to the browser.

---

## Models used (exact names from code)

| Purpose | Model name (as used in code) | Notes |
|---|---:|---|
| Prompt enhancement | `gemini-2.0-flash` | Used in `app/api/enhance/route.ts` via `GoogleGenerativeAI` |
| Image generation (preview) | `gemini-2.5-flash-image-preview` | Used in `app/api/generate/route.ts` to generate image payloads (expects inline/base64 data) |

If you prefer different models (e.g., `gemini-1.5-pro` or an Imagen variant), update the model strings in the corresponding route files and verify request/response shapes against Google's API docs.

---

## Important files (overview)

| Path | Purpose |
|---|---|
| `app/layout.tsx` | Global layout, header and navigation |
| `app/page.tsx` | Home page — session check and `PromptForm` mount |
| `app/(auth)/login/page.tsx` | Sign-in page (Supabase client) |
| `app/(auth)/signup/page.tsx` | Sign-up page |
| `app/generations/page.tsx` | User gallery — reads `generations` table |
| `components/PromptForm.tsx` | Client UI for enhancing prompts and generating images |
| `app/api/enhance/route.ts` | Server route: prompt enhancement using Gemini |
| `app/api/generate/route.ts` | Server route: image generation and Supabase Storage upload |
| `lib/supabaseClient.ts` | Client-side Supabase instance (anon key) |
| `lib/serverSupabase.ts` | Server-side Supabase instance (service role) |
| `lib/types.ts` | Shared TypeScript interfaces |

---

## API routes (concise tables)

### POST /api/enhance

| Field | Value |
|---|---|
| Path | `/api/enhance` |
| Method | POST |
| Request body | JSON: `{ "prompt": "<short prompt>" }` |
| Success (200) | `{ "enhanced": "<enhanced prompt string>" }` |
| Errors | `{ "error": "message" }` — 400 for validation, 401 for API key, 429 for quota, 500 otherwise |
| Notes | Uses `GoogleGenerativeAI` with model `gemini-2.0-flash`. The route builds an instruction that asks the model to return ONLY the enhanced prompt (no extra text). |

Example request:

```json
{ "prompt": "a vibrant forest at dusk" }
```

### POST /api/generate

| Field | Value |
|---|---|
| Path | `/api/generate` |
| Method | POST |
| Request body | JSON: `{ "prompt": "<prompt>", "userId": "<uuid?>", "save": true|false }` |
| Success (200) | `{ "imageUrl": "https://.../generations/xxx.png" }` |
| Errors | `{ "error": "message" }` — 400 for validation, 500 for generation/upload failures |
| Notes | Uses `GoogleGenerativeAI` with model `gemini-2.5-flash-image-preview`. The route extracts base64 `inlineData` from response candidates, uploads to Supabase Storage (`generations/...png`), and returns the public URL. If `save` and `userId` are provided, a DB insert into `generations` is performed. |

Example request:

```json
{ "prompt": "<enhanced prompt>", "userId": "<user-uuid>", "save": true }
```

---

## Client behavior

- `components/PromptForm.tsx` calls `/api/enhance` and `/api/generate` via Axios. Enhanced prompts replace the textarea value and generation returns an image URL that is displayed immediately.
- `/generations` page reads the `generations` table for the authenticated user and displays thumbnails with download links.

---

## Supabase setup notes

- `lib/supabaseClient.ts` uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for client operations.
- `lib/serverSupabase.ts` uses `SUPABASE_SERVICE_ROLE_KEY` to upload images and insert metadata server-side.
- Ensure a Storage bucket named `generations` exists and is configured for public URLs or use signed URLs if you want access control.





