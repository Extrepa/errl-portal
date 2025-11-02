#!/usr/bin/env node
// server/upload.js — Demo cloud upload server for Errl Studio
// Phase 4: Cloud Sync (warp_tasks.yaml)
//
// Usage:
//   npm install express multer cors --save-dev
//   node server/upload.js
//
// In browser console on /studio:
//   window.ERRL_CLOUD_ENDPOINT = "http://localhost:5656/upload"

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5656;
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    // Accept common web asset types
    const allowed = /\.(jpe?g|png|gif|svg|webp|mp4|webm|mp3|wav|json|txt|html|css|js)$/i;
    if (allowed.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.originalname}`));
    }
  }
});

// Enable CORS for local dev
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'errl-studio-upload', port: PORT });
});

// Upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const fileUrl = `http://localhost:${PORT}/files/${req.file.filename}`;
  
  console.log(`[UPLOAD] ${req.file.originalname} → ${req.file.filename} (${req.file.size} bytes)`);

  res.json({
    success: true,
    file: {
      name: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      url: fileUrl,
      filename: req.file.filename
    }
  });
});

// Serve uploaded files
app.use('/files', express.static(UPLOADS_DIR));

// List uploads (dev helper)
app.get('/uploads', (req, res) => {
  const files = fs.readdirSync(UPLOADS_DIR).map(filename => {
    const stat = fs.statSync(path.join(UPLOADS_DIR, filename));
    return {
      filename,
      size: stat.size,
      modified: stat.mtime,
      url: `http://localhost:${PORT}/files/${filename}`
    };
  });
  res.json({ count: files.length, files });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🌐 Errl Studio Upload Server`);
  console.log(`   Listening on http://localhost:${PORT}`);
  console.log(`   Uploads dir: ${UPLOADS_DIR}\n`);
  console.log(`Set in browser console:`);
  console.log(`   window.ERRL_CLOUD_ENDPOINT = "http://localhost:${PORT}/upload"\n`);
});
