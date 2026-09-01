import { describe, expect, it } from "vitest";
import {
    buildPeopleNetworkOverview,
    type PeopleGraphRawFile,
} from "../src/lib/people-network";

const collaborationGraphFixture: PeopleGraphRawFile = {
    metadata: {
        scope: {
            type: "full",
            graph_type: "collaboration",
        },
        weight_definition: "fixture",
    },
    graph_stats: {
        nodes: 20,
        edges: 10,
        isolated_nodes: 5,
        connected_components: 4,
        largest_component_size: 12,
        relation_event_totals: {
            project: 8,
            article: 2,
        },
        classification_distribution: {
            researcher: 12,
            student: 8,
            outside_ifes: 3,
            null: 2,
        },
        top_people_by_weighted_degree: [
            {
                id: 1,
                name: "Alice Researcher",
                classification: "researcher",
                weighted_degree: 30,
                degree: 10,
            },
            {
                id: 2,
                name: "Bob Researcher",
                classification: "researcher",
                weighted_degree: 22,
                degree: 8,
            },
            {
                id: 3,
                name: "Carol Student",
                classification: "student",
                weighted_degree: 50,
                degree: 20,
            },
        ],
        top_hubs_by_degree_centrality: [],
        complex_network_metrics: {
            density: 0.1,
            average_clustering: 0.4,
            community_count: 3,
            modularity: 0.6,
            bridge_edge_count: 2,
        },
    },
    graph: {
        nodes: [
            {
                id: 1,
                name: "Alice Researcher",
                classification: "researcher",
                weighted_degree: 30,
                degree: 10,
                campus_name: "Serra",
            },
            {
                id: 2,
                name: "Bob Researcher",
                classification: "researcher",
                weighted_degree: 22,
                degree: 8,
                campus_name: "Vitória",
            },
            {
                id: 31,
                name: "ui-button",
                classification: "researcher",
                weighted_degree: 999,
                degree: 999,
            },
            {
                id: 3,
                name: "Carol Student",
                classification: "student",
                weighted_degree: 50,
                degree: 20,
                campus_name: "Linhares",
            },
            {
                id: 30,
                name: "Clara Student",
                classification: "student",
                weighted_degree: 25,
                degree: 18,
                campus_name: "Colatina",
            },
            {
                id: 5,
                name: "Eva External",
                classification: "outside_ifes",
                weighted_degree: 18,
                degree: 9,
            },
            {
                id: 6,
                name: "Otavio External",
                classification: "outside_ifes",
                weighted_degree: 15,
                degree: 7,
            },
            {
                id: 7,
                name: "Unknown Partner",
                classification: null,
                weighted_degree: 11,
                degree: 6,
            },
            {
                id: 8,
                name: "No Label Person",
                classification: "null",
                weighted_degree: 10,
                degree: 5,
            },
            {
                id: 9,
                name: "Zero Weight Student",
                classification: "student",
                weighted_degree: 0,
                degree: 4,
            },
        ],
    },
};

const relationshipGraphFixture: PeopleGraphRawFile = {
    metadata: {
        scope: {
            type: "full",
        },
        weight_definition: "fixture",
    },
    graph_stats: {
        nodes: 20,
        edges: 50,
        isolated_nodes: 1,
        connected_components: 2,
        largest_component_size: 19,
        relation_event_totals: {
            research_group: 40,
            advisorship: 10,
        },
        classification_distribution: {
            researcher: 12,
            student: 8,
            outside_ifes: 3,
            null: 2,
        },
        top_people_by_weighted_degree: [],
        top_hubs_by_degree_centrality: [
            {
                id: 99,
                name: "ui-button",
                classification: "researcher",
                weighted_degree: 100,
                degree: 99,
                degree_centrality: 0.9,
            },
            {
                id: 4,
                name: "Daniel Hub",
                classification: "researcher",
                weighted_degree: 18,
                degree: 12,
                degree_centrality: 0.5,
            },
        ],
        complex_network_metrics: {
            density: 0.5,
            average_clustering: 0.8,
            community_count: 2,
            modularity: 0.7,
            bridge_edge_count: 5,
        },
    },
    graph: {
        nodes: [
            {
                id: 4,
                name: "Daniel Hub",
                classification: "researcher",
                weighted_degree: 18,
                degree: 12,
                degree_centrality: 0.5,
                campus_name: "Serra",
            },
            {
                id: 10,
                name: "Erica Researcher",
                classification: "researcher",
                weighted_degree: 26,
                degree: 14,
                campus_name: "Vitória",
            },
            {
                id: 11,
                name: "Bianca Student",
                classification: "student",
                weighted_degree: 24,
                degree: 13,
                campus_name: "Linhares",
            },
            {
                id: 12,
                name: "Fabio External",
                classification: "outside_ifes",
                weighted_degree: 17,
                degree: 10,
            },
            {
                id: 13,
                name: "Null Relationship Person",
                classification: null,
                weighted_degree: 9,
                degree: 4,
            },
            {
                id: 14,
                name: "ui-edge-node",
                classification: "researcher",
                weighted_degree: 999,
                degree: 999,
            },
        ],
    },
};

describe("people network overview", () => {
    it("builds the top collaborator ranking from collaboration data", () => {
        const overview = buildPeopleNetworkOverview(
            collaborationGraphFixture,
            relationshipGraphFixture,
            {
                baseUrl: "/horizon_dashboard/",
            },
        );

        expect(overview.topCollaborators).toHaveLength(2);
        expect(overview.topCollaborators[0]?.name).toBe("Alice Researcher");
        expect(overview.topCollaborators[0]?.profileHref).toBe(
            "/horizon_dashboard/researchers/1",
        );
        expect(overview.collaboration.largestComponentShare).toBe(0.6);
    });

    it("filters non-person ui records from the hub ranking", () => {
        const overview = buildPeopleNetworkOverview(
            collaborationGraphFixture,
            relationshipGraphFixture,
            {
                baseUrl: "/horizon_dashboard/",
            },
        );

        expect(overview.topConnectors).toHaveLength(1);
        expect(overview.topConnectors[0]?.name).toBe("Daniel Hub");
        expect(overview.topConnectors[0]?.degreeCentrality).toBe(0.5);
    });

    it("builds top 5 rankings by profile directly from graph nodes", () => {
        const overview = buildPeopleNetworkOverview(
            collaborationGraphFixture,
            relationshipGraphFixture,
            {
                baseUrl: "/horizon_dashboard/",
            },
        );

        expect(overview.collaboration.topByClassification.researcher).toHaveLength(
            2,
        );
        expect(
            overview.collaboration.topByClassification.researcher[0]?.name,
        ).toBe("Alice Researcher");
        expect(
            overview.collaboration.topByClassification.researcher[0]?.campusName,
        ).toBe("Serra");

        expect(overview.collaboration.topByClassification.student).toHaveLength(2);
        expect(overview.collaboration.topByClassification.student[0]?.name).toBe(
            "Carol Student",
        );
        expect(
            overview.collaboration.topByClassification.student[0]?.profileHref,
        ).toBe("/horizon_dashboard/students/3");

        expect(
            overview.collaboration.topByClassification.outside_ifes[0]?.name,
        ).toBe("Eva External");
        expect(
            overview.collaboration.topByClassification.outside_ifes[0]
                ?.profileHref,
        ).toBe("/horizon_dashboard/researchers/5");

        expect(overview.collaboration.topByClassification.null[0]?.name).toBe(
            "Unknown Partner",
        );
        expect(
            overview.collaboration.topByClassification.null[0]?.classificationKey,
        ).toBe("null");

        expect(overview.relationship.topByClassification.researcher[0]?.name).toBe(
            "Erica Researcher",
        );
        expect(overview.relationship.topByClassification.student[0]?.name).toBe(
            "Bianca Student",
        );
        expect(
            overview.relationship.topByClassification.outside_ifes[0]?.name,
        ).toBe("Fabio External");
        expect(overview.relationship.topByClassification.null[0]?.name).toBe(
            "Null Relationship Person",
        );
    });
});

/**
 * Mirrors the shape the ETL is currently exporting for `people_collaboration_graph.json`, where the
 * component/isolation counters and the rankings are absent from `graph_stats`.
 */
const sparseGraphFixture: PeopleGraphRawFile = {
    metadata: {
        scope: {
            type: "full",
            graph_type: "collaboration",
        },
    },
    graph_stats: {
        nodes: 4139,
        edges: 10310,
        connected_components: 621,
        relation_event_totals: {
            initiative: 13425,
            article: 438,
        },
    },
    graph: {
        nodes: [
            {
                id: 1,
                name: "Alice Researcher",
                classification: "researcher",
                weighted_degree: 30,
                degree: 10,
            },
        ],
    },
};

describe("people network overview with incomplete exports", () => {
    it("reports absent structural metrics as null instead of zero", () => {
        const overview = buildPeopleNetworkOverview(
            sparseGraphFixture,
            sparseGraphFixture,
        );

        expect(overview.collaboration.isolatedNodeCount).toBeNull();
        expect(overview.collaboration.largestComponentSize).toBeNull();
        expect(overview.collaboration.largestComponentShare).toBeNull();
    });

    it("keeps the counters that every export carries", () => {
        const overview = buildPeopleNetworkOverview(
            sparseGraphFixture,
            sparseGraphFixture,
        );

        expect(overview.collaboration.nodeCount).toBe(4139);
        expect(overview.collaboration.edgeCount).toBe(10310);
        expect(overview.collaboration.connectedComponentCount).toBe(621);
    });

    it("yields empty rankings rather than fabricated entries", () => {
        const overview = buildPeopleNetworkOverview(
            sparseGraphFixture,
            sparseGraphFixture,
        );

        expect(overview.topCollaborators).toEqual([]);
        expect(overview.topConnectors).toEqual([]);
        expect(overview.collaboration.classificationDistribution).toEqual([]);
    });

    it("still computes the component share when the export is complete", () => {
        const overview = buildPeopleNetworkOverview(
            collaborationGraphFixture,
            relationshipGraphFixture,
        );

        expect(overview.collaboration.isolatedNodeCount).toBe(5);
        expect(overview.collaboration.largestComponentSize).toBe(12);
        expect(overview.collaboration.largestComponentShare).toBe(0.6);
    });
});
