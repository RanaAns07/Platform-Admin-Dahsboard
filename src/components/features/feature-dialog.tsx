"use client";

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
import { useCreateFeature, useUpdateFeature } from "@/hooks/use-features";
import { Feature, ApiError } from "@/types";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

// Form schema
const featureSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),
    code: z
        .string()
        .min(2, "Code must be at least 2 characters")
        .max(50, "Code must be less than 50 characters")
        .regex(
            /^[a-z][a-z0-9_]*$/,
            "Code must start with a letter and contain only lowercase letters, numbers, and underscores"
        ),
    description: z.string().optional(),
    feature_type: z.enum(["boolean", "limit", "tier"]),
    is_active: z.boolean(),
});

type FeatureFormValues = z.infer<typeof featureSchema>;

interface FeatureDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    feature?: Feature | null;
}

export function FeatureDialog({ open, onOpenChange, feature }: FeatureDialogProps) {
    const createFeature = useCreateFeature();
    const updateFeature = useUpdateFeature();
    const isEditing = !!feature;

    const form = useForm<FeatureFormValues>({
        resolver: zodResolver(featureSchema),
        defaultValues: {
            name: feature?.name || "",
            code: feature?.code || "",
            description: feature?.description || "",
            feature_type: feature?.feature_type || "boolean",
            is_active: feature?.is_active ?? true,
        },
    });

    // Reset form when feature changes
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset({
                name: "",
                code: "",
                description: "",
                feature_type: "boolean",
                is_active: true,
            });
        } else if (feature) {
            form.reset({
                name: feature.name,
                code: feature.code,
                description: feature.description || "",
                feature_type: feature.feature_type,
                is_active: feature.is_active,
            });
        }
        onOpenChange(newOpen);
    };

    // Generate code from name
    const generateCode = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s_]/g, "")
            .replace(/\s+/g, "_")
            .slice(0, 50);
    };

    const onSubmit = async (values: FeatureFormValues) => {
        try {
            if (isEditing && feature) {
                await updateFeature.mutateAsync({
                    id: feature.id,
                    data: values,
                });
                toast.success("Feature updated successfully!");
            } else {
                await createFeature.mutateAsync(values);
                toast.success("Feature created successfully!");
            }
            handleOpenChange(false);
        } catch (error) {
            const apiError = error as ApiError;
            const errorMessage = apiError?.message || "Failed to save feature. Please try again.";
            console.error("Failed to save feature:", errorMessage);
            toast.error(errorMessage);
        }
    };

    const isPending = createFeature.isPending || updateFeature.isPending;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Zap className="h-5 w-5 text-purple-500" />
                        </div>
                        {isEditing ? "Edit Feature" : "Create Feature"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the feature details below."
                            : "Add a new feature to the platform."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Feature Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Custom Branding"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                if (!isEditing) {
                                                    const code = generateCode(e.target.value);
                                                    form.setValue("code", code);
                                                }
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Feature Code</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="custom_branding"
                                            {...field}
                                            disabled={isEditing}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Unique identifier used in the codebase
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Brief description of the feature"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="feature_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Feature Type</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="boolean">
                                                Boolean (On/Off)
                                            </SelectItem>
                                            <SelectItem value="limit">
                                                Limit (Numeric)
                                            </SelectItem>
                                            <SelectItem value="tier">
                                                Tier (Level-based)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Determines how the feature is configured
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        value={field.value ? "true" : "false"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true">Active</SelectItem>
                                            <SelectItem value="false">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="gradient-primary text-white"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {isEditing ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    <>{isEditing ? "Update Feature" : "Create Feature"}</>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
