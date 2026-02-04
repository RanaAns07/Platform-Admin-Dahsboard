import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Tenant, CreateTenantPayload, UpdateTenantPayload, PaginatedResponse } from '@/types';

// Query keys
export const tenantKeys = {
    all: ['tenants'] as const,
    lists: () => [...tenantKeys.all, 'list'] as const,
    list: (filters: string) => [...tenantKeys.lists(), { filters }] as const,
    details: () => [...tenantKeys.all, 'detail'] as const,
    detail: (id: string) => [...tenantKeys.details(), id] as const,
};

// Fetch all tenants
export function useTenants() {
    return useQuery({
        queryKey: tenantKeys.lists(),
        queryFn: async () => {
            const response = await api.get<PaginatedResponse<Tenant> | Tenant[]>('/v1/platform/tenants/');
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

// Fetch single tenant
export function useTenant(id: string) {
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
        mutationFn: async ({ tenantId, planId }: { tenantId: string; planId: string }) => {
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
            featureId,
            value,
            expiresAt
        }: {
            tenantId: string;
            featureId: string;
            value: boolean | number | string;
            expiresAt?: string;
        }) => {
            const response = await api.post(`/v1/platform/tenants/${tenantId}/set_override/`, {
                feature_id: featureId,
                value,
                expires_at: expiresAt || new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            });
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.detail(variables.tenantId) });
            queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
        },
    });
}

// Update tenant mutation
export function useUpdateTenant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: string; data: UpdateTenantPayload }) => {
            const response = await api.patch<Tenant>(`/v1/platform/tenants/${id}/`, data);
            return response.data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
        },
    });
}

// Delete tenant mutation
export function useDeleteTenant() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            console.log(`Deleting tenant with ID: ${id}`);
            const url = `/v1/platform/tenants/${id}/`;
            console.log(`Final delete URL: ${url}`);
            await api.delete(url);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tenantKeys.lists() });
        },
    });
}
