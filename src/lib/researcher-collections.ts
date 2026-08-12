import allResearchersData from "../data/researchers_canonical.json";
import nullResearchersData from "../data/null_researchers_canonical.json";
import outsideIfesData from "../data/outside_ifes_canonical.json";
import researchersOnlyData from "../data/researchers_only_canonical.json";
import studentsData from "../data/students_canonical.json";
import { getRealCampuses, getResearcherCampusIds } from "./tenant-data";
import type { Researcher } from "../types/researchers";

export const sortResearchersByName = (items: Researcher[]) =>
    [...items].sort((a, b) => a.name.localeCompare(b.name));

export const allResearchers = allResearchersData as Researcher[];
export const researchersOnly = sortResearchersByName(
    researchersOnlyData as Researcher[],
);
export const studentsResearchers = sortResearchersByName(
    studentsData as Researcher[],
);
export const outsideIfesResearchers = sortResearchersByName(
    outsideIfesData as Researcher[],
);
export const unrecognizedResearchers = sortResearchersByName(
    nullResearchersData as Researcher[],
);

export const buildCampusResearcherViews = (researchers: Researcher[]) =>
    Object.fromEntries(
        getRealCampuses().map((campus) => [
            campus.id,
            sortResearchersByName(
                researchers.filter((researcher) =>
                    getResearcherCampusIds(researcher).includes(campus.id),
                ),
            ),
        ]),
    ) as Record<string, Researcher[]>;

export const researcherCollectionCounts = {
    researchers: researchersOnly.length,
    students: studentsResearchers.length,
    outsideIfes: outsideIfesResearchers.length,
    unrecognized: unrecognizedResearchers.length,
};
