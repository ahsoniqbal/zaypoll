export type CategoryDto = {
    id: number;
    name: string;
    slug: string;
    iconUrl: string | null;
    // createdAt: Date | string;
};

export type TopicDto = {
    id: number;
    name: string;
    slug: string;
    iconUrl: string | null;
    parentId?: number | null;
    parentName?: string | null;
    parentSlug?: string | null;
    childCount?: number;
};
