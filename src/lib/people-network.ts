export type PeopleGraphKind = "collaboration" | "relationship";

export type PeopleGraphClassification =
    | "student"
    | "researcher"
    | "outside_ifes"
    | "null"
    | null;

export type PeopleGraphClassificationKey =
    | "student"
    | "researcher"
    | "outside_ifes"
    | "null";

interface PeopleGraphRankingEntryRaw {
    id: string | number;
    name: string;
    classification?: PeopleGraphClassification;
    weighted_degree?: number;
    degree?: number;
    degree_centrality?: number;
    campus_name?: string | null;
}

interface PeopleGraphNodeRaw {
    id: string | number;
    name: string;
    classification?: PeopleGraphClassification;
    weighted_degree?: number;
    degree?: number;
    degree_centrality?: number;
    campus_name?: string | null;
}

export interface PeopleGraphRawFile {
    metadata: {
        scope: {
            type?: string;
            graph_type?: PeopleGraphKind;
        };
        weight_definition?: string;
    };
    graph_stats: {
        nodes?: number;
        edges?: number;
        isolated_nodes?: number;
        connected_components?: number;
        largest_component_size?: number;
        relation_event_totals?: Record<string, number | undefined>;
        classification_distribution?: Record<string, number | undefined>;
        top_people_by_weighted_degree?: PeopleGraphRankingEntryRaw[];
        top_hubs_by_degree_centrality?: PeopleGraphRankingEntryRaw[];
        complex_network_metrics?: {
            density?: number;
            average_clustering?: number;
            transitivity?: number;
            assortativity_by_classification?: number | null;
            community_count?: number;
            largest_community_size?: number;
            modularity?: number | null;
            hub_count?: number;
            articulation_point_count?: number;
            bridge_edge_count?: number;
        };
    };
    graph?: {
        nodes?: PeopleGraphNodeRaw[];
    };
}

export interface PeopleNetworkBadge {
    label: string;
    value: number;
}

export interface PeopleNetworkPerson {
    id: string;
    name: string;
    classification: PeopleGraphClassification;
    classificationKey: PeopleGraphClassificationKey;
    campusName: string | null;
    weightedDegree: number;
    degree: number;
    degreeCentrality: number | null;
    profileHref: string | null;
}

export interface PeopleNetworkGraphSummary {
    kind: PeopleGraphKind;
    title: string;
    description: string;
    weightDefinition: string;
    nodeCount: number;
    edgeCount: number;
    isolatedNodeCount: number | null;
    connectedComponentCount: number;
    largestComponentSize: number | null;
    largestComponentShare: number | null;
    density: number | null;
    averageClustering: number | null;
    transitivity: number | null;
    assortativityByClassification: number | null;
    communityCount: number | null;
    largestCommunitySize: number | null;
    modularity: number | null;
    hubCount: number | null;
    articulationPointCount: number | null;
    bridgeEdgeCount: number | null;
    relationTotals: PeopleNetworkBadge[];
    classificationDistribution: PeopleNetworkBadge[];
    topResearchers: PeopleNetworkPerson[];
    topHubs: PeopleNetworkPerson[];
    topByClassification: Record<PeopleGraphClassificationKey, PeopleNetworkPerson[]>;
}

export interface PeopleNetworkOverviewViewModel {
    collaboration: PeopleNetworkGraphSummary;
    relationship: PeopleNetworkGraphSummary;
    topCollaborators: PeopleNetworkPerson[];
    topConnectors: PeopleNetworkPerson[];
}

interface BuildPeopleNetworkOverviewOptions {
    baseUrl?: string;
}

const relationLabels: Record<string, string> = {
    orientation: "Orientações",
    advisorship: "Orientações",
    project: "Projetos",
    article: "Artigos",
    initiative: "Iniciativas",
    research_group: "Grupos de pesquisa",
};

const classificationLabels: Record<string, string> = {
    researcher: "Pesquisadores",
    student: "Estudantes",
    outside_ifes: "Externos ao Ifes",
    null: "Sem classificação",
};

export const peopleClassificationLabels: Record<
    PeopleGraphClassificationKey,
    string
> = {
    researcher: "Pesquisadores",
    student: "Estudantes",
    outside_ifes: "Externos ao Ifes",
    null: "Sem classificação",
};

/**
 * Reads an optional numeric stat. Fields missing from the export must stay `null` so the interface
 * can tell "not measured" apart from a measured zero — coercing them with `?? 0` renders absent
 * data as a confident number.
 */
const toOptionalNumber = (value: number | undefined | null): number | null =>
    typeof value === "number" && Number.isFinite(value) ? value : null;

const normalizeBaseUrl = (baseUrl = "/") => {
    const normalized = baseUrl.trim() || "/";
    return normalized.endsWith("/") ? normalized : `${normalized}/`;
};

const toClassificationKey = (
    classification: PeopleGraphClassification,
): PeopleGraphClassificationKey =>
    classification && classification !== "null" ? classification : "null";

const resolveProfileHref = (
    id: string | number,
    classification: PeopleGraphClassification,
    baseUrl = "/",
) => {
    const personId = String(id ?? "").trim();
    if (!personId) return null;

    const prefix = classification === "student" ? "students" : "researchers";
    return `${normalizeBaseUrl(baseUrl)}${prefix}/${personId}`;
};

const isValidPersonName = (name: string) => {
    const normalized = name.trim().toLowerCase();
    return normalized.length > 0 && !normalized.startsWith("ui-");
};

const toSortedBadges = (
    record: Record<string, number | undefined> | undefined,
    labels: Record<string, string>,
) =>
    Object.entries(record ?? {})
        .map(([key, value]) => ({
            label: labels[key] ?? key.replaceAll("_", " "),
            value: Number(value ?? 0),
        }))
        .filter((item) => item.value > 0)
        .sort((left, right) => right.value - left.value);

const normalizeRanking = (
    entries: PeopleGraphRankingEntryRaw[] | undefined,
    baseUrl: string,
) =>
    (entries ?? [])
        .filter(
            (entry) =>
                entry.classification === "researcher" &&
                isValidPersonName(entry.name),
        )
        .map((entry) => ({
            id: String(entry.id),
            name: entry.name,
            classification: entry.classification ?? null,
            classificationKey: toClassificationKey(entry.classification ?? null),
            campusName: entry.campus_name ?? null,
            weightedDegree: Number(entry.weighted_degree ?? 0),
            degree: Number(entry.degree ?? 0),
            degreeCentrality:
                typeof entry.degree_centrality === "number"
                    ? entry.degree_centrality
                    : null,
            profileHref: resolveProfileHref(
                entry.id,
                entry.classification ?? null,
                baseUrl,
            ),
        }));

const createClassificationRankings = () => ({
    researcher: [],
    student: [],
    outside_ifes: [],
    null: [],
}) as Record<PeopleGraphClassificationKey, PeopleNetworkPerson[]>;

const sortPeopleByStrength = (left: PeopleNetworkPerson, right: PeopleNetworkPerson) => {
    if (right.weightedDegree !== left.weightedDegree) {
        return right.weightedDegree - left.weightedDegree;
    }

    if (right.degree !== left.degree) {
        return right.degree - left.degree;
    }

    return left.name.localeCompare(right.name, "pt-BR");
};

const normalizeNode = (
    entry: PeopleGraphNodeRaw,
    baseUrl: string,
): PeopleNetworkPerson => ({
    id: String(entry.id),
    name: entry.name,
    classification: entry.classification ?? null,
    classificationKey: toClassificationKey(entry.classification ?? null),
    campusName: entry.campus_name ?? null,
    weightedDegree: Number(entry.weighted_degree ?? 0),
    degree: Number(entry.degree ?? 0),
    degreeCentrality:
        typeof entry.degree_centrality === "number" ? entry.degree_centrality : null,
    profileHref: resolveProfileHref(
        entry.id,
        entry.classification ?? null,
        baseUrl,
    ),
});

const buildClassificationTopLists = (
    nodes: PeopleGraphNodeRaw[] | undefined,
    baseUrl: string,
) => {
    const rankings = createClassificationRankings();

    (nodes ?? [])
        .filter((node) => isValidPersonName(node.name))
        .map((node) => normalizeNode(node, baseUrl))
        .filter((node) => node.weightedDegree > 0)
        .forEach((node) => {
            rankings[node.classificationKey].push(node);
        });

    (
        Object.keys(rankings) as PeopleGraphClassificationKey[]
    ).forEach((classificationKey) => {
        rankings[classificationKey] = rankings[classificationKey]
            .sort(sortPeopleByStrength)
            .slice(0, 5);
    });

    return rankings;
};

const buildGraphSummary = (
    rawGraph: PeopleGraphRawFile,
    kind: PeopleGraphKind,
    baseUrl: string,
): PeopleNetworkGraphSummary => {
    const stats = rawGraph.graph_stats;
    const networkMetrics = stats.complex_network_metrics ?? {};
    const nodeCount = Number(stats.nodes ?? 0);
    const largestComponentSize = toOptionalNumber(stats.largest_component_size);

    return {
        kind,
        title:
            kind === "collaboration"
                ? "Rede de colaboração"
                : "Rede de relacionamento",
        description:
            kind === "collaboration"
                ? "Colaborações explícitas por projeto, artigo e orientação."
                : "Vínculos mais amplos por iniciativas, grupos, artigos e orientações.",
        weightDefinition: rawGraph.metadata.weight_definition ?? "",
        nodeCount,
        edgeCount: Number(stats.edges ?? 0),
        isolatedNodeCount: toOptionalNumber(stats.isolated_nodes),
        connectedComponentCount: Number(stats.connected_components ?? 0),
        largestComponentSize,
        largestComponentShare:
            largestComponentSize !== null && nodeCount > 0
                ? largestComponentSize / nodeCount
                : null,
        density:
            typeof networkMetrics.density === "number"
                ? networkMetrics.density
                : null,
        averageClustering:
            typeof networkMetrics.average_clustering === "number"
                ? networkMetrics.average_clustering
                : null,
        transitivity:
            typeof networkMetrics.transitivity === "number"
                ? networkMetrics.transitivity
                : null,
        assortativityByClassification:
            typeof networkMetrics.assortativity_by_classification === "number"
                ? networkMetrics.assortativity_by_classification
                : null,
        communityCount:
            typeof networkMetrics.community_count === "number"
                ? networkMetrics.community_count
                : null,
        largestCommunitySize:
            typeof networkMetrics.largest_community_size === "number"
                ? networkMetrics.largest_community_size
                : null,
        modularity:
            typeof networkMetrics.modularity === "number"
                ? networkMetrics.modularity
                : null,
        hubCount:
            typeof networkMetrics.hub_count === "number"
                ? networkMetrics.hub_count
                : null,
        articulationPointCount:
            typeof networkMetrics.articulation_point_count === "number"
                ? networkMetrics.articulation_point_count
                : null,
        bridgeEdgeCount:
            typeof networkMetrics.bridge_edge_count === "number"
                ? networkMetrics.bridge_edge_count
                : null,
        relationTotals: toSortedBadges(stats.relation_event_totals, relationLabels),
        classificationDistribution: toSortedBadges(
            stats.classification_distribution,
            classificationLabels,
        ),
        topResearchers: normalizeRanking(
            stats.top_people_by_weighted_degree,
            baseUrl,
        ),
        topHubs: normalizeRanking(stats.top_hubs_by_degree_centrality, baseUrl),
        topByClassification: buildClassificationTopLists(
            rawGraph.graph?.nodes,
            baseUrl,
        ),
    };
};

export const buildPeopleNetworkOverview = (
    collaborationGraph: PeopleGraphRawFile,
    relationshipGraph: PeopleGraphRawFile,
    options: BuildPeopleNetworkOverviewOptions = {},
): PeopleNetworkOverviewViewModel => {
    const baseUrl = normalizeBaseUrl(options.baseUrl);
    const collaboration = buildGraphSummary(
        collaborationGraph,
        "collaboration",
        baseUrl,
    );
    const relationship = buildGraphSummary(
        relationshipGraph,
        "relationship",
        baseUrl,
    );

    return {
        collaboration,
        relationship,
        topCollaborators: collaboration.topResearchers.slice(0, 10),
        topConnectors: relationship.topHubs.slice(0, 10),
    };
};
