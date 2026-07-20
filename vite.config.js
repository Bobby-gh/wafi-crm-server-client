import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Build de production : les fichiers sont générés dans ../public-app,
// que server.js sert une fois l'utilisateur authentifié.
//
// Développement : `npm run dev` (dans /client) lance Vite sur le port 5173
// et redirige les appels /api/* vers le serveur Express (port 3000, à
export default defineConfig({
  plugins: [react()],
});
