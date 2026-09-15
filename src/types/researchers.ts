export interface ResearcherInitiative {
    id: string;
    name: string;
    status: string;
    role: string;
    start_date?: string | null;
    end_date?: string | null;
    initiative_type?: {
        id: string;
        name: string;
    };
}

export interface ResearcherGroup {
    id: string;
    name: string;
}

export interface ResearcherKnowledgeArea {
    id: string;
    name: string;
}

export interface ResearcherRoleEvidence {
    project_roles: string[];
    research_group_roles: string[];
    advisorship_roles: string[];
    has_institutional_email: boolean;
    academic_reference_count: number;
}

export interface AcademicEducation {
    institution: string;
    degree: string;
    course_name: string;
    start_year: string;
    end_year: string;
    thesis_title: string;
    advisor_name: string;
    co_advisor_name: string | null;
}

export interface Article {
    id: string | number;
    title: string;
    year: string | number;
    type: string;
    doi: string | null;
    journal_conference: string;
    volume?: string | null;
    pages?: string | null;
    campus?: {
        id: string | number;
        name: string;
    } | null;
}

export interface Researcher {
    id: string;
    name: string;
    identification_id?: string | null;
    birthday?: string | null;
    cnpq_url?: string | null;
    google_scholar_url?: string | null;
    resume?: string | null;
    citation_names?: string | null;
    initiatives: ResearcherInitiative[];
    research_groups: ResearcherGroup[];
    knowledge_areas: ResearcherKnowledgeArea[];
    academic_education: AcademicEducation[];
    articles: Article[];
    advisorships: ResearcherAdvisorship[];
    classification?: "student" | "researcher" | "outside_ifes" | null;
    classification_confidence?: "low" | "medium" | "high" | null;
    classification_note?: string | null;
    role_evidence?: ResearcherRoleEvidence | null;
    was_student?: boolean;
    was_staff?: boolean;
    campus?: {
        id: string | number;
        name: string;
    } | null;
}

export interface ResearcherAdvisorship {
    id: string;
    name: string;
    status: string;
    start_year: string;
    end_year: string;
    type: string;
    initiative_type: string;
    student_name: string;
}
