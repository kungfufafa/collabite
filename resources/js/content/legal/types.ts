export type LegalSection = {
    id: string;
    title: string;
    paragraphs: string[];
    listItems?: string[];
};

export type LegalDocument = {
    title: string;
    description: string;
    lastUpdated: string;
    sections: LegalSection[];
};
