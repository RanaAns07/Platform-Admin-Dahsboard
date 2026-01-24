import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plan, PaginatedResponse } from '@/types';

// Query keys
export const planKeys = {
    all: ['plans'] as const,
    lists: () => [...planKeys.all, 'list'] as const,
    detail: (id: number) => [...planKeys.all, 'detail', id] as const,
};

// Fetch all plans
export function usePlans() {
    return useQuery({
        queryKey: planKeys.lists(),
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Plan> | Plan[]>('/v1/platform/plans/');
            // Handle both paginated and non-paginated responses
            if ('results' in response.data) {
                return response.data.results;
            }
            return response.data;
        },
    });
}

// Fetch single plan
export function usePlan(id: number) {
    return useQuery({
        queryKey: planKeys.detail(id),
        queryFn: async () => {
            const response = await api.get<Plan>(`/v1/platform/plans/${id}/`);
            return response.data;
        },
        enabled: !!id,
    });
}

// Create plan payload type
export interface CreatePlanPayload {
    name: string;
    display_name: string;
    price: number;
    billing_cycle: 'monthly' | 'yearly' | 'one_time';
    description?: string;
    is_active: boolean;
}

// Create plan mutation
export function useCreatePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreatePlanPayload) => {
            const response = await api.post<Plan>('/v1/platform/plans/', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
        },
    });
}

// Update plan mutation
export function useUpdatePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<CreatePlanPayload> }) => {
            const response = await api.patch<Plan>(`/v1/platform/plans/${id}/`, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
        },
    });
}

// Delete plan mutation
export function useDeletePlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await api.delete(`/v1/platform/plans/${id}/`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: planKeys.lists() });
        },
    });
}
