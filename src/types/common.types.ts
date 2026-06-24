export type ActionResponse<T = null> = {
    success: boolean;
    message: string;
    data?: T;
};


export type PagedResponse<T> = {
    data: T[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
};
