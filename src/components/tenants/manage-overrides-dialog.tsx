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
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
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

    // Find selected feature to determine input type
    const selectedFeature = features?.find(f => f.id === selectedFeatureId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tenant || !selectedFeatureId || !selectedFeature) return;

        const formData = new FormData(e.target as HTMLFormElement);
        let value: string | number | boolean = formData.get("value") as string;

        // Parse value based on feature type
        if (selectedFeature.data_type === "bool") {
            // For switch/checkbox, existence in formData might differ based on impl, 
            // but let's assume we handle it via state or check the form element
            // simpler to use controlled state for complex forms, but here we can try:
            const form = e.target as HTMLFormElement;
            const switchInput = form.querySelector('[name="value"]') as HTMLInputElement;
            value = switchInput?.checked || false;
        } else if (selectedFeature.data_type === "int") {
            value = parseInt(value, 10);
            if (isNaN(value)) {
                toast.error("Please enter a valid number");
                return;
            }
        }

        try {
            await setOverride.mutateAsync({
                tenantId: tenant.id,
                featureId: selectedFeatureId,
                value: value,
            });
            toast.success(`Override set for ${selectedFeature.key}`);
            // Don't close immediately, allow setting more
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
                            onValueChange={setSelectedFeatureId}
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
                                    features?.map((f) => (
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
                                <FormLabel>Override Value</FormLabel>
                                {selectedFeature.data_type === "bool" ? (
                                    <div className="flex items-center space-x-2">
                                        <Switch name="value" id="feature-value" />
                                        <label htmlFor="feature-value" className="text-sm text-muted-foreground">
                                            Enable this feature
                                        </label>
                                    </div>
                                ) : selectedFeature.data_type === "int" ? (
                                    <Input
                                        type="number"
                                        name="value"
                                        placeholder="Enter numeric limit (e.g. 10)"
                                        required
                                    />
                                ) : (
                                    <Input
                                        type="text"
                                        name="value"
                                        placeholder="Enter value"
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
