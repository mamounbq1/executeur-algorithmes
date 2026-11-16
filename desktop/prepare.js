// Copie la page de l'application dans desktop/app et y intègre les polices (fonctionne hors ligne).
const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "..", "Exécuteur d'algorithme.html");
const OUT = path.join(__dirname, "app");
const FONTS = path.join(OUT, "fonts");
const FONT_URL = "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function fonts() {
  const css = path.join(FONTS, "fonts.css");
  if (fs.existsSync(css)) return true;
  fs.mkdirSync(FONTS, { recursive: true });
  try {
    let text = await (await fetch(FONT_URL, { headers: { "User-Agent": UA } })).text();
    // ne garder que les alphabets latins
    const blocks = text.split(/(?=\/\* )/).filter(b => /^\/\* latin(-ext)? \*\//.test(b));
    let n = 0, outCss = "";
    for (const b of blocks) {
      const m = b.match(/url\((https:[^)]+\.woff2)\)/);
      if (!m) continue;
      const file = "f" + (n++) + ".woff2";
      const buf = Buffer.from(await (await fetch(m[1])).arrayBuffer());
      fs.writeFileSync(path.join(FONTS, file), buf);
      outCss += b.replace(m[1], file);
    }
    if (n < 12) throw new Error("polices incomplètes (" + n + ")");
    fs.writeFileSync(css, outCss);
    console.log("Polices intégrées :", n, "fichiers");
    return true;
  } catch (e) {
    console.warn("Polices non téléchargées (pas de connexion ?) : les polices du système seront utilisées.");
    return false;
  }
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let html = fs.readFileSync(SRC, "utf8");
  const ok = await fonts();
  html = html.replace(/<link rel="preconnect"[^>]*>\s*/g, "")
             .replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>/, ok ? '<link rel="stylesheet" href="fonts/fonts.css">' : "");
  // politique de sécurité : rien n'est chargé depuis Internet
  html = html.replace("<head>", '<head>\n<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; font-src \'self\' data:; img-src \'self\' data:">');
  fs.writeFileSync(path.join(OUT, "index.html"), html);
  const icon = path.join(__dirname, "build", "icon.png");
  if (fs.existsSync(icon)) fs.copyFileSync(icon, path.join(OUT, "icon.png"));
  console.log("Application prête dans", OUT);
})();
