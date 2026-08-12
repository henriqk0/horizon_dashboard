import articlesCanonical from "../data/articles_canonical.json";
import researchersCanonical from "../data/researchers_canonical.json";
import type { Article, Researcher } from "../types/researchers";
import { getRealCampuses } from "./tenant-data";

export interface PublicationAuthor {
    id: string;
    name: string;
}

export interface AggregatedPublication extends Article {
    authors: PublicationAuthor[];
    author_names: string[];
    campus_id: string;
    campus_name: string;
    primary_author: PublicationAuthor | null;
    internal_authors_count: number;
    keywords: string[];
}

export interface PublicationsMart {
    summary: {
        total_publications: number;
        journal_publications: number;
        conference_publications: number;
        unique_researchers: number;
        unique_venues: number;
    };
    type_distribution: Array<{
        label: string;
        value: number;
        color: string;
    }>;
    evolution: Array<{
        year: number;
        count: number;
    }>;
    top_researchers: Array<{
        id: string;
        name: string;
        count: number;
    }>;
    top_venues: Array<{
        name: string;
        count: number;
    }>;
    top_keywords: Array<{
        keyword: string;
        count: number;
    }>;
    top_researchers_by_area: Array<{
        area: string;
        total_publications: number;
        researchers: Array<{
            id: string;
            name: string;
            count: number;
        }>;
    }>;
}

const researchers = researchersCanonical as Researcher[];
const canonicalArticles = articlesCanonical as Article[];
let aggregatedPublicationsCache: AggregatedPublication[] | null = null;
const stopwords = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "by",
    "da",
    "das",
    "de",
    "del",
    "do",
    "dos",
    "e",
    "em",
    "for",
    "from",
    "in",
    "na",
    "no",
    "nos",
    "of",
    "on",
    "para",
    "por",
    "the",
    "to",
    "um",
    "uma",
    "with",
]);

const normalizeType = (type: string) => {
    const normalized = String(type || "").trim().toUpperCase();
    if (normalized === "JOURNAL") return "Journal";
    if (normalized === "CONFERENCE_EVENT") return "Conference Event";
    return type || "Other";
};

const isValidVenue = (venue: string) => {
    const normalized = String(venue || "").trim().toUpperCase();

    if (!normalized) {
        return false;
    }

    return ![
        "PEER REVIEW",
        "AVALIAÇÃO POR PARES",
        "EM AVALIAÇÃO",
        "UNDER REVIEW",
        "REVIEW",
    ].includes(normalized);
};

const articleKey = (article: Article) =>
    String(article.id || `${article.title}-${article.year}-${article.type}`);

const extractKeywords = (article: Article) => {
    const source = `${article.title} ${article.journal_conference || ""}`
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();

    return [...new Set(
        source
            .split(/[^a-z0-9]+/)
            .map((token) => token.trim())
            .filter(
                (token) =>
                    token.length >= 4 &&
                    !stopwords.has(token) &&
                    !/^\d+$/.test(token),
            ),
    )];
};

export const getAggregatedPublications = (): AggregatedPublication[] => {
    if (aggregatedPublicationsCache) {
        return aggregatedPublicationsCache;
    }

    const publicationMap = new Map<string, AggregatedPublication>(
        canonicalArticles.map((article) => [
            articleKey(article),
            {
                ...article,
                type: normalizeType(article.type),
                campus: article.campus
                    ? {
                          id: String(article.campus.id),
                          name: article.campus.name,
                      }
                    : null,
                authors: [],
                author_names: [],
                campus_id: article.campus ? String(article.campus.id) : "",
                campus_name: article.campus?.name || "",
                primary_author: null,
                internal_authors_count: 0,
                keywords: extractKeywords(article),
            },
        ]),
    );

    researchers.forEach((researcher) => {
        (researcher.articles || []).forEach((article) => {
            const key = articleKey(article);
            const existing = publicationMap.get(key);

            if (!existing) {
                publicationMap.set(key, {
                    ...article,
                    type: normalizeType(article.type),
                    campus: article.campus
                        ? {
                              id: String(article.campus.id),
                              name: article.campus.name,
                          }
                        : null,
                    authors: [{ id: String(researcher.id), name: researcher.name }],
                    author_names: [researcher.name],
                    campus_id: article.campus ? String(article.campus.id) : "",
                    campus_name: article.campus?.name || "",
                    primary_author: {
                        id: String(researcher.id),
                        name: researcher.name,
                    },
                    internal_authors_count: 1,
                    keywords: extractKeywords(article),
                });
                return;
            }

            if (
                !existing.authors.some(
                    (author) => author.id === String(researcher.id),
                )
            ) {
                existing.authors.push({
                    id: String(researcher.id),
                    name: researcher.name,
                });
            }

            if (!existing.author_names.includes(researcher.name)) {
                existing.author_names.push(researcher.name);
            }

            existing.primary_author = existing.authors[0] || null;
            existing.internal_authors_count = existing.authors.length;
        });
    });

    publicationMap.forEach((publication) => {
        publication.primary_author = publication.authors[0] || null;
        publication.internal_authors_count = publication.authors.length;
    });

    aggregatedPublicationsCache = [...publicationMap.values()]
        .sort((a, b) => {
            const yearDiff = Number(b.year || 0) - Number(a.year || 0);
            if (yearDiff !== 0) return yearDiff;
            return a.title.localeCompare(b.title);
        });

    return aggregatedPublicationsCache;
};

export const getPublicationsByCampusId = (
    campusId: string,
): AggregatedPublication[] =>
    getAggregatedPublications().filter((publication) =>
        publication.campus_id === String(campusId),
    );

export const buildPublicationsMart = (
    publications: AggregatedPublication[],
): PublicationsMart => {
    const journalPublications = publications.filter(
        (publication) => publication.type === "Journal",
    ).length;
    const conferencePublications = publications.filter(
        (publication) => publication.type === "Conference Event",
    ).length;

    const researchersMap = new Map<string, { id: string; name: string; count: number }>();
    const venuesMap = new Map<string, number>();
    const yearsMap = new Map<number, number>();
    const keywordsMap = new Map<string, number>();
    const publicationKeys = new Set(publications.map((publication) => articleKey(publication)));
    const areaMap = new Map<
        string,
        {
            area: string;
            total_publications: number;
            researchers: Map<string, { id: string; name: string; count: number }>;
        }
    >();

    publications.forEach((publication) => {
        const year = Number(publication.year);
        if (Number.isFinite(year)) {
            yearsMap.set(year, (yearsMap.get(year) || 0) + 1);
        }

        const venue = String(publication.journal_conference || "").trim();
        if (isValidVenue(venue)) {
            venuesMap.set(venue, (venuesMap.get(venue) || 0) + 1);
        }

        publication.keywords.forEach((keyword) => {
            keywordsMap.set(keyword, (keywordsMap.get(keyword) || 0) + 1);
        });

        publication.authors.forEach((author) => {
            const current = researchersMap.get(author.id);
            if (current) {
                current.count += 1;
            } else {
                researchersMap.set(author.id, {
                    id: author.id,
                    name: author.name,
                    count: 1,
                });
            }
        });
    });

    researchers.forEach((researcher) => {
        const linkedPublicationCount = (researcher.articles || []).reduce(
            (count, article) =>
                publicationKeys.has(articleKey(article)) ? count + 1 : count,
            0,
        );

        if (linkedPublicationCount === 0) {
            return;
        }

        (researcher.knowledge_areas || []).forEach((area) => {
            const areaName = String(area?.name || "").trim();

            if (!areaName) {
                return;
            }

            const currentArea = areaMap.get(areaName) || {
                area: areaName,
                total_publications: 0,
                researchers: new Map<
                    string,
                    { id: string; name: string; count: number }
                >(),
            };

            currentArea.total_publications += linkedPublicationCount;

            const currentResearcher = currentArea.researchers.get(String(researcher.id));
            if (currentResearcher) {
                currentResearcher.count += linkedPublicationCount;
            } else {
                currentArea.researchers.set(String(researcher.id), {
                    id: String(researcher.id),
                    name: researcher.name,
                    count: linkedPublicationCount,
                });
            }

            areaMap.set(areaName, currentArea);
        });
    });

    const yearEntries = [...yearsMap.entries()].sort((a, b) => a[0] - b[0]);
    const fullYearRange =
        yearEntries.length > 0
            ? Array.from(
                  { length: yearEntries[yearEntries.length - 1][0] - yearEntries[0][0] + 1 },
                  (_, index) => yearEntries[0][0] + index,
              )
            : [];

    return {
        summary: {
            total_publications: publications.length,
            journal_publications: journalPublications,
            conference_publications: conferencePublications,
            unique_researchers: researchersMap.size,
            unique_venues: venuesMap.size,
        },
        type_distribution: [
            {
                label: "Periódicos",
                value: journalPublications,
                color: "var(--color-chart-2)",
            },
            {
                label: "Eventos",
                value: conferencePublications,
                color: "var(--color-chart-3)",
            },
        ].filter((item) => item.value > 0),
        evolution: fullYearRange.map((year) => ({
            year,
            count: yearsMap.get(year) || 0,
        })),
        top_researchers: [...researchersMap.values()]
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
            .slice(0, 10),
        top_venues: [...venuesMap.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .slice(0, 8)
            .map(([name, count]) => ({ name, count })),
        top_keywords: [...keywordsMap.entries()]
            .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
            .slice(0, 12)
            .map(([keyword, count]) => ({ keyword, count })),
        top_researchers_by_area: [...areaMap.values()]
            .sort(
                (a, b) =>
                    b.total_publications - a.total_publications ||
                    a.area.localeCompare(b.area),
            )
            .slice(0, 6)
            .map((area) => ({
                area: area.area,
                total_publications: area.total_publications,
                researchers: [...area.researchers.values()]
                    .sort(
                        (a, b) =>
                            b.count - a.count || a.name.localeCompare(b.name),
                    )
                    .slice(0, 3),
            })),
    };
};

export const getCampusPublicationViews = () =>
    Object.fromEntries(
        getRealCampuses().map((campus) => [
            campus.id,
            buildPublicationsMart(getPublicationsByCampusId(campus.id)),
        ]),
    );
