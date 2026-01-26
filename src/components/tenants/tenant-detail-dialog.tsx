"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tenant } from "@/types";
import {
    Building2,
    Calendar,
    CreditCard,
    Settings,
    Shield,
    Mail,
    Globe,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { AssignPlanDialog } from "./assign-plan-dialog";
import { ManageOverridesDialog } from "./manage-overrides-dialog";

interface TenantDetailDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenant: Tenant | null;
}

export function TenantDetailDialog({ open, onOpenChange, tenant }: TenantDetailDialogProps) {
    const [assignPlanOpen, setAssignPlanOpen] = useState(false);
    const [overridesOpen, setOverridesOpen] = useState(false);

    if (!tenant) return null;

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <Building2 className="h-5 w-5 text-orange-500" />
                            </div>
                            {tenant.name}
                        </DialogTitle>
                        <DialogDescription className="text-base">
                            {tenant.subdomain}.forwardthinkingfitness.com
                        </DialogDescription>
                    </DialogHeader>

                    <Tabs defaultValue="overview" className="mt-4">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="subscription">Subscription & Features</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Gym Name</label>
                                    <p className="font-medium">{tenant.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Subdomain</label>
                                    <p className="font-medium text-sm font-mono bg-muted px-2 py-1 rounded inline-block">
                                        {tenant.subdomain}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Status</label>
                                    <div>
                                        <Badge variant={tenant.is_active ? "success" : "destructive"}>
                                            {tenant.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">Created At</label>
                                    <p className="text-sm">
                                        {new Date(tenant.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {tenant.branding && Object.keys(tenant.branding).length > 0 && (
                                <div className="mt-6 border-t pt-4">
                                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <Shield className="h-4 w-4" /> Branding Configuration
                                    </h4>
                                    <div className="bg-muted/30 p-3 rounded-md text-sm font-mono overflow-auto max-h-40">
                                        <pre>{JSON.stringify(tenant.branding, null, 2)}</pre>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="subscription" className="space-y-6 py-4">
                            {/* Current Plan Card */}
                            <div className="p-4 border rounded-lg bg-card shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="h-4 w-4 text-purple-500" />
                                        <span className="font-semibold">Current Plan</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAssignPlanOpen(true)}
                                    >
                                        Change Plan
                                    </Button>
                                </div>

                                {tenant.current_subscription ? (
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-2xl font-bold">{tenant.current_subscription.plan_name}</span>
                                            <Badge variant={
                                                tenant.current_subscription.status === 'active' ? 'success' : 'default'
                                            }>
                                                {tenant.current_subscription.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Started: {new Date(tenant.current_subscription.started_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted-foreground">
                                        <p>No active subscription</p>
                                    </div>
                                )}
                            </div>

                            {/* Feature Overrides */}
                            <div className="p-4 border rounded-lg bg-card shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <Settings className="h-4 w-4 text-orange-500" />
                                        <span className="font-semibold">Feature Overrides</span>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setOverridesOpen(true)}
                                    >
                                        Manage Overrides
                                    </Button>
                                </div>

                                <p className="text-sm text-muted-foreground mb-2">
                                    Custom entitlements specific to this tenant.
                                </p>
                                {/* We can't list them here easily without extra data fetching, 
                                    so we rely on the manage dialog to see them. 
                                    Or we could assume they are part of the tenant object if backend sends them.
                                    The Tenant type has 'feature_overrides' optional, but let's check index.ts */}
                            </div>
                        </TabsContent>
                    </Tabs>

                    <div className="flex justify-end pt-4 border-t mt-4">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AssignPlanDialog
                open={assignPlanOpen}
                onOpenChange={setAssignPlanOpen}
                tenant={tenant}
            />

            <ManageOverridesDialog
                open={overridesOpen}
                onOpenChange={setOverridesOpen}
                tenant={tenant}
            />
        </>
    );
}
