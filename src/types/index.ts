// User types
export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'platform_admin' | 'tenant_admin' | 'staff' | 'member';
    is_active: boolean;
    date_joined?: string;
}

// Auth types
export interface AuthTokens {
    access: string;
    refresh: string;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: User;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

// Tenant (Gym) types
export interface Tenant {
    id: number;
    gym_name: string;
    subdomain: string;
    owner?: User;
    owner_email?: string;
    current_plan?: Plan;
    current_plan_id?: number;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
    feature_overrides?: FeatureOverride[];
}

export interface CreateTenantPayload {
    gym_name: string;
    subdomain: string;
    owner_email: string;
    owner_password: string;
    initial_plan_id: number;
}

// Plan types
export interface Plan {
    id: number;
    name: string;
    display_name: string;
    price: string | number;
    billing_cycle: 'monthly' | 'yearly' | 'one_time';
    description?: string;
    is_active: boolean;
    features?: PlanFeature[];
}

export interface PlanFeature {
    feature_id: number;
    feature_name: string;
    enabled: boolean;
    limit?: number;
}

// Feature types
export interface Feature {
    id: number;
    name: string;
    code: string;
    description?: string;
    is_active: boolean;
    feature_type: 'boolean' | 'limit' | 'tier';
}

export interface FeatureOverride {
    id: number;
    tenant_id: number;
    feature_id: number;
    feature_code: string;
    enabled: boolean;
    limit_value?: number;
    expires_at?: string;
}

// API Response types
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ApiError {
    message: string;
    detail?: string;
    errors?: Record<string, string[]>;
    status: number;
}

// Dashboard stats
export interface DashboardStats {
    total_tenants: number;
    active_tenants: number;
    total_plans: number;
    total_revenue?: number;
}
