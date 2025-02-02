import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    headers: {
      "Content-Security-Policy": `
        default-src 'self' https: http:;
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://accounts.google.com;
        style-src 'self' 'unsafe-inline';
        frame-src 'self' https://accounts.google.com https://www.google.com;
        connect-src 'self' https://event-backend-eqg9.onrender.com https://accounts.google.com https://www.googleapis.com;
        img-src 'self' https: data: blob:;
        worker-src 'self' blob:;
      `.replace(/\s+/g, " "),
    },
  },
});
