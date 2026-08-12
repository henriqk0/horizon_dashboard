// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// Base e site configuráveis por ambiente.
// - GitHub Pages (padrão): serve em /horizon_dashboard/.
// - Raiz (Vercel/Netlify/Cloudflare/Render): defina SITE_BASE=/ e, se quiser,
//   SITE_URL=https://seu-subdominio (para OG/canonical corretos).
const SITE_BASE = process.env.SITE_BASE || '/horizon_dashboard/';
const SITE_URL = process.env.SITE_URL || 'https://ifesserra-lab.github.io';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  base: SITE_BASE,
  vite: {
    plugins: [tailwindcss()]
  }
});
