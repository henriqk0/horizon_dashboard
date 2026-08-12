// Builds per-researcher lookup maps for the Lattes-derived datasets that are
// stored as separate canonical files (awards, languages/proficiencies,
// professional activities, technical/artistic productions). Everything is
// keyed by the researcher id as a string so the researcher detail page can
// render each block without shipping the raw files to the client.

import awardsData from "../data/awards_canonical.json";
import languagesData from "../data/languages_canonical.json";
import proficienciesData from "../data/proficiencies_canonical.json";
import professionalActivitiesData from "../data/professional_activities_canonical.json";
import researchProductionsData from "../data/research_productions_canonical.json";
import productionTypesData from "../data/production_types_canonical.json";
import productionAuthorsData from "../data/production_authors_canonical.json";

export interface ResearcherAward {
    title: string;
    year: number | null;
}

export interface ResearcherProficiency {
    language: string;
    comprehension: string | null;
    speaking: string | null;
    reading: string | null;
    writing: string | null;
}

export interface ResearcherActivity {
    institution: string;
    period: string | null;
    bond: string | null;
    roleFunction: string | null;
    activityType: string | null;
    startYear: number | null;
    endYear: number | null;
    current: boolean;
}

export interface ResearcherProduction {
    title: string;
    year: number | null;
    type: string;
}

const key = (value: unknown): string => String(value);

// A readable label for the raw Lattes production category slug.
const PRODUCTION_TYPE_LABELS: Record<string, string> = {
    softwares_com_patente: "Software (com patente)",
    softwares_sem_patente: "Software",
    produtos_tecnologicos: "Produto tecnológico",
    processos_tecnicas: "Processo ou técnica",
    trabalhos_tecnicos: "Trabalho técnico",
    outras_producoes_tecnicas: "Outra produção técnica",
    entrevistas: "Entrevista / mídia",
    patentes: "Patente",
    programas_computador: "Programa de computador",
    desenhos_industriais: "Desenho industrial",
};

const humanizeType = (slug: string): string =>
    PRODUCTION_TYPE_LABELS[slug] ??
    slug
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());

function groupBy<T>(
    rows: T[],
    getId: (row: T) => string,
): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const row of rows) {
        const id = getId(row);
        const bucket = map.get(id);
        if (bucket) bucket.push(row);
        else map.set(id, [row]);
    }
    return map;
}

// --- awards ---
const awardsByResearcher = groupBy(
    (awardsData as any[]).map((a) => ({
        researcherId: key(a.researcher_id),
        title: String(a.title ?? ""),
        year: a.year ?? null,
    })),
    (a) => a.researcherId,
);

// --- proficiencies (resolve language name) ---
const languageNameById = new Map<string, string>(
    (languagesData as any[]).map((l) => [key(l.id), String(l.name ?? "")]),
);
const proficienciesByResearcher = groupBy(
    (proficienciesData as any[]).map((p) => ({
        researcherId: key(p.researcher_id),
        language: languageNameById.get(key(p.language_id)) ?? "—",
        comprehension: p.comprehension ?? null,
        speaking: p.speaking ?? null,
        reading: p.reading ?? null,
        writing: p.writing ?? null,
    })),
    (p) => p.researcherId,
);

// --- professional activities ---
const activitiesByResearcher = groupBy(
    (professionalActivitiesData as any[]).map((a) => ({
        researcherId: key(a.researcher_id),
        institution: String(a.institution ?? ""),
        period: a.period ?? null,
        bond: a.bond ?? null,
        roleFunction: a.role_function ?? null,
        activityType: a.activity_type ?? null,
        startYear: a.start_year ?? null,
        endYear: a.end_year ?? null,
        current: Boolean(a.current),
    })),
    (a) => a.researcherId,
);

// --- technical/artistic productions (join via production_authors) ---
const productionTypeNameById = new Map<string, string>(
    (productionTypesData as any[]).map((t) => [key(t.id), String(t.name ?? "")]),
);
const productionById = new Map<string, { title: string; year: number | null; type: string }>(
    (researchProductionsData as any[]).map((p) => [
        key(p.id),
        {
            title: String(p.title ?? ""),
            year: p.year ?? null,
            type: humanizeType(productionTypeNameById.get(key(p.production_type_id)) ?? ""),
        },
    ]),
);
const productionsByResearcher = groupBy(
    (productionAuthorsData as any[])
        .map((pa) => ({
            researcherId: key(pa.researcher_id),
            production: productionById.get(key(pa.production_id)),
        }))
        .filter((row) => row.production !== undefined),
    (row) => row.researcherId,
);

const byYearDesc = (a: { year: number | null }, b: { year: number | null }) =>
    (b.year ?? 0) - (a.year ?? 0);

export function getResearcherAwards(researcherId: string | number): ResearcherAward[] {
    return [...(awardsByResearcher.get(key(researcherId)) ?? [])]
        .map((a) => ({ title: a.title, year: a.year }))
        .sort(byYearDesc);
}

export function getResearcherProficiencies(
    researcherId: string | number,
): ResearcherProficiency[] {
    return (proficienciesByResearcher.get(key(researcherId)) ?? []).map((p) => ({
        language: p.language,
        comprehension: p.comprehension,
        speaking: p.speaking,
        reading: p.reading,
        writing: p.writing,
    }));
}

export function getResearcherActivities(
    researcherId: string | number,
): ResearcherActivity[] {
    return [...(activitiesByResearcher.get(key(researcherId)) ?? [])].sort(
        (a, b) => (b.startYear ?? 0) - (a.startYear ?? 0),
    );
}

export function getResearcherProductions(
    researcherId: string | number,
): ResearcherProduction[] {
    return (productionsByResearcher.get(key(researcherId)) ?? [])
        .map((row) => row.production as ResearcherProduction)
        .sort(byYearDesc);
}
