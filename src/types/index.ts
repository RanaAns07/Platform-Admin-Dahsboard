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
export interface TenantBranding {
    primary_color?: string;
    secondary_color?: string;
    logo_url?: string;
    font_family?: string;
}

export interface Tenant {
    id: string;
    name: string;
    gym_name?: string; // Some endpoints might use gym_name
    subdomain: string;
    branding?: TenantBranding;
    is_active: boolean;
    created_at: string;
    current_subscription?: TenantSubscription;
    feature_overrides?: FeatureOverride[];
    entitlements?: Record<string, any>;
}

export interface TenantSubscription {
    id: string;
    plan: string;
    plan_name: string;
    status: 'active' | 'past_due' | 'canceled';
    started_at: string;
    ends_at?: string;
}

export interface CreateTenantPayload {
    gym_name: string;
    subdomain: string;
    owner_email: string;
    owner_password: string;
    initial_plan_id: string;
    branding?: TenantBranding;
}

export interface UpdateTenantPayload {
    name?: string;
    gym_name?: string;
    is_active?: boolean;
    branding?: TenantBranding;
}

// Plan types
export interface Plan {
    id: string;
    name: string;
    price: string | number;
    billing_cycle: 'monthly' | 'quarterly' | 'yearly';
    is_public: boolean;
    entitlements?: PlanEntitlement[];
}

export interface PlanEntitlement {
    id: string;
    feature: string;
    feature_key: string;
    value: unknown;  // Can be boolean, number, or string based on feature data_type
}



// Feature types
export interface Feature {
    id: string;
    key: string;  // Primary identifier, no 'name' or 'code'
    description?: string;
    data_type: 'bool' | 'int' | 'string';
    created_at?: string;
}

export interface FeatureOverride {
    id: string;
    feature: string;
    feature_key: string;
    value: unknown;  // Can be boolean, number, or string
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
