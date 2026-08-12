import initiativesCanonical from "../data/initiatives_canonical.json";
import advisorshipsCanonical from "../data/advisorships_canonical.json";
import researchGroupsCanonical from "../data/research_groups_canonical.json";
import type {
    StudentInteractionNamedRelationItem,
    StudentInteractionRelationType,
} from "../types/student-graphs";

interface CanonicalInitiativeTeamMember {
    person_id?: string | number | null;
    start_date?: string | null;
    end_date?: string | null;
}

interface CanonicalInitiativeRecord {
    id: string | number;
    name?: string | null;
    initiative_type?: {
        name?: string | null;
    } | null;
    team?: CanonicalInitiativeTeamMember[] | null;
}

interface CanonicalAdvisorshipItem {
    id: string | number;
    name?: string | null;
    person_id?: string | number | null;
    supervisor_id?: string | number | null;
}

interface CanonicalAdvisorshipProject {
    id: string | number;
    name?: string | null;
    advisorships?: CanonicalAdvisorshipItem[] | null;
}

interface CanonicalResearchGroupMember {
    id: string | number;
    start_date?: string | null;
    end_date?: string | null;
}

interface CanonicalResearchGroup {
    id: string | number;
    name?: string | null;
    members?: CanonicalResearchGroupMember[] | null;
}

type RelationDetailBucket = Partial<
    Record<StudentInteractionRelationType, StudentInteractionNamedRelationItem[]>
>;

const initiatives = initiativesCanonical as CanonicalInitiativeRecord[];
const advisorshipProjects =
    advisorshipsCanonical as CanonicalAdvisorshipProject[];
const researchGroups = researchGroupsCanonical as CanonicalResearchGroup[];

let relationDetailIndex: Map<string, RelationDetailBucket> | null = null;

const isFilledValue = (value: string | null | undefined) => {
    const trimmedValue = value?.trim();
    return Boolean(
        trimmedValue &&
            trimmedValue !== "None" &&
            trimmedValue !== "null",
    );
};

const normalizeId = (value: string | number | null | undefined) => {
    const normalizedValue = String(value ?? "").trim();
    return normalizedValue ? normalizedValue : null;
};

const normalizeName = (value: string | null | undefined) =>
    isFilledValue(value) ? value!.trim() : null;

const normalizeDateValue = (value: string | null | undefined) => {
    if (!isFilledValue(value)) return null;

    let normalizedValue = value!.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
        normalizedValue = `${normalizedValue}T00:00:00`;
    } else {
        normalizedValue = normalizedValue.replace(" ", "T");
        normalizedValue = normalizedValue.replace(/\.\d+$/, "");
    }

    const timestamp = new Date(normalizedValue).getTime();

    return Number.isFinite(timestamp) ? timestamp : null;
};

const intervalsOverlap = (
    leftStart: string | null | undefined,
    leftEnd: string | null | undefined,
    rightStart: string | null | undefined,
    rightEnd: string | null | undefined,
) => {
    const normalizedLeftStart =
        normalizeDateValue(leftStart) ?? Number.NEGATIVE_INFINITY;
    const normalizedLeftEnd =
        normalizeDateValue(leftEnd) ?? Number.POSITIVE_INFINITY;
    const normalizedRightStart =
        normalizeDateValue(rightStart) ?? Number.NEGATIVE_INFINITY;
    const normalizedRightEnd =
        normalizeDateValue(rightEnd) ?? Number.POSITIVE_INFINITY;

    return (
        normalizedLeftStart <= normalizedRightEnd &&
        normalizedRightStart <= normalizedLeftEnd
    );
};

const toPairKey = (
    leftId: string | number | null | undefined,
    rightId: string | number | null | undefined,
) => {
    const normalizedLeftId = normalizeId(leftId);
    const normalizedRightId = normalizeId(rightId);

    if (
        !normalizedLeftId ||
        !normalizedRightId ||
        normalizedLeftId === normalizedRightId
    ) {
        return null;
    }

    return normalizedLeftId < normalizedRightId
        ? `${normalizedLeftId}::${normalizedRightId}`
        : `${normalizedRightId}::${normalizedLeftId}`;
};

const appendRelationDetail = (
    index: Map<string, RelationDetailBucket>,
    leftId: string | number | null | undefined,
    rightId: string | number | null | undefined,
    relationType: StudentInteractionRelationType,
    item: StudentInteractionNamedRelationItem,
) => {
    const pairKey = toPairKey(leftId, rightId);

    if (!pairKey || !normalizeName(item.name)) {
        return;
    }

    const bucket = index.get(pairKey) ?? {};
    const items = bucket[relationType] ?? [];

    if (!items.some((existingItem) => existingItem.id === item.id)) {
        items.push(item);
        items.sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));
        bucket[relationType] = items;
        index.set(pairKey, bucket);
    }
};

const buildInitiativeRelationIndex = (
    index: Map<string, RelationDetailBucket>,
) => {
    initiatives.forEach((initiative) => {
        const initiativeName = normalizeName(initiative.name);
        const team = initiative.team ?? [];

        if (!initiativeName || team.length < 2) {
            return;
        }

        const initiativeTypeName = normalizeName(
            initiative.initiative_type?.name ?? null,
        );
        const relationTypes: StudentInteractionRelationType[] = [];

        if (initiativeTypeName && initiativeTypeName !== "Advisorship") {
            relationTypes.push("initiative");
        }

        if (initiativeTypeName === "Research Project") {
            relationTypes.push("project");
        }

        if (relationTypes.length === 0) {
            return;
        }

        for (let leftIndex = 0; leftIndex < team.length; leftIndex += 1) {
            const leftMember = team[leftIndex];
            const leftMemberId = normalizeId(leftMember.person_id);

            if (!leftMemberId) {
                continue;
            }

            for (
                let rightIndex = leftIndex + 1;
                rightIndex < team.length;
                rightIndex += 1
            ) {
                const rightMember = team[rightIndex];
                const rightMemberId = normalizeId(rightMember.person_id);

                if (
                    !rightMemberId ||
                    !intervalsOverlap(
                        leftMember.start_date,
                        leftMember.end_date,
                        rightMember.start_date,
                        rightMember.end_date,
                    )
                ) {
                    continue;
                }

                relationTypes.forEach((relationType) => {
                    appendRelationDetail(
                        index,
                        leftMemberId,
                        rightMemberId,
                        relationType,
                        {
                            id: String(initiative.id),
                            name: initiativeName,
                        },
                    );
                });
            }
        }
    });
};

const buildAdvisorshipRelationIndex = (
    index: Map<string, RelationDetailBucket>,
) => {
    advisorshipProjects.forEach((project) => {
        (project.advisorships ?? []).forEach((advisorship) => {
            const advisorshipName =
                normalizeName(advisorship.name) ?? normalizeName(project.name);
            const studentId = normalizeId(advisorship.person_id);
            const supervisorId = normalizeId(advisorship.supervisor_id);

            if (!advisorshipName || !studentId || !supervisorId) {
                return;
            }

            const relationItem = {
                id: String(advisorship.id),
                name: advisorshipName,
            } satisfies StudentInteractionNamedRelationItem;

            appendRelationDetail(
                index,
                studentId,
                supervisorId,
                "orientation",
                relationItem,
            );
            appendRelationDetail(
                index,
                studentId,
                supervisorId,
                "advisorship",
                relationItem,
            );
        });
    });
};

const buildResearchGroupRelationIndex = (
    index: Map<string, RelationDetailBucket>,
) => {
    researchGroups.forEach((group) => {
        const groupName = normalizeName(group.name);
        const members = group.members ?? [];

        if (!groupName || members.length < 2) {
            return;
        }

        for (let leftIndex = 0; leftIndex < members.length; leftIndex += 1) {
            const leftMember = members[leftIndex];
            const leftMemberId = normalizeId(leftMember.id);

            if (!leftMemberId) {
                continue;
            }

            for (
                let rightIndex = leftIndex + 1;
                rightIndex < members.length;
                rightIndex += 1
            ) {
                const rightMember = members[rightIndex];
                const rightMemberId = normalizeId(rightMember.id);

                if (
                    !rightMemberId ||
                    !intervalsOverlap(
                        leftMember.start_date,
                        leftMember.end_date,
                        rightMember.start_date,
                        rightMember.end_date,
                    )
                ) {
                    continue;
                }

                appendRelationDetail(
                    index,
                    leftMemberId,
                    rightMemberId,
                    "research_group",
                    {
                        id: String(group.id),
                        name: groupName,
                    },
                );
            }
        }
    });
};

const getRelationDetailIndex = () => {
    if (relationDetailIndex) {
        return relationDetailIndex;
    }

    const nextIndex = new Map<string, RelationDetailBucket>();

    buildInitiativeRelationIndex(nextIndex);
    buildAdvisorshipRelationIndex(nextIndex);
    buildResearchGroupRelationIndex(nextIndex);

    relationDetailIndex = nextIndex;

    return relationDetailIndex;
};

export const getPersonPairNamedRelationItems = (
    leftId: string | number | null | undefined,
    rightId: string | number | null | undefined,
    relationType: StudentInteractionRelationType,
): StudentInteractionNamedRelationItem[] => {
    const pairKey = toPairKey(leftId, rightId);

    if (!pairKey) {
        return [];
    }

    return getRelationDetailIndex().get(pairKey)?.[relationType] ?? [];
};
