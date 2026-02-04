import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Feature, PaginatedResponse } from '@/types';

// Query keys
export const featureKeys = {
    all: ['features'] as const,
    lists: () => [...featureKeys.all, 'list'] as const,
    detail: (id: string) => [...featureKeys.all, 'detail', id] as const,
};

// Fetch all features
export function useFeatures() {
    return useQuery({
        queryKey: featureKeys.lists(),
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Feature> | Feature[]>('/v1/platform/features/');
            // Handle both paginated and non-paginated responses
            if ('results' in response.data) {
                return {
                    results: response.data.results,
                    total: response.data.count
                };
            }
            return {
                results: response.data,
                total: response.data.length
            };
        },
    });
}

// Fetch single feature
export function useFeature(id: string) {
    return useQuery({
        queryKey: featureKeys.detail(id),
        queryFn: async () => {
            const response = await api.get<Feature>(`/v1/platform/features/${id}/`);
            return response.data;
        },
        enabled: !!id,
    });
}

// Create feature payload type - Backend only accepts: key, description, data_type
export interface CreateFeaturePayload {
    key: string;
    description?: string;
    data_type: 'bool' | 'int' | 'string';
}

// Create feature mutation
export function useCreateFeature() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateFeaturePayload) => {
            const response = await api.post<Feature>('/v1/platform/features/', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
        },
    });
}

// Update feature mutation
export function useUpdateFeature() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<CreateFeaturePayload> }) => {
            const response = await api.patch<Feature>(`/v1/platform/features/${id}/`, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: featureKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
        },
    });
}

// Delete feature mutation
export function useDeleteFeature() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/v1/platform/features/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
        },
    });
}
