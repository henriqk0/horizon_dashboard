// Impacto bibliométrico por pesquisador (OpenAlex, casado por DOI do Lattes).
// Junta researcher_impact.json ao pesquisador por id Lattes (extraído do
// cnpq_url) e, na falta, por nome normalizado. Mesma estratégia do índice de
// busca (search-index.json.ts).
import impactData from "../data/researcher_impact.json";
import { normalizeSearchText } from "./search";

export interface ResearcherImpact {
    fwci: number;
    h: number;
    cit: number;
}

const byLattes = new Map<string, ResearcherImpact>();
const byName = new Map<string, ResearcherImpact>();

for (const d of impactData as any[]) {
    const rec: ResearcherImpact = {
        fwci: Number(d.fwci) || 0,
        h: Number(d.h) || 0,
        cit: Number(d.cit) || 0,
    };
    if (d.lattes_id) byLattes.set(String(d.lattes_id), rec);
    if (d.nome) byName.set(normalizeSearchText(d.nome), rec);
}

const lattesIdFromUrl = (url?: string | null): string | null => {
    const m = String(url ?? "").match(/(\d{16})/);
    return m ? m[1] : null;
};

/** Retorna o impacto do pesquisador, ou null se não houver dado do OpenAlex. */
export function getResearcherImpact(researcher: {
    cnpq_url?: string | null;
    name?: string;
}): ResearcherImpact | null {
    const id = lattesIdFromUrl(researcher.cnpq_url);
    const rec =
        (id && byLattes.get(id)) ||
        byName.get(normalizeSearchText(researcher.name ?? "")) ||
        null;
    if (!rec) return null;
    return rec.fwci > 0 || rec.h > 0 || rec.cit > 0 ? rec : null;
}

/** Link para o perfil de autor no OpenAlex (busca por nome). */
export function openAlexAuthorUrl(name: string): string {
    return `https://openalex.org/authors?search=${encodeURIComponent(name)}`;
}
