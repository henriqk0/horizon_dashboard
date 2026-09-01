import { getPersonPairNamedRelationItems } from "./person-relation-details";
import type {
    PersonInteractionClassification,
    PersonInteractionClassificationKey,
    PersonInteractionConnection,
    PersonInteractionEdge,
    PersonInteractionGraphKind,
    PersonInteractionNode,
    PersonInteractionRawEdge,
    PersonInteractionRawGraphFile,
    PersonInteractionRawNode,
    PersonInteractionRelationType,
    PersonInteractionTableRow,
    PersonInteractionTableRowRelation,
    PersonInteractionViewModel,
} from "../types/person-interactions";

const RELATION_TYPE_ORDER_BY_KIND: Record<
    PersonInteractionGraphKind,
    PersonInteractionRelationType[]
> = {
    collaboration: ["initiative", "article", "advisorship"],
    relationship: ["initiative", "research_group", "advisorship"],
};

const createRelationCounter = (): Record<PersonInteractionRelationType, number> => ({
    project: 0,
    orientation: 0,
    article: 0,
    initiative: 0,
    research_group: 0,
    advisorship: 0,
});

const normalizeBaseUrl = (baseUrl = "/") => {
    const normalized = baseUrl.trim() || "/";
    return normalized.endsWith("/") ? normalized : `${normalized}/`;
};

const toClassificationKey = (
    classification: PersonInteractionClassification,
): PersonInteractionClassificationKey => classification ?? "null";

const resolveProfileHref = (
    person: {
        id: string | number;
        classification: PersonInteractionClassification;
    },
    baseUrl = "/",
) => {
    const personId = String(person.id ?? "").trim();
    if (!personId) return null;

    const prefix =
        person.classification === "student" ? "students" : "researchers";

    return `${normalizeBaseUrl(baseUrl)}${prefix}/${personId}`;
};

const getRelationEvidenceCount = (
    edge: PersonInteractionRawEdge,
    relationType: PersonInteractionRelationType,
) => {
    switch (relationType) {
        case "project":
            return Number(edge.project_count ?? 0);
        case "orientation":
            return Number(edge.orientation_count ?? 0);
        case "article":
            return Number(edge.article_count ?? 0);
        case "initiative":
            return Number(edge.initiative_count ?? 0);
        case "research_group":
            return Number(edge.research_group_count ?? 0);
        case "advisorship":
            return Number(edge.advisorship_count ?? 0);
        default:
            return 0;
    }
};

const normalizeRelationKey = (relationType: string): string => {
    if (!relationType) return "";
    const norm = String(relationType)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/_/g, " ")
        .trim();

    if (norm === "project" || norm === "projeto") return "projeto";
    if (norm === "orientation" || norm === "orientacao" || norm === "advisorship") return "orientacao";
    if (norm === "article" || norm === "artigo") return "artigo";
    if (norm === "initiative" || norm === "iniciativa") return "iniciativa";
    if (norm === "research group" || norm === "grupo de pesquisa" || norm === "research_group") return "grupo de pesquisa";

    return norm;
};

const normalizeRelationTypes = (
    edge: PersonInteractionRawEdge,
    graphKind: PersonInteractionGraphKind,
) => {
    const relationOrder = RELATION_TYPE_ORDER_BY_KIND[graphKind];
    const rawDeclared = Array.isArray(edge.relation_types) ? edge.relation_types : [];

    const declaredTypes = relationOrder.filter((type) => {
        const normType = normalizeRelationKey(type);
        return rawDeclared.some((raw) => normalizeRelationKey(raw) === normType);
    });

    if (declaredTypes.length > 0) {
        return declaredTypes;
    }

    const evidenceTypes = relationOrder.filter(
        (relationType) => getRelationEvidenceCount(edge, relationType) > 0,
    );

    if (evidenceTypes.length > 0) {
        return evidenceTypes;
    }

    if (rawDeclared.length > 0) {
        return rawDeclared as PersonInteractionRelationType[];
    }

    return [];
};

const buildRelationEvidenceCounts = (
    edge: PersonInteractionRawEdge,
): Record<PersonInteractionRelationType, number> => ({
    project: getRelationEvidenceCount(edge, "project"),
    orientation: getRelationEvidenceCount(edge, "orientation"),
    article: getRelationEvidenceCount(edge, "article"),
    initiative: getRelationEvidenceCount(edge, "initiative"),
    research_group: getRelationEvidenceCount(edge, "research_group"),
    advisorship: getRelationEvidenceCount(edge, "advisorship"),
});

const normalizeNode = (
    node: PersonInteractionRawNode,
    options: {
        baseUrl: string;
        isFocus: boolean;
    },
): PersonInteractionNode => {
    const classification = node.classification ?? null;

    return {
        id: String(node.id),
        name: node.name ?? "Pessoa sem nome",
        classification,
        classificationKey: toClassificationKey(classification),
        classificationConfidence: node.classification_confidence ?? null,
        campusName: node.campus_name ?? null,
        degree: Number(node.degree ?? 0),
        weightedDegree: Number(node.weighted_degree ?? 0),
        wasStudent: node.was_student === true,
        wasStaff: node.was_staff === true,
        isFocus: options.isFocus,
        profileHref: resolveProfileHref(
            {
                id: node.id,
                classification,
            },
            options.baseUrl,
        ),
    };
};

interface PersonInteractionGraphIndex {
    nodesById: Map<string, PersonInteractionRawNode>;
    edgesByNodeId: Map<string, PersonInteractionRawEdge[]>;
}

const graphIndexCache = new WeakMap<
    PersonInteractionRawGraphFile,
    PersonInteractionGraphIndex
>();

const buildGraphIndex = (
    rawGraph: PersonInteractionRawGraphFile,
): PersonInteractionGraphIndex => {
    const cached = graphIndexCache.get(rawGraph);
    if (cached) return cached;

    const nodesById = new Map<string, PersonInteractionRawNode>();
    const edgesByNodeId = new Map<string, PersonInteractionRawEdge[]>();

    rawGraph.graph.nodes.forEach((node) => {
        const nodeId = String(node.id);
        nodesById.set(nodeId, node);
        edgesByNodeId.set(nodeId, []);
    });

    rawGraph.graph.edges.forEach((edge) => {
        const source = String(edge.source);
        const target = String(edge.target);

        if (edgesByNodeId.has(source)) {
            edgesByNodeId.get(source)?.push(edge);
        }

        if (edgesByNodeId.has(target)) {
            edgesByNodeId.get(target)?.push(edge);
        }
    });

    const index = {
        nodesById,
        edgesByNodeId,
    };

    graphIndexCache.set(rawGraph, index);

    return index;
};

interface BuildPersonInteractionOptions {
    focusId: string | number;
    focusName?: string;
    focusClassification?: PersonInteractionClassification;
    graphDataSource?: string;
    graphKind: PersonInteractionGraphKind;
    baseUrl?: string;
}

export const buildPersonInteractionViewModel = (
    rawGraph: PersonInteractionRawGraphFile,
    options: BuildPersonInteractionOptions,
): PersonInteractionViewModel => {
    const baseUrl = normalizeBaseUrl(options.baseUrl);
    const focusId = String(options.focusId);
    const graphIndex = buildGraphIndex(rawGraph);
    const fallbackClassification = options.focusClassification ?? "student";
    const focusNodeRecord =
        graphIndex.nodesById.get(focusId) ??
        ({
            id: focusId,
            name: options.focusName ?? "Pessoa",
            classification: fallbackClassification,
            classification_confidence: null,
            campus_name: null,
            degree: 0,
            weighted_degree: 0,
            was_student: fallbackClassification === "student",
            was_staff: false,
        } satisfies PersonInteractionRawNode);

    const focusNode = normalizeNode(focusNodeRecord, {
        baseUrl,
        isFocus: true,
    });

    const directEdges = (graphIndex.edgesByNodeId.get(focusId) ?? [])
        .map((edge) => {
            const source = String(edge.source);
            const target = String(edge.target);
            const neighborId = source === focusId ? target : source;
            const relationTypes = normalizeRelationTypes(edge, options.graphKind);

            return {
                rawEdge: edge,
                neighborId,
                normalizedEdge: {
                    source: focusId,
                    target: neighborId,
                    weight: Number(edge.weight ?? 0),
                    relationTypes,
                    relationEvidenceCounts: buildRelationEvidenceCounts(edge),
                } satisfies PersonInteractionEdge,
            };
        })
        .filter(({ neighborId }) => graphIndex.nodesById.has(neighborId))
        .sort((left, right) => {
            const weightDifference =
                right.normalizedEdge.weight - left.normalizedEdge.weight;
            if (weightDifference !== 0) return weightDifference;

            const leftName =
                graphIndex.nodesById.get(left.neighborId)?.name ?? left.neighborId;
            const rightName =
                graphIndex.nodesById.get(right.neighborId)?.name ?? right.neighborId;

            return leftName.localeCompare(rightName, "pt-BR");
        });

    const relationTypeCounts = createRelationCounter();

    directEdges.forEach(({ normalizedEdge }) => {
        normalizedEdge.relationTypes.forEach((relationType) => {
            relationTypeCounts[relationType] += 1;
        });
    });

    const neighborNodes = directEdges.map(({ neighborId }) =>
        normalizeNode(graphIndex.nodesById.get(neighborId) as PersonInteractionRawNode, {
            baseUrl,
            isFocus: false,
        }),
    );

    const topConnections = directEdges.map(({ neighborId, normalizedEdge }) => {
        const neighbor = graphIndex.nodesById.get(neighborId) as PersonInteractionRawNode;
        const profileHref = resolveProfileHref(
            {
                id: neighbor.id,
                classification: neighbor.classification ?? null,
            },
            baseUrl,
        );

        return {
            id: String(neighbor.id),
            name: neighbor.name ?? "Pessoa sem nome",
            campusName: neighbor.campus_name ?? null,
            weight: normalizedEdge.weight,
            relationTypes: normalizedEdge.relationTypes,
            relationEvidenceCounts: normalizedEdge.relationEvidenceCounts,
            profileHref,
        } satisfies PersonInteractionConnection;
    });

    const availableRelationTypes = RELATION_TYPE_ORDER_BY_KIND[
        options.graphKind
    ].filter((relationType) => relationTypeCounts[relationType] > 0);

    return {
        focusId,
        focusName: focusNode.name,
        focusClassification: focusNode.classification,
        graphDataSource:
            options.graphDataSource ??
            (options.graphKind === "collaboration"
                ? "students_collaboration_graph"
                : "students_relationship_graph"),
        graphKind: options.graphKind,
        nodes: [focusNode, ...neighborNodes],
        edges: directEdges.map(({ normalizedEdge }) => normalizedEdge),
        topConnections,
        stats: {
            nodeCount: 1 + directEdges.length,
            edgeCount: directEdges.length,
            totalWeight: directEdges.reduce(
                (sum, { normalizedEdge }) => sum + normalizedEdge.weight,
                0,
            ),
            strongestWeight: directEdges.reduce(
                (max, { normalizedEdge }) => Math.max(max, normalizedEdge.weight),
                0,
            ),
            availableRelationTypes,
            relationTypeCounts,
        },
    };
};

export const buildPersonInteractionTableRows = (
    viewModel: PersonInteractionViewModel,
): PersonInteractionTableRow[] => {
    const nodesById = new Map(viewModel.nodes.map((node) => [node.id, node]));

    return viewModel.edges
        .map((edge) => {
            const sourceNode = nodesById.get(edge.source);
            const targetNode = nodesById.get(edge.target);

            if (!sourceNode || !targetNode) {
                return null;
            }

            const relations = edge.relationTypes.map((relationType) => {
                const count = Number(edge.relationEvidenceCounts[relationType] ?? 0);

                return {
                    type: relationType,
                    count: count > 0 ? count : null,
                    namedItems: getPersonPairNamedRelationItems(
                        sourceNode.id,
                        targetNode.id,
                        relationType,
                    ),
                } satisfies PersonInteractionTableRowRelation;
            });
            const explicitRelationEvents = relations.reduce(
                (total, relation) => total + (relation.count ?? 0),
                0,
            );

            return {
                key: `${sourceNode.id}:${targetNode.id}`,
                sourceId: sourceNode.id,
                sourceName: sourceNode.name,
                sourceClassification: sourceNode.classification,
                sourceCampusName: sourceNode.campusName,
                sourceProfileHref: sourceNode.profileHref,
                targetId: targetNode.id,
                targetName: targetNode.name,
                targetClassification: targetNode.classification,
                targetCampusName: targetNode.campusName,
                targetProfileHref: targetNode.profileHref,
                weight: edge.weight,
                relationKinds: relations.length,
                totalRelationEvents:
                    explicitRelationEvents > 0
                        ? explicitRelationEvents
                        : edge.weight,
                relations,
            } satisfies PersonInteractionTableRow;
        })
        .filter((row): row is PersonInteractionTableRow => row !== null)
        .sort((left, right) => {
            if (right.weight !== left.weight) {
                return right.weight - left.weight;
            }

            if (right.totalRelationEvents !== left.totalRelationEvents) {
                return right.totalRelationEvents - left.totalRelationEvents;
            }

            if (right.relationKinds !== left.relationKinds) {
                return right.relationKinds - left.relationKinds;
            }

            return left.targetName.localeCompare(right.targetName, "pt-BR");
        });
};

/**
 * Serializes a table row's relation types for the `data-relation-types` attribute read by the
 * graph filter script. The separator stays a bare comma because the consumer splits on `,` and
 * normalizes each token itself, so the SVG edges and the table rows stay interchangeable inputs
 * for the same matcher.
 */
export const serializeRelationTypesAttribute = (
    row: PersonInteractionTableRow,
): string => row.relations.map((relation) => relation.type).join(",");
