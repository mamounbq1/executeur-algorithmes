// Exécuteur d'algorithmes — version de bureau (Electron)
const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require("electron");
const path = require("path");
const fs = require("fs");

const APP_NAME = "Exécuteur d'algorithmes";
const SITE = "https://mamounbq1.github.io/executeur-algorithmes/";
let win = null;

// Un fichier .algo passé en argument (double-clic dans l'Explorateur)
function fileArg(argv) {
  return argv.slice(1).find(a => /\.(algo|txt)$/i.test(a) && fs.existsSync(a)) || null;
}
let pending = fileArg(process.argv);

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on("second-instance", (_e, argv) => {
    const f = fileArg(argv);
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
      if (f) sendFile(f);
    }
  });
  app.whenReady().then(createWindow);
  app.on("window-all-closed", () => app.quit());
}

function sendFile(p) {
  try {
    const text = fs.readFileSync(p, "utf8");
    win.webContents.send("open-file", { path: p, text });
  } catch (e) {
    dialog.showErrorBox(APP_NAME, "Impossible de lire le fichier :\n" + p);
  }
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    title: APP_NAME,
    icon: path.join(__dirname, "app", "icon.png"),
    backgroundColor: "#f1f5f4",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });
  win.on("page-title-updated", e => e.preventDefault());
  win.once("ready-to-show", () => { win.maximize(); win.show(); });
  win.webContents.on("did-finish-load", () => { if (pending) { sendFile(pending); pending = null; } });
  // Aucun lien ne doit ouvrir une fenêtre dans l'application
  win.webContents.setWindowOpenHandler(({ url }) => { if (/^https?:/.test(url)) shell.openExternal(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", e => e.preventDefault());
  win.loadFile(path.join(__dirname, "app", "index.html"));
  buildMenu();
}

const send = cmd => () => win && win.webContents.send("menu", cmd);

function buildMenu() {
  const tpl = [
    { label: "Fichier", submenu: [
      { label: "Nouveau", accelerator: "CmdOrCtrl+N", click: send("new") },
      { label: "Ouvrir…", accelerator: "CmdOrCtrl+O", registerAccelerator: false, click: send("open") },
      { type: "separator" },
      { label: "Enregistrer", accelerator: "CmdOrCtrl+S", registerAccelerator: false, click: send("save") },
      { label: "Enregistrer sous…", accelerator: "CmdOrCtrl+Shift+S", registerAccelerator: false, click: send("saveas") },
      { type: "separator" },
      { label: "Quitter", role: "quit" }
    ]},
    { label: "Édition", submenu: [
      { label: "Annuler", role: "undo" }, { label: "Rétablir", role: "redo" }, { type: "separator" },
      { label: "Couper", role: "cut" }, { label: "Copier", role: "copy" }, { label: "Coller", role: "paste" },
      { label: "Tout sélectionner", role: "selectAll" }
    ]},
    { label: "Exécution", submenu: [
      { label: "Exécuter", accelerator: "F5", click: send("run") },
      { label: "Pas à pas / Instruction suivante", accelerator: "F10", click: send("step") },
      { label: "Arrêter", accelerator: "Shift+F5", click: send("stop") }
    ]},
    { label: "Affichage", submenu: [
      { label: "Plein écran", role: "togglefullscreen" },
      { label: "Recharger", role: "reload" }
    ]},
    { label: "Aide", submenu: [
      { label: "Site web", click: () => shell.openExternal(SITE) },
      { label: "À propos", click: () => dialog.showMessageBox(win, {
        type: "info", title: "À propos", message: APP_NAME,
        detail: "Version " + app.getVersion() + "\nÉcrire, exécuter pas à pas et visualiser des algorithmes en français." }) }
    ]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));
}

// ----- Ouvrir / Enregistrer avec les boîtes de dialogue Windows -----
ipcMain.handle("open-file-dialog", async () => {
  const r = await dialog.showOpenDialog(win, {
    title: "Ouvrir un algorithme",
    filters: [{ name: "Algorithmes", extensions: ["algo", "txt"] }, { name: "Tous les fichiers", extensions: ["*"] }],
    properties: ["openFile"]
  });
  if (r.canceled || !r.filePaths[0]) return null;
  const p = r.filePaths[0];
  return { path: p, text: fs.readFileSync(p, "utf8") };
});

ipcMain.handle("save-file", async (_e, { path: p, name, text }) => {
  if (!p) {
    const r = await dialog.showSaveDialog(win, {
      title: "Enregistrer l'algorithme",
      defaultPath: path.join(app.getPath("documents"), String(name || "algorithme.algo")),
      filters: [{ name: "Algorithme", extensions: ["algo"] }]
    });
    if (r.canceled || !r.filePath) return null;
    p = r.filePath;
  }
  fs.writeFileSync(p, String(text), "utf8");
  return p;
});

ipcMain.on("set-title", (_e, name) => {
  if (win) win.setTitle(name ? name + " — " + APP_NAME : APP_NAME);
});
