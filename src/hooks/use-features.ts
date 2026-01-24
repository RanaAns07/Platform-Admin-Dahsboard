import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Feature, PaginatedResponse } from '@/types';

// Query keys
export const featureKeys = {
    all: ['features'] as const,
    lists: () => [...featureKeys.all, 'list'] as const,
    detail: (id: number) => [...featureKeys.all, 'detail', id] as const,
};

// Fetch all features
export function useFeatures() {
    return useQuery({
        queryKey: featureKeys.lists(),
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Feature> | Feature[]>('/v1/platform/features/');
            // Handle both paginated and non-paginated responses
            if ('results' in response.data) {
                return response.data.results;
            }
            return response.data;
        },
    });
}

// Fetch single feature
export function useFeature(id: number) {
    return useQuery({
        queryKey: featureKeys.detail(id),
        queryFn: async () => {
            const response = await api.get<Feature>(`/v1/platform/features/${id}/`);
            return response.data;
        },
        enabled: !!id,
    });
}

// Create feature payload type
export interface CreateFeaturePayload {
    name: string;
    code: string;
    description?: string;
    feature_type: 'boolean' | 'limit' | 'tier';
    is_active: boolean;
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
        mutationFn: async ({ id, data }: { id: number; data: Partial<CreateFeaturePayload> }) => {
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
        mutationFn: async (id: number) => {
            await api.delete(`/v1/platform/features/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: featureKeys.lists() });
        },
    });
}
