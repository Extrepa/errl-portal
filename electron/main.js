import { app, BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname } from 'node:path';
import { lookup } from 'mime-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let localServer = null;

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
    },
    backgroundColor: '#0b0f18',
    show: false, // Don't show until ready
  });

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Load the app
  loadApp();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function loadApp() {
  if (isDev) {
    // In dev mode, load from Vite dev server
    // Assume Vite dev server runs on default port 5173
    const vitePort = process.env.VITE_PORT || '5173';
    const url = `http://localhost:${vitePort}/`;
    console.log(`[Electron] Loading from Vite dev server: ${url}`);
    console.log(`[Electron] Make sure Vite dev server is running: npm run portal:dev`);
    
    // Wait a bit for Vite server to be ready
    let attempts = 0;
    const maxAttempts = 30;
    const checkAndLoad = () => {
      mainWindow.loadURL(url).then(() => {
        console.log('[Electron] Successfully loaded from Vite dev server');
      }).catch((err) => {
        attempts++;
        if (attempts < maxAttempts) {
          console.log(`[Electron] Waiting for Vite server... (${attempts}/${maxAttempts})`);
          setTimeout(checkAndLoad, 1000);
        } else {
          console.error('[Electron] Failed to connect to Vite dev server after', maxAttempts, 'attempts');
          console.log('[Electron] Starting Vite dev server automatically...');
          // Try loading from dist as fallback
          const distPath = join(__dirname, '../dist/index.html');
          if (existsSync(distPath)) {
            mainWindow.loadFile(distPath).catch(() => {
              mainWindow.loadURL('data:text/html,<h1 style="padding:20px;font-family:sans-serif;">Please start the Vite dev server:<br/><br/><code>npm run portal:dev</code></h1>');
            });
          } else {
            mainWindow.loadURL('data:text/html,<h1 style="padding:20px;font-family:sans-serif;">Please start the Vite dev server:<br/><br/><code>npm run portal:dev</code></h1>');
          }
        }
      });
    };
    checkAndLoad();
  } else {
    // In production, serve dist folder via local HTTP server
    // This handles the /errl-portal/ base path from Vite builds
    const distPath = join(__dirname, '../dist');
    if (existsSync(distPath)) {
      startLocalServer(distPath).then((port) => {
        const url = `http://localhost:${port}/errl-portal/`;
        console.log('[Electron] Loading from local server:', url);
        mainWindow.loadURL(url).catch((err) => {
          console.error('[Electron] Failed to load from local server:', err);
        });
      }).catch((err) => {
        console.error('[Electron] Failed to start local server:', err);
        mainWindow.loadURL('data:text/html,<h1 style="padding:20px;font-family:sans-serif;">Failed to start preview server.</h1>');
      });
    } else {
      console.error('[Electron] dist folder not found. Run: npm run build');
      mainWindow.loadURL('data:text/html,<h1 style="padding:20px;font-family:sans-serif;">Build not found.<br/><br/>Run: <code>npm run build</code></h1>');
    }
  }
}

function startLocalServer(distPath) {
  return new Promise((resolve, reject) => {
    if (localServer) {
      // Server already running, reuse it
      const port = localServer.address()?.port;
      if (port) {
        resolve(port);
        return;
      }
    }

    const port = 5174; // Use different port than Vite dev server
    localServer = createServer((req, res) => {
      let filePath = req.url || '/';
      
      // Remove query string and hash
      filePath = filePath.split('?')[0].split('#')[0];
      
      // Handle base path
      if (filePath.startsWith('/errl-portal/')) {
        filePath = filePath.replace('/errl-portal/', '/');
      } else if (filePath === '/errl-portal') {
        filePath = '/';
      }
      
      // Default to index.html for root or paths without extension
      if (filePath === '/' || filePath === '') {
        filePath = '/index.html';
      } else if (!extname(filePath)) {
        // Path without extension, try adding .html
        const htmlPath = join(distPath, filePath + '.html');
        if (existsSync(htmlPath)) {
          filePath = filePath + '.html';
        } else if (!existsSync(join(distPath, filePath))) {
          // Doesn't exist, try index.html in that directory
          filePath = join(filePath, 'index.html').replace(/\\/g, '/');
        }
      }

      const fullPath = join(distPath, filePath);
      
      // Security: prevent directory traversal
      if (!fullPath.startsWith(distPath)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }

      if (existsSync(fullPath)) {
        try {
          const content = readFileSync(fullPath);
          const mimeType = lookup(fullPath) || 'application/octet-stream';
          res.writeHead(200, { 'Content-Type': mimeType });
          res.end(content);
        } catch (err) {
          console.error('[Electron] Error reading file:', fullPath, err);
          res.writeHead(500);
          res.end('Internal Server Error');
        }
      } else {
        // Try index.html for SPA fallback
        const indexPath = join(distPath, 'index.html');
        if (existsSync(indexPath) && filePath.endsWith('.html')) {
          const content = readFileSync(indexPath);
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content);
        } else {
          res.writeHead(404);
          res.end('Not Found');
        }
      }
    });

    localServer.listen(port, () => {
      console.log(`[Electron] Local server started on port ${port}`);
      resolve(port);
    });

    localServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        // Port in use, try next port
        const nextPort = port + 1;
        localServer.listen(nextPort, () => {
          console.log(`[Electron] Local server started on port ${nextPort}`);
          resolve(nextPort);
        });
      } else {
        reject(err);
      }
    });
  });
}


app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (localServer) {
    localServer.close();
    localServer = null;
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (localServer) {
    localServer.close();
    localServer = null;
  }
});

// Handle protocol errors gracefully
app.on('web-contents-created', (_, contents) => {
  contents.on('did-fail-load', (_, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -3) { // ABORTED
      console.warn('[Electron] Load aborted:', validatedURL);
    } else {
      console.error('[Electron] Failed to load:', errorCode, errorDescription, validatedURL);
    }
  });
});

