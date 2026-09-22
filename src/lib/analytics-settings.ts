/**
 * Configurações de analytics do Horizon (Google Analytics 4 + Microsoft Clarity).
 *
 * Mesmo padrão de `USERWAY_ACCOUNT_ID` (src/lib/accessibility-settings.ts): os
 * identificadores são públicos por natureza (aparecem no HTML servido ao
 * navegador, no `src` do script), por isso ficam fixos no código — sem variável
 * de ambiente. Enquanto estiverem vazios, os snippets não são emitidos no
 * `<head>` de `Layout.astro`.
 */

/** Measurement ID do Google Analytics 4 ("G-XXXXXXX"). Público, fixo no código. */
export const GA_MEASUREMENT_ID = "G-BYDLS0RB6G";

/** Project ID do Microsoft Clarity (UUID curto). Público, fixo no código. */
export const CLARITY_PROJECT_ID = "ymeuq169it";