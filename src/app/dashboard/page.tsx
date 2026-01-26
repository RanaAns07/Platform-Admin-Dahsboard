"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CreditCard, Users, Zap } from "lucide-react";
import { useTenants } from "@/hooks/use-tenants";
import { usePlans } from "@/hooks/use-plans";
import { useFeatures } from "@/hooks/use-features";
import { useAuth } from "@/contexts/auth-context";

export default function DashboardPage() {
    const { user } = useAuth();
    const { data: tenants, isLoading: tenantsLoading } = useTenants();
    const { data: plans, isLoading: plansLoading } = usePlans();
    const { data: features, isLoading: featuresLoading } = useFeatures();

    const stats = [
        {
            title: "Total Tenants",
            value: tenantsLoading ? "..." : tenants?.length || 0,
            description: "Registered gyms on the platform",
            icon: <Building2 className="h-5 w-5" />,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: "Active Tenants",
            value: tenantsLoading
                ? "..."
                : tenants?.filter((t) => t.current_subscription?.status === 'active').length || 0,
            description: "Currently active subscriptions",
            icon: <Users className="h-5 w-5" />,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
        },
        {
            title: "Available Plans",
            value: plansLoading ? "..." : plans?.length || 0,
            description: "Subscription plans offered",
            icon: <CreditCard className="h-5 w-5" />,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            title: "Total Features",
            value: featuresLoading ? "..." : features?.length || 0,
            description: "Platform capabilities available",
            icon: <Zap className="h-5 w-5" />,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold tracking-tight">
                    Welcome back, {user?.first_name || "Admin"}! 👋
                </h2>
                <p className="text-muted-foreground">
                    Here&apos;s an overview of your platform&apos;s performance today.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <span className={stat.color}>{stat.icon}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <CardDescription className="text-xs">
                                {stat.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <CardDescription>
                            Common tasks for platform management
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <a
                            href="/dashboard/tenants"
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Building2 className="h-4 w-4 text-orange-500" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Add New Tenant</p>
                                <p className="text-xs text-muted-foreground">
                                    Onboard a new gym to the platform
                                </p>
                            </div>
                        </a>
                        <a
                            href="/dashboard/plans"
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <CreditCard className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                                <p className="font-medium text-sm">Manage Plans</p>
                                <p className="text-xs text-muted-foreground">
                                    View and edit subscription plans
                                </p>
                            </div>
                        </a>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Platform Status</CardTitle>
                        <CardDescription>System health and notifications</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <div>
                                <p className="font-medium text-sm text-emerald-700 dark:text-emerald-400">
                                    All Systems Operational
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Last checked: Just now
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-lg bg-muted/50 text-center">
                                <p className="text-2xl font-bold text-foreground">99.9%</p>
                                <p className="text-xs text-muted-foreground">Uptime</p>
                            </div>
                            <div className="p-3 rounded-lg bg-muted/50 text-center">
                                <p className="text-2xl font-bold text-foreground">45ms</p>
                                <p className="text-xs text-muted-foreground">Avg Response</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
