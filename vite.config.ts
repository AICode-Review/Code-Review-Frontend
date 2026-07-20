import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/testSetup.ts"],
    // Vite loads .env regardless of command — this repo's frontend/.env has real Supabase
    // credentials for local dev, which would otherwise flip DEMO_MODE (lib/demo.ts) to
    // false during tests and send real network/Realtime-websocket calls from jsdom.
    // Force these empty here so `npm test` always exercises the demo-fixture code path,
    // independent of whatever's in the developer's local .env.
    env: { VITE_SUPABASE_URL: "", VITE_SUPABASE_ANON_KEY: "" },
  },
});
