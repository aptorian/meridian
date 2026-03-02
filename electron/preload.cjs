const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  onOAuthCallback: (callback) => {
    ipcRenderer.on("oauth-callback", (_event, url) => callback(url));
  },
});
