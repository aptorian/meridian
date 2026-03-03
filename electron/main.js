import { app, BrowserWindow, Menu, screen, shell, ipcMain } from "electron";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import https from "https";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

// --- Window state persistence ---
const stateFile = path.join(app.getPath("userData"), "window-state.json");

function loadWindowState() {
  try {
    if (fs.existsSync(stateFile)) {
      return JSON.parse(fs.readFileSync(stateFile, "utf-8"));
    }
  } catch {
    // ignore corrupt state
  }
  return null;
}

function saveWindowState(win) {
  if (!win || win.isDestroyed()) return;
  const bounds = win.getBounds();
  const state = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    isMaximized: win.isMaximized(),
  };
  try {
    fs.writeFileSync(stateFile, JSON.stringify(state));
  } catch {
    // ignore write errors
  }
}

function getValidatedState() {
  const saved = loadWindowState();
  if (!saved) return null;

  // Make sure the saved position is still on a visible display
  const displays = screen.getAllDisplays();
  const visible = displays.some((d) => {
    const { x, y, width, height } = d.workArea;
    return (
      saved.x >= x - 100 &&
      saved.x < x + width &&
      saved.y >= y - 100 &&
      saved.y < y + height
    );
  });

  return visible ? saved : null;
}

// --- Single instance lock (required for Windows deep links) ---
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (_event, commandLine) => {
    // Windows sends the deep link URL as a command-line argument
    const url = commandLine.find((arg) => arg.startsWith("meridian://"));
    if (url) handleDeepLink(url);
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// --- Deep link protocol for OAuth callback ---
const PROTOCOL = "meridian";
if (process.defaultApp) {
  // Dev: register with the path to electron
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [
      path.resolve(process.argv[1]),
    ]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

// Handle deep link on macOS (app already running)
app.on("open-url", (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

function handleDeepLink(url) {
  if (!mainWindow) return;
  // Forward the full deep link URL to the renderer so it can extract tokens
  mainWindow.webContents.send("oauth-callback", url);
  mainWindow.focus();
}

// --- App setup ---
// Remove default application menu
Menu.setApplicationMenu(null);

let mainWindow;

function createWindow() {
  const saved = getValidatedState();
  const defaults = { width: 1200, height: 750 };

  mainWindow = new BrowserWindow({
    width: saved?.width ?? defaults.width,
    height: saved?.height ?? defaults.height,
    x: saved?.x,
    y: saved?.y,
    minWidth: 220,
    minHeight: 160,
    frame: false,
    titleBarStyle: "hidden",
    trafficLightPosition: { x: 16, y: 12 },
    backgroundColor: "#1a1a1e",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (saved?.isMaximized) {
    mainWindow.maximize();
  }

  // Load the app
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  // Open OAuth and other external URLs in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http")) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  // Intercept all frame navigations away from the app
  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (url.startsWith("http://localhost") || url.startsWith("file://")) return;
    event.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.webContents.on("will-frame-navigate", (details) => {
    const url = details.url;
    if (url.startsWith("http://localhost") || url.startsWith("file://")) return;
    details.preventDefault();
    shell.openExternal(url);
  });

  // Show when ready to avoid flash, then check for updates
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (!isDev) checkForUpdates();
  });

  // Save state on move/resize (debounced)
  let saveTimeout;
  const debouncedSave = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => saveWindowState(mainWindow), 300);
  };
  mainWindow.on("resize", debouncedSave);
  mainWindow.on("move", debouncedSave);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// --- Update check ---
function checkForUpdates() {
  const currentVersion = app.getVersion();
  const req = https.get(
    "https://api.github.com/repos/aptorian/meridian/releases/latest",
    { headers: { "User-Agent": "Meridian-Electron" } },
    (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const release = JSON.parse(data);
          const latest = (release.tag_name || "").replace(/^v/, "");
          if (latest && latest !== currentVersion && isNewer(latest, currentVersion)) {
            mainWindow?.webContents.send("update-available", {
              version: latest,
              url: release.html_url,
            });
          }
        } catch {
          // ignore parse errors
        }
      });
    }
  );
  req.on("error", () => {}); // ignore network errors
}

function isNewer(latest, current) {
  const a = latest.split(".").map(Number);
  const b = current.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) > (b[i] || 0)) return true;
    if ((a[i] || 0) < (b[i] || 0)) return false;
  }
  return false;
}

// --- IPC handlers for custom window controls (Windows) ---
ipcMain.on("window-minimize", () => {
  if (mainWindow) mainWindow.minimize();
});
ipcMain.on("window-maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
  }
});
ipcMain.on("window-close", () => {
  if (mainWindow) mainWindow.close();
});
ipcMain.handle("window-is-maximized", () => {
  return mainWindow ? mainWindow.isMaximized() : false;
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});

app.on("before-quit", () => {
  if (mainWindow) saveWindowState(mainWindow);
});

app.on("activate", () => {
  if (!mainWindow) createWindow();
});
