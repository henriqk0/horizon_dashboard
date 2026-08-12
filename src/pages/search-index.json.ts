// Build-time search index. Astro emits this as /search-index.json (under the
// site base). It ships only the fields needed to search and render result
// cards — never the 20 MB canonical files — so the home search stays fully
// client-side on GitHub Pages (no backend).

import researchers from "../data/researchers_canonical.json";
import students from "../data/students_canonical.json";
import groups from "../data/research_groups_canonical.json";
import initiatives from "../data/initiatives_canonical.json";
import articles from "../data/articles_canonical.json";
import impact from "../data/researcher_impact.json";
import { normalizeSearchText } from "../lib/search";

export const prerender = true;

type Entry = Record<string, unknown>;

// FWCI / impact lookups (OpenAlex-derived, ~93 docentes). Joined by Lattes id
// (extracted from cnpq_url) first, then by normalized name.
const impactByLattes = new Map<string, { fwci: number; h: number }>();
const impactByName = new Map<string, { fwci: number; h: number }>();
for (const d of impact as any[]) {
    const rec = { fwci: Number(d.fwci) || 0, h: Number(d.h) || 0 };
    if (d.lattes_id) impactByLattes.set(String(d.lattes_id), rec);
    if (d.nome) impactByName.set(normalizeSearchText(d.nome), rec);
}

const lattesIdFromUrl = (url: unknown): string | null => {
    const m = String(url ?? "").match(/(\d{16})/);
    return m ? m[1] : null;
};

const names = (list: any): string[] =>
    Array.isArray(list)
        ? list.map((x) => x?.name).filter((n): n is string => Boolean(n))
        : [];

function personEntry(p: any, type: "pesquisador" | "aluno"): Entry {
    const areas = names(p.knowledge_areas).slice(0, 6);
    const grp = names(p.research_groups).slice(0, 4);
    const lattesId = lattesIdFromUrl(p.cnpq_url);
    const imp =
        (lattesId && impactByLattes.get(lattesId)) ||
        impactByName.get(normalizeSearchText(p.name ?? "")) ||
        null;
    const entry: Entry = {
        i: String(p.id),
        t: type,
        n: p.name ?? "",
        c: p.campus?.name ?? null,
        a: areas,
        g: grp,
        na: Array.isArray(p.articles) ? p.articles.length : 0,
        ni: Array.isArray(p.initiatives) ? p.initiatives.length : 0,
    };
    if (imp && imp.fwci > 0) {
        entry.f = imp.fwci;
        entry.h = imp.h;
    }
    return entry;
}

function groupEntry(g: any): Entry {
    return {
        i: String(g.id),
        t: "grupo",
        n: g.name?.trim() ?? "",
        c: g.campus?.name ?? null,
        a: names(g.knowledge_areas).slice(0, 8),
        l: names(g.leaders).slice(0, 3),
        nm: Array.isArray(g.members) ? g.members.length : 0,
    };
}

function initiativeEntry(i: any): Entry {
    return {
        i: String(i.id),
        t: "projeto",
        n: i.name?.trim() ?? "",
        c: i.campus?.name ?? null,
        a: names(i.knowledge_areas).slice(0, 6),
        st: i.status ?? null,
        team: names(i.team).slice(0, 6),
    };
}

function articleEntry(a: any): Entry {
    return {
        i: String(a.id),
        t: "publicacao",
        n: a.title ?? "",
        v: a.journal_conference ?? null,
        y: a.year ?? null,
        pt: a.type ?? null,
    };
}

export function GET() {
    const entries: Entry[] = [
        ...(researchers as any[]).map((p) => personEntry(p, "pesquisador")),
        ...(students as any[]).map((p) => personEntry(p, "aluno")),
        ...(groups as any[]).map(groupEntry),
        ...(initiatives as any[]).map(initiativeEntry),
        ...(articles as any[]).map(articleEntry),
    ];

    return new Response(JSON.stringify(entries), {
        headers: { "content-type": "application/json; charset=utf-8" },
    });
}
