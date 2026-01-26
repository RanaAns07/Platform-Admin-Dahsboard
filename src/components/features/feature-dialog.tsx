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

// Form schema - Backend only accepts: key, description, data_type
const featureSchema = z.object({
    key: z
        .string()
        .min(2, "Key must be at least 2 characters")
        .max(100, "Key must be less than 100 characters")
        .regex(
            /^[a-z][a-z0-9_]*$/,
            "Key must start with a letter and contain only lowercase letters, numbers, and underscores"
        ),
    description: z.string().optional(),
    data_type: z.enum(["bool", "int", "string"]),
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
            key: feature?.key || "",
            description: feature?.description || "",
            data_type: feature?.data_type || "bool",
        },
    });

    // Reset form when feature changes
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset({
                key: "",
                description: "",
                data_type: "bool",
            });
        } else if (feature) {
            form.reset({
                key: feature.key,
                description: feature.description || "",
                data_type: feature.data_type,
            });
        }
        onOpenChange(newOpen);
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
                            name="key"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Feature Key</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., max_members"
                                            {...field}
                                            disabled={isEditing}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Unique identifier for this feature (e.g., max_members, api_access)
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
                            name="data_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Data Type</FormLabel>
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
                                            <SelectItem value="bool">
                                                Boolean (On/Off)
                                            </SelectItem>
                                            <SelectItem value="int">
                                                Integer (Numeric limit)
                                            </SelectItem>
                                            <SelectItem value="string">
                                                String (Text value)
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Determines how the feature value is stored
                                    </FormDescription>
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
