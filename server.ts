import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Support for both ESM and CJS
const getDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return typeof __dirname !== 'undefined' ? __dirname : process.cwd();
  }
};

const _dirname = getDirname();

async function startServer() {
  try {
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Use Vite middleware for development
    if (process.env.NODE_ENV !== "production") {
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.join(_dirname, 'dist');
      console.log(`[Production] Serving static files from: ${distPath}`);
      app.use(express.static(distPath));
      app.get('*all', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
