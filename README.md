# Gallery Website

A photo gallery website with a PIN-protected admin dashboard. The public site shows a responsive masonry gallery with a lightbox viewer; the dashboard lets you upload images, organize them with categories and tags, rename them, and soft-delete them into a recycle bin.

Built as a zero-cost, serverless project: uploaded images are hosted on **imgBB** and gallery metadata is persisted as a `data.json` file in a **GitHub repository** via the Contents API. When no credentials are configured, the API routes automatically fall back to in-memory **mock data**, so the app runs out of the box for local development.

## Features

### Public gallery (`/`)
- Responsive masonry layout (1–4 columns)
- Lightbox viewer with previous/next navigation
- Lazy-loaded images
- Login / Dashboard shortcut in the header

### Admin dashboard (`/dashboard`)
- **Overview** — total / active / recycled image counts
- **Gallery** — browse, filter by category, rename images, add/remove tags, change category, delete
- **Upload** — drag & drop or click to upload files (imgBB), or add images by URL
- **Recycle Bin** — soft-deleted images with restore and "empty bin"
- **Settings** — manage custom categories

### Data layer
- Metadata (images, categories) saved to a GitHub repo as `data.json`
- Debounced (500 ms) batched saves to avoid API spam
- Automatic mock-data mode when GitHub/imgBB credentials are missing or invalid
- Soft-delete pattern (`deleted` + `deletedAt`) with restore support

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS v4, Mantine UI v7 (dark scheme) |
| Language | TypeScript (strict mode) |
| Image hosting | imgBB API |
| Metadata storage | GitHub Contents API (`data.json`) |

## Getting Started

### Prerequisites
- Node.js 18.17+
- npm

### Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000. The admin dashboard is at `/dashboard` (default PIN: ``).

### Production build

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file in the project root. **All variables are optional** — if they are missing or invalid, the app automatically runs in mock-data mode.

```env
# GitHub repo used as the database (stores data.json)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx   # token with "repo" scope
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo-name

# imgBB image hosting
IMGBB_KEY=your_imgbb_api_key
```

### Mock data mode

When `GITHUB_TOKEN` / `IMGBB_KEY` are not configured (or the GitHub credentials are rejected), the API routes behave like this:

- `GET /api/data` — returns the built-in mock dataset (the images in `public/images`)
- `POST /api/data` — accepts and stores updates in an in-memory store (resets on server restart)
- `POST /api/upload` — echoes the uploaded image back as a data URL so uploads still render

This makes local development work without any external accounts.

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/data` | GET | Load gallery data (images + categories) |
| `/api/data` | POST | Save gallery data (debounced from the client) |
| `/api/upload` | POST | Upload a base64 image to imgBB, returns the hosted URL |

## Project Structure

```
app/
  api/data/route.ts     # GET/POST gallery data (GitHub or mock store)
  api/upload/route.ts   # Image upload (imgBB or mock echo)
  dashboard/page.tsx    # Admin dashboard route (auth-guarded client side)
  login/page.tsx        # PIN login route
  layout.tsx            # Root layout (Tailwind + Mantine styles)
  providers.tsx         # MantineProvider + Auth + Image contexts
  page.tsx              # Public gallery route
components/
  Gallery.tsx           # Public masonry gallery + lightbox
  Dashboard.tsx         # Admin panel (overview, gallery, upload, recycle bin, settings)
  Login.tsx             # PIN login form
  AuthContext.tsx       # Client-side auth state (localStorage)
  ImageContext.tsx      # Image state, mutations, debounced persistence
lib/
  github.ts             # GitHub Contents API read/write helpers
  images.ts             # Types, seed image list, helpers
  mockdata.ts           # In-memory mock store for API fallback
public/
  images/               # Seed images served statically
```

## Notes & Known Limitations

- **Auth is client-side only** (PIN checked in the browser, session kept in `localStorage`). This is fine for a personal/demo project but not production-grade — move the PIN check to a server route + HTTP-only cookie before exposing publicly.
- **The API routes are unauthenticated** — anyone who can reach the server can call them. Add middleware protection for public deployments.
- GitHub-as-database is rate-limited (5,000 requests/hour) and does not support concurrent writers; rapid edits from multiple tabs can conflict (409).

## License

Private personal project.
