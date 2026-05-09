import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function apkHeaders() {
  return {
    name: "apk-download-headers",
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith("/downloads/atlas-palestine.apk")) {
          res.setHeader("Content-Type", "application/vnd.android.package-archive");
          res.setHeader("Content-Disposition", "attachment; filename=\"atlas-palestine.apk\"");
        }
        next();
      });
    },
    configurePreviewServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith("/downloads/atlas-palestine.apk")) {
          res.setHeader("Content-Type", "application/vnd.android.package-archive");
          res.setHeader("Content-Disposition", "attachment; filename=\"atlas-palestine.apk\"");
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apkHeaders()],
  server: {
    port: 5173,
    allowedHosts: ["saeed-1.onrender.com"]
  }
});
