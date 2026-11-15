// macOS : signature « ad hoc » de l'application.
// Sans certificat Apple, les Mac à puce Apple (M1, M2…) refusent de lancer une application
// qui n'est pas signée du tout ; une signature ad hoc suffit pour l'ouvrir avec
// « Ouvrir quand même » dans Réglages Système → Confidentialité et sécurité.
const { execFileSync } = require("child_process");
const path = require("path");

exports.default = async function (ctx) {
  if (ctx.electronPlatformName !== "darwin") return;
  const app = path.join(ctx.appOutDir, ctx.packager.appInfo.productFilename + ".app");
  execFileSync("codesign", ["--force", "--deep", "--sign", "-", app], { stdio: "inherit" });
};
