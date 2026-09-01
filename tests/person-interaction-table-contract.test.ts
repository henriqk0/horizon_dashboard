import { describe, expect, it } from "vitest";
import {
    buildStudentInteractionTableRows,
    buildStudentInteractionViewModel,
    serializeRelationTypesAttribute,
} from "../src/lib/student-interaction";
import type { StudentInteractionRawGraphFile } from "../src/types/student-graphs";

/**
 * The graph filter script reads `data-relation-types` from both the SVG edges and the table rows
 * and runs them through the same matcher, so the two producers have to agree on the format.
 */
const relationshipFixture = {
    metadata: {
        scope: {
            type: "classification",
            graph_type: "relationship",
            classification: "researcher",
        },
    },
    graph_stats: {},
    graph: {
        nodes: [
            {
                id: 1,
                name: "Alice",
                classification: "researcher",
                degree: 3,
                weighted_degree: 6,
            },
            {
                id: 2,
                name: "Bruno",
                classification: "student",
                degree: 1,
                weighted_degree: 3,
            },
            {
                id: 3,
                name: "Carla",
                classification: "researcher",
                degree: 1,
                weighted_degree: 2,
            },
            {
                id: 4,
                name: "Diego",
                classification: "outside_ifes",
                degree: 1,
                weighted_degree: 1,
            },
        ],
        edges: [
            {
                source: 1,
                target: 2,
                weight: 3,
                initiative_count: 1,
                research_group_count: 1,
                advisorship_count: 1,
                relation_types: ["initiative", "research_group", "advisorship"],
            },
            {
                source: 1,
                target: 3,
                weight: 2,
                initiative_count: 0,
                research_group_count: 2,
                advisorship_count: 0,
                relation_types: ["research_group"],
            },
            {
                source: 4,
                target: 1,
                weight: 1,
                initiative_count: 1,
                research_group_count: 0,
                advisorship_count: 0,
                relation_types: ["initiative"],
            },
        ],
    },
} as unknown as StudentInteractionRawGraphFile;

const buildRows = () => {
    const viewModel = buildStudentInteractionViewModel(relationshipFixture, {
        focusId: 1,
        focusName: "Alice",
        focusClassification: "researcher",
        graphKind: "relationship",
    });

    return {
        viewModel,
        rows: buildStudentInteractionTableRows(viewModel),
    };
};

describe("serializeRelationTypesAttribute", () => {
    it("emits a comma separated list without padding", () => {
        const { rows } = buildRows();
        const multiRelationRow = rows.find((row) => row.targetName === "Bruno");

        expect(multiRelationRow).toBeDefined();
        expect(serializeRelationTypesAttribute(multiRelationRow!)).toBe(
            "initiative,research_group,advisorship",
        );
    });

    it("emits a single value for rows with one relation kind", () => {
        const { rows } = buildRows();
        const singleRelationRow = rows.find((row) => row.targetName === "Carla");

        expect(serializeRelationTypesAttribute(singleRelationRow!)).toBe("research_group");
    });

    it("splits back into the exact relation types the row carries", () => {
        const { rows } = buildRows();

        rows.forEach((row) => {
            expect(serializeRelationTypesAttribute(row).split(",")).toEqual(
                row.relations.map((relation) => relation.type),
            );
        });
    });

    it("matches the attribute the SVG edge of the same pair produces", () => {
        const { viewModel, rows } = buildRows();

        rows.forEach((row) => {
            const edge = viewModel.edges.find((candidate) => candidate.target === row.targetId);

            expect(edge).toBeDefined();
            expect(serializeRelationTypesAttribute(row)).toBe(edge!.relationTypes.join(","));
        });
    });

    it("returns an empty string when the row has no relations", () => {
        expect(
            serializeRelationTypesAttribute({
                key: "1:9",
                sourceId: "1",
                sourceName: "Alice",
                sourceClassification: "researcher",
                sourceCampusName: null,
                sourceProfileHref: null,
                targetId: "9",
                targetName: "Sem vínculo",
                targetClassification: null,
                targetCampusName: null,
                targetProfileHref: null,
                weight: 0,
                relationKinds: 0,
                totalRelationEvents: 0,
                relations: [],
            }),
        ).toBe("");
    });
});
