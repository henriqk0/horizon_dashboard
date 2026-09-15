import { buildSearchIndex } from "./search";
import { getHighestAcademicDegree, type ResearcherStats } from "./researchers-data";
import type { Researcher } from "../types/researchers";

export interface ResearcherCardView {
    id: string;
    name: string;
    initial: string;
    searchIndex: string;
    campusIds: string[];
    campusNames: string[];
    highestDegree: string | null;
    identificationLabel: string | null;
    citationName: string | null;
    knowledgeAreaNames: string[];
    projects: number;
    articles: number;
    advisorships: number;
    advisorshipsTooltip: string;
    isSupervisor: boolean;
    isStudent: boolean;
    cnpqUrl: string | null;
    scholarUrl: string | null;
    profileHref: string;
}

const MAX_VISIBLE_CAMPUSES = 2;
const MAX_VISIBLE_KNOWLEDGE_AREAS = 3;

const escapeHtml = (value: string | number | null | undefined) =>
    String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const renderCampusPills = (campusNames: string[]) => {
    const primaryCampusName = campusNames[0];
    if (!primaryCampusName) {
        return "";
    }

    return `
        <div
            class="flex flex-wrap justify-center gap-2 mb-3 w-full px-4"
            title="${escapeHtml(primaryCampusName)}"
        >
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-premium-accent/8 border border-premium-accent/15 text-[10px] font-bold text-premium-accent leading-none">
                <span class="w-1.5 h-1.5 rounded-full bg-premium-accent shrink-0"></span>
                ${escapeHtml(primaryCampusName)}
            </span>
        </div>
    `;
};

const renderKnowledgeAreaPills = (knowledgeAreaNames: string[]) => {
    const visibleAreas = knowledgeAreaNames.slice(0, MAX_VISIBLE_KNOWLEDGE_AREAS);
    const hiddenAreaCount = Math.max(
        0,
        knowledgeAreaNames.length - visibleAreas.length,
    );

    return `
        <div class="flex flex-wrap justify-center gap-2 mb-4 w-full">
            ${visibleAreas
                .map(
                    (areaName) => `
                        <span class="px-2 py-0.5 rounded-md bg-[var(--tag-bg)] text-[10px] font-bold text-text-secondary border border-border-main truncate max-w-[120px]">
                            ${escapeHtml(areaName)}
                        </span>
                    `,
                )
                .join("")}
            ${
                hiddenAreaCount > 0
                    ? `<span class="px-2 py-0.5 rounded-md bg-[var(--tag-bg)] text-[10px] font-bold text-text-secondary">+${hiddenAreaCount}</span>`
                    : ""
            }
        </div>
    `;
};

const renderExternalLinks = (card: ResearcherCardView) => {
    const links: string[] = [];

    if (card.cnpqUrl) {
        links.push(`
            <a
                href="${escapeHtml(card.cnpqUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir Currículo Lattes de ${escapeHtml(card.name)} em nova aba"
                class="text-text-secondary hover:text-premium-accent transition-colors p-1"
                title="Lattes"
            >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M8.4 1c-.61.03-1.2.09-1.78.2-.57.11-1.13.26-1.67.46-.53.2-1.06.44-1.54.75-.47.32-.95.74-1.33 1.16-.37.43-.69.91-.94 1.4-.24.5-.43 1.01-.53 1.56C.5 7.08.5 7.68.5 8.26c.1.634.17 1.04.28 1.73.32 1.81.68 2.55 1.14 2.77 9.08 1.14 8.28 1.1 8.74.85.15-.25-.49-.99-.73-1.49-.24-.49-.51-.98-.72-1.49-.21-.5-.4-1.02-.54-1.55-.15-.54-.28-1.09-.32-1.65-.05-.55-.1-1.18.05-1.7.15-.53.44-1.07.83-1.44.39-.38.99-.6 1.52-.79.54-.2 1.12-.29 1.72-.36.59-.07 1.23-.06 1.84-.05s1.22.08 1.82.1c.61.02 1.67.12 1.83 0s-.45-.51-.86-.72c-.42-.21-1.09-.37-1.64-.53s-1.11-.3-1.68-.43a21 21 0 0 0-3.52-.48C9.65.99 9.01.97 8.4 1"/><ellipse cx="13.85" cy="8.35" rx="4.35" ry="2.75" transform="rotate(27 13.85 8.35)"/><path d="M18.99 5.53c-.19.41.27 1.07.43 1.62.15.45.47 1.12.47 1.69.01.56-.14 1.19-.42 1.7s-.8.97-1.27 1.34c-.48.38-1.04.65-1.59.9s-1.13.43-1.71.6c-.59.17-1.19.3-1.81.4-.61.11-1.23.18-1.87.23s-1.3.07-1.95.08c-.65 0-1.31-.02-1.95-.05-.64-.04-1.28-.08-1.91-.16-2.46-.4-3.39-.75-3.68-.61C6.19 23 6.09 22.98 6.7 22.89c.3.01 1.76-.27 2.37-.4.6-.13 1.2-.26 1.8-.41a35 35 0 0 0 3.48-1.07c.57-.2 1.14-.41 1.69-.66a21 21 0 0 0 3.17-1.79c.51-.35 1.02-.72 1.48-1.14.45-.43.88-.91 1.24-1.39s.68-.98.93-1.51c.24-.53.44-1.08.53-1.66s.1-1.25 0-1.83c-.09-.58-.3-1.13-.56-1.65-.26-.53-.61-1.01-1-1.49-.38-.47-.83-.96-1.3-1.36-.48-.39-1.36-1.1-1.54-1"/></svg>
            </a>
        `);
    }

    if (card.scholarUrl) {
        links.push(`
            <a
                href="${escapeHtml(card.scholarUrl)}"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Abrir Google Scholar de ${escapeHtml(card.name)} em nova aba"
                class="text-text-secondary hover:text-premium-purple transition-colors p-1"
                title="Google Scholar"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
            </a>
        `);
    }

    return links.join("");
};

export const buildResearcherCardView = ({
    researcher,
    stats,
    baseUrl,
    campusIds = [],
    campusNames = [],
    profileHref = `${baseUrl}${researcher.classification === "student" ? "students" : "researchers"}/${researcher.id}`,
}: {
    researcher: Researcher;
    stats: ResearcherStats;
    baseUrl: string;
    campusIds?: string[];
    campusNames?: string[];
    profileHref?: string;
}): ResearcherCardView => ({
    id: String(researcher.id),
    name: researcher.name,
    initial: researcher.name.trim().charAt(0) || "?",
    searchIndex: buildSearchIndex([researcher.name]),
    campusIds: campusIds.slice(0, 1),
    campusNames: campusNames.slice(0, 1),
    highestDegree: getHighestAcademicDegree(researcher.academic_education),
    identificationLabel: researcher.identification_id
        ? `${researcher.identification_id.split("@")[0]}...`
        : null,
    citationName:
        researcher.citation_names && researcher.citation_names !== "None"
            ? researcher.citation_names.split(";")[0]
            : null,
    knowledgeAreaNames: researcher.knowledge_areas.map((area) => area.name),
    projects: stats.projects,
    articles: stats.articles,
    advisorships: stats.advisorships,
    advisorshipsTooltip: Object.entries(stats.advisorshipsByType || {})
        .map(([type, count]) => `${type}: ${count}`)
        .join("\n"),
    isSupervisor: stats.isSupervisor,
    isStudent: stats.isStudent,
    cnpqUrl: researcher.cnpq_url || null,
    scholarUrl:
        researcher.google_scholar_url && researcher.google_scholar_url !== "None"
            ? researcher.google_scholar_url
            : null,
    profileHref,
});

export const renderResearcherCardMarkup = (card: ResearcherCardView) => `
    <article
        class="researcher-card glass-card p-6 hover:border-premium-accent/40 hover:bg-premium-accent/[0.02] transition-all flex flex-col items-center text-center group"
        data-name="${escapeHtml(card.name.toLowerCase())}"
        data-search="${escapeHtml(card.searchIndex)}"
        data-campus-ids="${escapeHtml(card.campusIds.join("|"))}"
    >
        <div
            class="w-24 h-24 rounded-full bg-gradient-to-br from-premium-accent/20 to-premium-purple/20 border-2 border-border-main flex items-center justify-center text-premium-accent font-bold text-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-premium-accent/5"
        >
            ${escapeHtml(card.initial)}
        </div>

        <h3
            class="text-lg font-bold text-text-main mb-1 leading-tight group-hover:text-premium-accent transition-colors"
        >
            ${escapeHtml(card.name)}
        </h3>

        ${
            card.highestDegree
                ? `<p class="text-[10px] font-bold uppercase tracking-wider text-premium-purple bg-premium-purple/5 px-2 py-0.5 rounded-full mb-2">${escapeHtml(card.highestDegree)}</p>`
                : ""
        }

        ${renderCampusPills(card.campusNames)}

        ${
            card.identificationLabel
                ? `
                    <p class="text-xs text-text-secondary mb-4 flex items-center justify-center gap-1.5 opacity-80">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >
                            <rect width="20" height="16" x="2" y="4" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                        ${escapeHtml(card.identificationLabel)}
                    </p>
                `
                : ""
        }

        ${
            card.citationName
                ? `
                    <p
                        class="text-[9px] text-text-secondary italic mb-4 opacity-70 truncate max-w-full px-4"
                        title="${escapeHtml(card.citationName)}"
                    >
                        ${escapeHtml(card.citationName)}
                    </p>
                `
                : ""
        }

        ${renderKnowledgeAreaPills(card.knowledgeAreaNames)}

        <div class="flex items-center gap-4 mb-6">
            <div class="flex flex-col items-center">
                <span class="text-xs font-bold text-text-main">
                    ${card.projects}
                </span>
                <span
                    class="text-[8px] uppercase tracking-wider text-text-secondary font-bold"
                >
                    Projetos
                </span>
            </div>
            <div class="w-px h-6 bg-border-main"></div>
            <div class="flex flex-col items-center">
                <span class="text-xs font-bold text-text-main">
                    ${card.articles}
                </span>
                <span
                    class="text-[8px] uppercase tracking-wider text-text-secondary font-bold"
                >
                    Artigos
                </span>
            </div>
            <div class="w-px h-6 bg-border-main"></div>
            <div
                class="flex flex-col items-center cursor-help"
                title="${escapeHtml(card.advisorshipsTooltip)}"
            >
                <span class="text-xs font-bold text-text-main">
                    ${card.advisorships}
                </span>
                <span
                    class="text-[8px] uppercase tracking-wider text-text-secondary font-bold"
                >
                    Orientações
                </span>
            </div>
            ${
                card.isSupervisor || card.isStudent
                    ? `
                        <div class="w-px h-6 bg-border-main"></div>
                        <div class="flex gap-1">
                            ${
                                card.isSupervisor
                                    ? `
                                        <div
                                            title="Orientador"
                                            class="w-4 h-4 rounded-full bg-premium-accent/10 flex items-center justify-center text-premium-accent"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                class="w-2.5 h-2.5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="3"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            >
                                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                                <circle cx="9" cy="7" r="4" />
                                            </svg>
                                        </div>
                                    `
                                    : ""
                            }
                            ${
                                card.isStudent
                                    ? `
                                        <div
                                            title="Orientando"
                                            class="w-4 h-4 rounded-full bg-premium-purple/10 flex items-center justify-center text-premium-purple"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                class="w-2.5 h-2.5"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                stroke-width="3"
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                            >
                                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                            </svg>
                                        </div>
                                    `
                                    : ""
                            }
                        </div>
                    `
                    : ""
            }
        </div>

        <div
            class="mt-auto pt-4 border-t border-border-main w-full flex flex-col gap-3"
        >
            <div class="flex justify-between items-center w-full">
                <div class="flex gap-2">
                    ${renderExternalLinks(card)}
                </div>
            </div>
            <a
                href="${escapeHtml(card.profileHref)}"
                class="text-xs font-bold text-premium-accent flex items-center justify-center gap-1 hover:translate-x-1 transition-transform focus:ring-2 focus:ring-premium-accent rounded py-2 border border-premium-accent/20 hover:bg-premium-accent/5"
            >
                Ver perfil completo
                <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                </svg>
            </a>
        </div>
    </article>
`;
