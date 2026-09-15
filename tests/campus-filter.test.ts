import { describe, expect, it } from "vitest";
import researchersData from "../src/data/researchers_canonical.json";
import initiativesData from "../src/data/initiatives_canonical.json";
import advisorshipsData from "../src/data/advisorships_canonical.json";
import type { Researcher } from "../src/types/researchers";
import type { Project } from "../src/types/projects";
import type { ProjectAdvisorship } from "../src/types/advisorships";
import {
    buildAdvisorshipDashboard,
    buildProjectMart,
    getAdvisorshipItemCampusIds,
    getAdvisorshipProjectsByCampusId,
    getCampusIdsFromNames,
    getGroupsByCampusId,
    getKnowledgeAreasByCampusId,
    getProjectCampusIds,
    getProjectsByCampusId,
    getRealCampuses,
    getResearcherCampusIds,
    resolveCampusId,
} from "../src/lib/tenant-data";
import {
    getAggregatedPublications,
    getCampusPublicationViews,
    getPublicationsByCampusId,
} from "../src/lib/publications-data";
import {
    buildResearcherCardView,
    renderResearcherCardMarkup,
} from "../src/lib/researcher-card-markup";
import { getCampusNamesFromIds } from "../src/lib/tenant-data";
import { buildResearcherStatsById } from "../src/lib/researchers-data";
import { buildCampusResearcherViews } from "../src/lib/researcher-collections";

const researchers = researchersData as Researcher[];
const projects = initiativesData as Project[];
const advisorshipProjects = advisorshipsData as ProjectAdvisorship[];
const campusIds = getRealCampuses().map((campus) => campus.id);

const getNonMatchingCampusId = (selectedIds: string[]) =>
    campusIds.find((campusId) => !selectedIds.includes(campusId)) || "999";

const matchesCampus = (selectedCampusId: string, itemCampusIds: string[]) =>
    !selectedCampusId || itemCampusIds.includes(selectedCampusId);

describe("Campus filter normalization", () => {
    it("normalizes id, slug, and name to the canonical campus id", () => {
        expect(resolveCampusId("6")).toBe("6");
        expect(resolveCampusId("serra")).toBe("6");
        expect(resolveCampusId("Serra")).toBe("6");
    });

    it("maps campus names from mart data to campus ids", () => {
        expect(getCampusIdsFromNames(["Serra", "Vitória", "Serra"])).toEqual([
            "6",
            "2",
        ]);
    });
});

describe("Campus predicates use campus ids", () => {
    it("filters researchers by campus id", () => {
        const researcher = researchers.find((item) =>
            getResearcherCampusIds(item).includes("6"),
        );

        expect(researcher).toBeDefined();

        const researcherCampusIds = getResearcherCampusIds(researcher!);
        expect(matchesCampus("6", researcherCampusIds)).toBe(true);
        expect(
            matchesCampus(
                getNonMatchingCampusId(researcherCampusIds),
                researcherCampusIds,
            ),
        ).toBe(false);
    });

    it("filters projects by campus id", () => {
        const project = projects.find((item) =>
            getProjectCampusIds(item).includes("6"),
        );

        expect(project).toBeDefined();

        const projectCampusIds = getProjectCampusIds(project!);
        expect(matchesCampus("6", projectCampusIds)).toBe(true);
        expect(
            matchesCampus(
                getNonMatchingCampusId(projectCampusIds),
                projectCampusIds,
            ),
        ).toBe(false);
    });

    it("filters advisorship items by campus id", () => {
        const advisorship = advisorshipProjects
            .flatMap((project) => project.advisorships || [])
            .find((item) => getAdvisorshipItemCampusIds(item).includes("6"));

        expect(advisorship).toBeDefined();

        const advisorshipCampusIds = getAdvisorshipItemCampusIds(advisorship!);
        expect(matchesCampus("6", advisorshipCampusIds)).toBe(true);
        expect(
            matchesCampus(
                getNonMatchingCampusId(advisorshipCampusIds),
                advisorshipCampusIds,
            ),
        ).toBe(false);
    });
});

describe("Campus dashboards remain keyed by id", () => {
    it("builds project summaries by campus id", () => {
        const campusProjects = getProjectsByCampusId("6");
        const mart = buildProjectMart(campusProjects);

        expect(mart.summary.total_projects).toBe(campusProjects.length);
    });

    it("builds advisorship summaries by campus id", () => {
        const campusProjects = getAdvisorshipProjectsByCampusId("6");
        const dashboard = buildAdvisorshipDashboard(campusProjects);
        const expectedTotal = campusProjects.flatMap(
            (project) => project.advisorships || [],
        ).length;

        expect(dashboard.summary.total_advisorships).toBe(expectedTotal);
    });

    it("builds knowledge area summaries by campus id", () => {
        const campusAreas = getKnowledgeAreasByCampusId("6");
        const campusName =
            getRealCampuses().find((campus) => campus.id === "6")?.name || "";

        expect(campusAreas.length).toBeGreaterThan(0);
        expect(campusAreas.every((area) => area.groups_count === area.groups.length)).toBe(true);
        expect(campusAreas.every((area) => area.campuses.length === 1)).toBe(true);
        expect(
            campusAreas.every((area) =>
                area.groups.every((group) => group.campus === campusName),
            ),
        ).toBe(true);
        expect(campusAreas[0].groups_count).toBeLessThanOrEqual(
            getGroupsByCampusId("6").length,
        );
    });
});

describe("Publications use the canonical article campus", () => {
    it("keeps multi-author publications linked to a single canonical campus", () => {
        const publication = getAggregatedPublications().find(
            (item) => item.internal_authors_count > 1 && item.campus_id,
        );
        const publicationId = String(publication?.id || "");
        const nonMatchingCampusId = getNonMatchingCampusId([
            publication?.campus_id || "",
        ]);

        expect(publication).toBeDefined();
        expect(publication?.internal_authors_count).toBeGreaterThan(1);
        expect(publication?.campus_id).not.toBe("");
        expect(publication?.campus_name).not.toBe("");
        expect(
            getPublicationsByCampusId(publication?.campus_id || "").some(
                (item) => String(item.id) === publicationId,
            ),
        ).toBe(true);
        expect(
            getPublicationsByCampusId(nonMatchingCampusId).some(
                (item) => String(item.id) === publicationId,
            ),
        ).toBe(false);
    });

    it("builds publication views keyed by campus id", () => {
        const campusViews = getCampusPublicationViews();

        expect(Object.keys(campusViews)).toContain("6");
        expect(campusViews["6"].summary.total_publications).toBe(
            getPublicationsByCampusId("6").length,
        );
    });
});

describe("Researcher primary campus resolution and card contract (US1)", () => {
    it("returns strictly the primary campus id for a researcher with multiple research groups", () => {
        // Maria Alice has campus: { id: 2, name: 'Vitória' } but groups in Vitória (2), Cefor (11), Cariacica (13)
        const multiGroupResearcher = researchers.find(
            (r) =>
                r.name === "Maria Alice Veiga Ferreira De Souza" &&
                r.campus &&
                String(r.campus.id) === "2",
        );

        expect(multiGroupResearcher).toBeDefined();
        const campusIds = getResearcherCampusIds(multiGroupResearcher!);
        // Must strictly return only the primary campus id
        expect(campusIds).toEqual(["2"]);
    });

    it("renders strictly one campus pill and no overflow badges on researcher card", () => {
        const multiGroupResearcher = researchers.find(
            (r) =>
                r.name === "Maria Alice Veiga Ferreira De Souza" &&
                r.campus &&
                String(r.campus.id) === "2",
        );
        expect(multiGroupResearcher).toBeDefined();

        const stats = buildResearcherStatsById([multiGroupResearcher!])[
            multiGroupResearcher!.id
        ];
        const campusIds = getResearcherCampusIds(multiGroupResearcher!);
        const campusNames = getCampusNamesFromIds(campusIds);

        const cardView = buildResearcherCardView({
            researcher: multiGroupResearcher!,
            stats,
            baseUrl: "/",
            campusIds,
            campusNames,
        });

        const markup = renderResearcherCardMarkup(cardView);

        // Contains the primary campus name
        expect(markup).toContain("Vitória");
        // Does NOT contain secondary group campuses as pills
        expect(markup).not.toContain("Cefor");
        expect(markup).not.toContain("Cariacica");
        // Does NOT contain overflow badges like +1, +2
        expect(markup).not.toMatch(/\+\d+/);
    });
});

describe("Strict campus filtering and DOM contract (US2)", () => {
    it("sets data-campus-ids to strictly the primary campus id and rejects secondary campuses in filter predicate", () => {
        const multiGroupResearcher = researchers.find(
            (r) =>
                r.name === "Maria Alice Veiga Ferreira De Souza" &&
                r.campus &&
                String(r.campus.id) === "2",
        );
        expect(multiGroupResearcher).toBeDefined();

        const stats = buildResearcherStatsById([multiGroupResearcher!])[
            multiGroupResearcher!.id
        ];
        const campusIds = getResearcherCampusIds(multiGroupResearcher!);
        const campusNames = getCampusNamesFromIds(campusIds);

        const cardView = buildResearcherCardView({
            researcher: multiGroupResearcher!,
            stats,
            baseUrl: "/",
            campusIds,
            campusNames,
        });

        const markup = renderResearcherCardMarkup(cardView);

        // Strict DOM attribute
        expect(markup).toContain('data-campus-ids="2"');
        expect(markup).not.toContain('data-campus-ids="2|11|13"');

        // Client-side predicate test: matches primary campus
        expect(matchesCampus("2", cardView.campusIds)).toBe(true);
        // Does NOT match former secondary group campuses
        expect(matchesCampus("11", cardView.campusIds)).toBe(false);
        expect(matchesCampus("13", cardView.campusIds)).toBe(false);
    });

    it("handles researchers with no campus gracefully in filter predicates", () => {
        const noCampusResearcher = researchers.find((r) => !r.campus);
        expect(noCampusResearcher).toBeDefined();

        const campusIds = getResearcherCampusIds(noCampusResearcher!);
        expect(campusIds).toEqual([]);

        // Without campus filter, matches all
        expect(matchesCampus("", campusIds)).toBe(true);
        // With specific campus filter, does not match
        expect(matchesCampus("2", campusIds)).toBe(false);
    });
});

describe("Disjoint campus researcher views without duplicate counts (US3)", () => {
    it("ensures researchers are partitioned exclusively into their primary campus views", () => {
        const campusViews = buildCampusResearcherViews(researchers);
        const campusKeys = Object.keys(campusViews);

        // Check pairwise disjunction across all campuses
        for (let i = 0; i < campusKeys.length; i++) {
            for (let j = i + 1; j < campusKeys.length; j++) {
                const campusA = campusKeys[i];
                const campusB = campusKeys[j];

                const idsA = new Set(campusViews[campusA].map((r) => String(r.id)));
                const idsB = new Set(campusViews[campusB].map((r) => String(r.id)));

                const intersection = [...idsA].filter((id) => idsB.has(id));
                expect(intersection).toEqual([]);
            }
        }
    });

    it("verifies multi-group researcher belongs only to their primary campus view", () => {
        const campusViews = buildCampusResearcherViews(researchers);

        const vitoriaResearchers = campusViews["2"] || [];
        const ceforResearchers = campusViews["11"] || [];
        const cariacicaResearchers = campusViews["13"] || [];

        const mariaAliceId = "3"; // Maria Alice Veiga Ferreira De Souza

        expect(vitoriaResearchers.some((r) => String(r.id) === mariaAliceId)).toBe(true);
        expect(ceforResearchers.some((r) => String(r.id) === mariaAliceId)).toBe(false);
        expect(cariacicaResearchers.some((r) => String(r.id) === mariaAliceId)).toBe(false);
    });
});


