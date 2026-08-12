import attributeAssertionsCanonical from "../data/attribute_assertions_canonical.json";
import ingestionRunsCanonical from "../data/ingestion_runs_canonical.json";
import sourceRecordsCanonical from "../data/source_records_canonical.json";

export type CanonicalEntityType =
    | "academic_education"
    | "advisorship"
    | "article"
    | "initiative"
    | "knowledge_area"
    | "research_group"
    | "researcher";

interface AttributeAssertionRecord {
    source_record_id: number;
    canonical_entity_type: CanonicalEntityType;
    canonical_entity_id: number | string;
    attribute_name: string;
    is_selected: boolean;
    selection_reason: string | null;
    asserted_at: string | null;
}

interface SourceRecord {
    id: number;
    ingestion_run_id: number | null;
    source_system: string;
    source_entity_type: string;
    source_record_id: string;
    source_file: string | null;
    source_path: string | null;
    raw_payload_json?: Record<string, unknown> | null;
    extracted_at: string | null;
}

interface IngestionRun {
    id: number;
    source_system: string;
    flow_name: string | null;
}

export interface ProvenanceSource {
    key: string;
    sourceRecordId: number;
    sourceSystem: string;
    sourceSystemLabel: string;
    sourceEntityType: string;
    sourceEntityLabel: string;
    sourceFile: string | null;
    sourcePath: string | null;
    sourceLabel: string;
    sourceUrl: string | null;
    sourceRecordKey: string;
    assertedAt: string | null;
    extractedAt: string | null;
    selectionReason: string | null;
    flowName: string | null;
}

interface EntitySourceReference {
    entityType: CanonicalEntityType;
    entityId: string | number | null | undefined;
    attributeNames?: string[];
}

export interface ProvenanceFieldDefinition extends EntitySourceReference {
    label: string;
    description?: string;
    entities?: EntitySourceReference[];
}

export interface ProvenanceField {
    label: string;
    description?: string;
    sources: ProvenanceSource[];
}

export interface InlineSourceItem {
    key: string;
    systemLabel: string;
    sourceLabel: string;
    sourceUrl: string | null;
    title: string;
}

const attributeAssertions = attributeAssertionsCanonical as AttributeAssertionRecord[];
const ingestionRuns = ingestionRunsCanonical as IngestionRun[];

const sourceRecords = sourceRecordsCanonical as SourceRecord[];

const sourceSystemLabels: Record<string, string> = {
    cnpq_sync: "CNPq",
    lattes_advisorships: "Lattes",
    lattes_projects: "Lattes",
    sigpesq_advisorships: "SigPesq",
    sigpesq_research_group: "SigPesq",
    sigpesq_research_projects: "SigPesq",
};

const sourceEntityLabels: Record<string, string> = {
    academic_education: "Formacao Academica",
    advisorship: "Orientacao",
    article: "Artigo",
    cnpq_group_member: "Membro CNPq",
    cnpq_group_payload: "Grupo CNPq",
    cnpq_research_line: "Linha CNPq",
    initiative: "Projeto",
    knowledge_area: "Area de Conhecimento",
    research_group: "Grupo de Pesquisa",
    researcher: "Pesquisador",
    researcher_profile: "Perfil Lattes",
};

const sourceRecordById = new Map<number, SourceRecord>(
    sourceRecords.map((record) => [record.id, record]),
);
const ingestionRunById = new Map<number, IngestionRun>(
    ingestionRuns.map((run) => [run.id, run]),
);

const attributeSourcesIndex = new Map<string, ProvenanceSource[]>();
const entitySourcesIndex = new Map<string, ProvenanceSource[]>();
const academicEducationSourcesByKey = new Map<string, ProvenanceSource[]>();

const makeEntityKey = (
    entityType: CanonicalEntityType,
    entityId: string | number,
) => `${entityType}:${String(entityId)}`;

const makeAttributeKey = (
    entityType: CanonicalEntityType,
    entityId: string | number,
    attributeName: string,
) => `${makeEntityKey(entityType, entityId)}:${attributeName}`;

const appendUnique = (
    index: Map<string, ProvenanceSource[]>,
    key: string,
    source: ProvenanceSource,
) => {
    const existing = index.get(key) ?? [];

    if (!existing.some((item) => item.key === source.key)) {
        existing.push(source);
        index.set(key, existing);
    }
};

const getSourceSystemLabel = (sourceSystem: string) =>
    sourceSystemLabels[sourceSystem] || sourceSystem;

const getSourceEntityLabel = (sourceEntityType: string) =>
    sourceEntityLabels[sourceEntityType] || sourceEntityType;

const getSourceUrl = (value: string | null | undefined) => {
    if (!value) return null;
    if (!/^https?:\/\//i.test(value)) return null;
    return value;
};

const normalizeComparable = (value: unknown) =>
    String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

const buildAcademicEducationKey = (education: {
    institution?: unknown;
    degree?: unknown;
    course_name?: unknown;
    start_year?: unknown;
    end_year?: unknown;
    thesis_title?: unknown;
}) =>
    [
        normalizeComparable(education.institution),
        normalizeComparable(education.degree),
        normalizeComparable(education.course_name),
        normalizeComparable(education.start_year),
        normalizeComparable(education.end_year),
        normalizeComparable(education.thesis_title),
    ].join("|");

const getSourceLabel = (record: SourceRecord) => {
    const candidate = record.source_path || record.source_file || record.source_record_id;
    if (!candidate) return `Registro ${record.id}`;

    const sourceUrl = getSourceUrl(candidate);
    if (sourceUrl) {
        try {
            const url = new URL(sourceUrl);
            return `${url.hostname}${url.pathname}`;
        } catch {
            return sourceUrl;
        }
    }

    const chunks = candidate.split("/").filter(Boolean);
    return chunks[chunks.length - 1] || candidate;
};

const buildProvenanceSource = (
    assertion: AttributeAssertionRecord,
    sourceRecord: SourceRecord,
): ProvenanceSource => {
    const ingestionRun = sourceRecord.ingestion_run_id
        ? ingestionRunById.get(sourceRecord.ingestion_run_id)
        : undefined;

    return {
        key: `${sourceRecord.id}:${assertion.attribute_name}`,
        sourceRecordId: sourceRecord.id,
        sourceSystem: sourceRecord.source_system,
        sourceSystemLabel: getSourceSystemLabel(sourceRecord.source_system),
        sourceEntityType: sourceRecord.source_entity_type,
        sourceEntityLabel: getSourceEntityLabel(sourceRecord.source_entity_type),
        sourceFile: sourceRecord.source_file,
        sourcePath: sourceRecord.source_path,
        sourceLabel: getSourceLabel(sourceRecord),
        sourceUrl: getSourceUrl(sourceRecord.source_path || sourceRecord.source_file),
        sourceRecordKey: sourceRecord.source_record_id,
        assertedAt: assertion.asserted_at,
        extractedAt: sourceRecord.extracted_at,
        selectionReason: assertion.selection_reason,
        flowName: ingestionRun?.flow_name || null,
    };
};

attributeAssertions
    .filter((assertion) => assertion.is_selected)
    .forEach((assertion) => {
        const sourceRecord = sourceRecordById.get(assertion.source_record_id);
        if (!sourceRecord) return;

        const source = buildProvenanceSource(assertion, sourceRecord);
        const entityKey = makeEntityKey(
            assertion.canonical_entity_type,
            assertion.canonical_entity_id,
        );
        const attributeKey = makeAttributeKey(
            assertion.canonical_entity_type,
            assertion.canonical_entity_id,
            assertion.attribute_name,
        );

        appendUnique(entitySourcesIndex, entityKey, source);
        appendUnique(attributeSourcesIndex, attributeKey, source);
    });

const uniqueSources = (sources: ProvenanceSource[]) => {
    const byRecord = new Map<string, ProvenanceSource>();

    sources.forEach((source) => {
        const uniqueKey = `${source.sourceRecordId}:${source.sourceSystem}`;
        if (!byRecord.has(uniqueKey)) {
            byRecord.set(uniqueKey, source);
        }
    });

    return [...byRecord.values()];
};

const buildAcademicEducationIndex = () => {
    if (academicEducationSourcesByKey.size > 0) return;

    const academicEntityIds = [
        ...new Set(
            attributeAssertions
                .filter(
                    (assertion) =>
                        assertion.is_selected &&
                        assertion.canonical_entity_type === "academic_education",
                )
                .map((assertion) => String(assertion.canonical_entity_id)),
        ),
    ];

    academicEntityIds.forEach((entityId) => {
        const entitySources =
            entitySourcesIndex.get(makeEntityKey("academic_education", entityId)) ?? [];
        const firstSource = entitySources[0];
        if (!firstSource) return;

        const sourceRecord = sourceRecordById.get(firstSource.sourceRecordId);
        const payload = sourceRecord?.raw_payload_json;
        if (!payload || typeof payload !== "object") return;

        const key = buildAcademicEducationKey({
            institution: payload.institution,
            degree: payload.degree,
            course_name: payload.course_name,
            start_year: payload.start_year,
            end_year: payload.end_year,
            thesis_title: payload.thesis_title,
        });

        const existing = academicEducationSourcesByKey.get(key) ?? [];
        academicEducationSourcesByKey.set(
            key,
            uniqueSources([...existing, ...entitySources]),
        );
    });
};

export const getEntitySources = (
    entityType: CanonicalEntityType,
    entityId: string | number | null | undefined,
) => {
    if (entityId == null) return [];
    return entitySourcesIndex.get(makeEntityKey(entityType, entityId)) ?? [];
};

export const getAttributeSources = (
    entityType: CanonicalEntityType,
    entityId: string | number | null | undefined,
    attributeNames: string[],
) => {
    if (entityId == null || attributeNames.length === 0) return [];

    const sources = attributeNames.flatMap(
        (attributeName) =>
            attributeSourcesIndex.get(
                makeAttributeKey(entityType, entityId, attributeName),
            ) ?? [],
    );

    return uniqueSources(sources);
};

export const getAcademicEducationSources = (education: {
    institution?: unknown;
    degree?: unknown;
    course_name?: unknown;
    start_year?: unknown;
    end_year?: unknown;
    thesis_title?: unknown;
}) => {
    buildAcademicEducationIndex();
    return academicEducationSourcesByKey.get(buildAcademicEducationKey(education)) ?? [];
};

export const toInlineSourceItems = (sources: ProvenanceSource[]): InlineSourceItem[] =>
    uniqueSources(sources).map((source) => ({
        key: source.key,
        systemLabel: source.sourceSystemLabel,
        sourceLabel: source.sourceLabel,
        sourceUrl: source.sourceUrl,
        title: source.sourcePath || source.sourceFile || source.sourceRecordKey,
    }));

const resolveReferenceSources = (reference: EntitySourceReference) => {
    if (!reference.entityType || reference.entityId == null) return [];

    if (reference.attributeNames && reference.attributeNames.length > 0) {
        return getAttributeSources(
            reference.entityType,
            reference.entityId,
            reference.attributeNames,
        );
    }

    return uniqueSources(getEntitySources(reference.entityType, reference.entityId));
};

export const buildProvenanceFields = (
    definitions: ProvenanceFieldDefinition[],
): ProvenanceField[] =>
    definitions
        .map((definition) => {
            const ownSources = resolveReferenceSources(definition);
            const relatedSources = (definition.entities ?? []).flatMap(
                resolveReferenceSources,
            );

            return {
                label: definition.label,
                description: definition.description,
                sources: uniqueSources([...ownSources, ...relatedSources]),
            };
        })
        .filter((field) => field.sources.length > 0);
