# Nuzio AI

Nuzio creates personalized audio news briefings from current Google News RSS
headlines, Gemini summaries, and Edge neural TTS. Audio is stored in MongoDB
GridFS and streamed with HTTP range support.

## Architecture

- `client`: React 18, Vite, Tailwind, React Query, and Google Identity Services.
- `server`: Node 18+, Express, MongoDB/Mongoose, Gemini, Google News RSS, and `msedge-tts`.
- Authentication: Google ID token exchanged for an HTTP-only JWT cookie.
- Billing: not implemented; the subscription endpoint reports the static free plan.

## Requirements

- Node.js 18.17 or newer
- MongoDB locally or MongoDB Atlas
- Google OAuth web client ID
- Gemini API key

## Local Setup

1. Install dependencies:

   ```powershell
   cd server
   npm ci
   cd ../client
   npm ci
   ```

2. Create environment files:

   ```powershell
   Copy-Item server/.env.example server/.env
   Copy-Item client/.env.example client/.env
   ```

3. Set these values:

   `server/.env`
   - `MONGODB_URI`
   - `GOOGLE_CLIENT_ID`
   - `JWT_SECRET`
   - `AI_API_KEY`
   - `CLIENT_URL=http://localhost:5173`

   `client/.env`
   - `VITE_GOOGLE_CLIENT_ID` matching the server client ID
   - Leave `VITE_API_URL` empty for local development; Vite proxies `/api` to port 5000.

4. Add `http://localhost:5173` to the Google OAuth web client's authorized
   JavaScript origins.

5. Start both processes:

   ```powershell
   # terminal 1
   cd server
   npm run dev

   # terminal 2
   cd client
   npm run dev
   ```

   Open <http://localhost:5173>.

## Production Deployment

Deploy the server and client as separate services, or serve the built client
from the hosting provider's static site service.

### Server

```bash
cd server
npm ci --omit=dev
npm start
```

Set `NODE_ENV=production`, a strong random `JWT_SECRET`, and production values
for `MONGODB_URI`, `GOOGLE_CLIENT_ID`, `AI_API_KEY`, and `CLIENT_URL`. The
server listens on `PORT` and exposes `GET /health` for health checks.

### Client

Set `VITE_API_URL` to the deployed API origin ending in `/api/v1`, for example:

```text
VITE_API_URL=https://api.example.com/api/v1
VITE_GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
```

Build and serve the static output:

```bash
cd client
npm ci
npm run build
npm run preview
```

Configure the static host with SPA fallback to `index.html`, and add the
production client origin to the Google OAuth authorized JavaScript origins. Set
the API's `CLIENT_URL` to that same origin. HTTPS is required in production
because the session cookie is marked `Secure`.

## API and Health Check

The API is mounted at `/api/v1`.

```text
GET  /health
POST /api/v1/auth/google
GET  /api/v1/auth/me
GET  /api/v1/news
GET  /api/v1/news/categories
GET  /api/v1/briefings/today
POST /api/v1/briefings/generate
GET  /api/v1/audio/:fileId
```

Most routes require the authenticated JWT cookie. Use `/health` for platform
health checks; it does not require authentication.

## Operational Notes

- Google News RSS is the active news provider and is throttled between requests.
- Gemini model names default to evergreen aliases and can be overridden with
  `AI_MODEL` and `AI_FALLBACK_MODEL`.
- MongoDB stores article metadata, users, briefings, notifications, and audio.
- The scheduler checks every five minutes for users whose local briefing time is due.
- `npm run check` runs the remaining static identifier check in the server.
