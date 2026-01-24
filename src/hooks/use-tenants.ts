import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Tenant, CreateTenantPayload, PaginatedResponse } from '@/types';

// Query keys
export const tenantKeys = {
    all: ['tenants'] as const,
    lists: () => [...tenantKeys.all, 'list'] as const,
    list: (filters: string) => [...tenantKeys.lists(), { filters }] as const,
    details: () => [...tenantKeys.all, 'detail'] as const,
    detail: (id: number) => [...tenantKeys.details(), id] as const,
};

// Fetch all tenants
export function useTenants() {
    return useQuery({
        queryKey: tenantKeys.lists(),
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Tenant> | Tenant[]>('/v1/platform/tenants/');
            // Handle both paginated and non-paginated responses
            if ('results' in response.data) {
                return response.data.results;
            }
            return response.data;
        },
    });
}

// Fetch single tenant
export function useTenant(id: number) {
    return useQuery({
        queryKey: tenantKeys.detail(id),
        queryFn: async () => {
            const response = await api.get<Tenant>(`/v1/platform/tenants/${id}/`);
            return response.data;
        },
        enabled: !!id,
    });
}

// Create tenant mutation
export function useCreateTenant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateTenantPayload) => {
            const response = await api.post<Tenant>('/v1/platform/tenants/', data);
            return response.data;
        },
        onSuccess: () => {
            // Invalidate and refetch tenants list
            queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
        },
    });
}

// Assign plan to tenant
export function useAssignPlan() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ tenantId, planId }: { tenantId: number; planId: number }) => {
            const response = await api.post(`/v1/platform/tenants/${tenantId}/assign_plan/`, {
                plan_id: planId,
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.detail(variables.tenantId) });
            queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
        },
    });
}

// Set feature override
export function useSetOverride() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            tenantId,
            featureCode,
            enabled,
            limitValue
        }: {
            tenantId: number;
            featureCode: string;
            enabled: boolean;
            limitValue?: number;
        }) => {
            const response = await api.post(`/v1/platform/tenants/${tenantId}/set_override/`, {
                feature_code: featureCode,
                enabled,
                limit_value: limitValue,
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.detail(variables.tenantId) });
        },
    });
}
