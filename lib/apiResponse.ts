// lib/apiResponse.ts
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export const createSuccessResponse = <T>(data: T): ApiResponse<T> => ({
    success: true,
    data,
});

export const createErrorResponse = (error: string): ApiResponse => ({
    success: false,
    error,
});
