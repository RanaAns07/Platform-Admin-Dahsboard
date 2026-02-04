"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSetOverride } from "@/hooks/use-tenants";
import { useFeatures } from "@/hooks/use-features";
import { Tenant, Feature, ApiError } from "@/types";
import { Loader2, Settings, Zap } from "lucide-react";
import { toast } from "sonner";

interface ManageOverridesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenant: Tenant | null;
}

export function ManageOverridesDialog({ open, onOpenChange, tenant }: ManageOverridesDialogProps) {
    const setOverride = useSetOverride();
    const { data: features, isLoading: featuresLoading } = useFeatures();
    const [selectedFeatureId, setSelectedFeatureId] = useState<string>("");
    const [overrideValue, setOverrideValue] = useState<string | number | boolean>("");

    // Find selected feature to determine input type
    const selectedFeature = (features?.results || []).find(f => f.id === selectedFeatureId);

    const handleFeatureChange = (id: string) => {
        setSelectedFeatureId(id);
        const feature = (features?.results || []).find(f => f.id === id);
        if (feature) {
            if (feature.data_type === "bool") {
                setOverrideValue(false);
            } else if (feature.data_type === "int") {
                setOverrideValue(0);
            } else {
                setOverrideValue("");
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant || !selectedFeatureId || !selectedFeature) return;

        try {
            await setOverride.mutateAsync({
                tenantId: tenant.id,
                featureId: selectedFeatureId,
                value: overrideValue,
            });
            toast.success(`Override set for ${selectedFeature.key}`);
            // Reset or keep? Let's keep so they can tweak it if needed
        } catch (error) {
            const apiError = error as ApiError;
            const errorMessage = apiError?.message || "Failed to set override";
            toast.error(errorMessage);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-orange-500" />
                        Manage Feature Overrides
                    </DialogTitle>
                    <DialogDescription>
                        Customize specific feature entitlements for <strong>{tenant?.name}</strong>.
                        These override the plan defaults.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Feature Selection */}
                    <div className="space-y-2">
                        <Label>Select Feature to Override</Label>
                        <Select
                            value={selectedFeatureId}
                            onValueChange={handleFeatureChange}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a feature..." />
                            </SelectTrigger>
                            <SelectContent>
                                {featuresLoading ? (
                                    <div className="p-2 flex justify-center">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                ) : (
                                    (features?.results || []).map((f) => (
                                        <SelectItem key={f.id} value={f.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{f.key}</span>
                                                <span className="text-xs text-muted-foreground uppercase bg-muted px-1 rounded">
                                                    {f.data_type}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Current Overrides Section */}
                    {tenant?.feature_overrides && tenant.feature_overrides.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground font-semibold">Current Active Overrides</Label>
                            <div className="border rounded-md divide-y overflow-hidden max-h-[150px] overflow-y-auto">
                                {tenant.feature_overrides.map((override) => (
                                    <div key={override.id} className="p-2 text-sm flex justify-between items-center bg-card">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{override.feature_key}</span>
                                            <span className="text-xs text-muted-foreground">Value: {String(override.value)}</span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleFeatureChange(override.feature)}
                                        >
                                            Edit
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Entitlements Section (from list response) */}
                    {tenant?.entitlements && Object.keys(tenant.entitlements).length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-xs uppercase text-muted-foreground font-semibold">Active Entitlements</Label>
                            <div className="border rounded-md divide-y overflow-hidden max-h-[150px] overflow-y-auto">
                                {Object.entries(tenant.entitlements).map(([key, value]) => (
                                    <div key={key} className="p-2 text-sm flex justify-between items-center bg-card">
                                        <div className="flex flex-col">
                                            <span className="font-medium">{key}</span>
                                            <span className="text-xs text-muted-foreground">Value: {String(value)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {selectedFeature && (
                        <form onSubmit={handleSubmit} className="p-4 border rounded-lg bg-muted/20 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap className="h-4 w-4 text-purple-500" />
                                <span className="font-medium">{selectedFeature.key}</span>
                            </div>

                            {selectedFeature.description && (
                                <p className="text-sm text-muted-foreground mb-4">
                                    {selectedFeature.description}
                                </p>
                            )}

                            <div className="space-y-2">
                                <Label>Override Value</Label>
                                {selectedFeature.data_type === "bool" ? (
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            name="value"
                                            id="feature-value"
                                            checked={overrideValue as boolean}
                                            onCheckedChange={(checked) => setOverrideValue(checked)}
                                        />
                                        <label htmlFor="feature-value" className="text-sm text-muted-foreground">
                                            Enable this feature
                                        </label>
                                    </div>
                                ) : selectedFeature.data_type === "int" ? (
                                    <Input
                                        type="number"
                                        name="value"
                                        placeholder="Enter numeric limit (e.g. 10)"
                                        value={overrideValue as number}
                                        onChange={(e) => setOverrideValue(parseInt(e.target.value, 10))}
                                        required
                                    />
                                ) : (
                                    <Input
                                        type="text"
                                        name="value"
                                        placeholder="Enter value"
                                        value={overrideValue as string}
                                        onChange={(e) => setOverrideValue(e.target.value)}
                                        required
                                    />
                                )}
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={setOverride.isPending}
                                >
                                    {setOverride.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Save Override
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
