// Pont sécurisé entre la page et Windows (aucun accès direct au disque depuis la page)
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  openFile: () => ipcRenderer.invoke("open-file-dialog"),
  saveFile: opts => ipcRenderer.invoke("save-file", opts),
  fontCss: () => ipcRenderer.invoke("font-css"),
  saveImage: opts => ipcRenderer.invoke("save-image", opts),
  setTitle: name => ipcRenderer.send("set-title", String(name || "")),
  onOpenFile: cb => ipcRenderer.on("open-file", (_e, r) => cb(r)),
  onMenu: cb => ipcRenderer.on("menu", (_e, cmd) => cb(cmd)),
  track: body => ipcRenderer.send("track", body)
});
