# Errl Studio Upload Server

Demo cloud upload server for Errl Studio (Phase 4: Cloud Sync).

## Setup

```bash
npm install express multer cors --save-dev
```

## Usage

Start the server:

```bash
node server/upload.js
```

Server runs on `http://localhost:5656` with endpoints:
- `GET /health` — Health check
- `POST /upload` — Upload file (multipart/form-data, field: `file`)
- `GET /files/:filename` — Serve uploaded files
- `GET /uploads` — List all uploaded files

## Integration

In browser console on `/studio`:

```js
window.ERRL_CLOUD_ENDPOINT = "http://localhost:5656/upload"
```

Then use the Studio's cloud sync features to upload assets.

## Configuration

- **Port**: Set via `PORT` env var (default: 5656)
- **Upload limit**: 10MB per file
- **Allowed types**: jpg, png, gif, svg, webp, mp4, webm, mp3, wav, json, txt, html, css, js
- **Storage**: Files saved to `server/uploads/` with timestamp prefixes

## Production

This is a **demo server** for local development only. For production:
1. Add authentication/authorization
2. Use S3/Supabase/cloud storage instead of local disk
3. Add rate limiting
4. Implement signed URLs
5. Add virus scanning for uploads
6. Use environment-based CORS config
