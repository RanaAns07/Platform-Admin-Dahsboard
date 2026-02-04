"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { useCreatePlan, useUpdatePlan } from "@/hooks/use-plans";
import { useFeatures } from "@/hooks/use-features";
import { Plan, ApiError } from "@/types";
import { Loader2, CreditCard, Plus, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

// Form schema - Backend accepts: name, price, billing_cycle, is_public, entitlements
// Relaxing fields for update box as requested
const planSchema = z.object({
    name: z
        .string()
        .max(100, "Name must be less than 100 characters")
        .optional(),
    price: z
        .string()
        .optional(),
    billing_cycle: z.enum(["monthly", "quarterly", "yearly"]).optional(),
    is_public: z.boolean().optional(),
    entitlements: z.array(z.object({
        feature: z.string().min(1, "Feature is required"),
        value: z.any()
    })).optional(),
});

type PlanFormValues = z.infer<typeof planSchema>;

interface PlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    plan?: Plan | null;
}

export function PlanDialog({ open, onOpenChange, plan }: PlanDialogProps) {
    const createPlan = useCreatePlan();
    const updatePlan = useUpdatePlan();
    const { data: featuresData } = useFeatures();
    const features = featuresData?.results || [];
    const isEditing = !!plan;

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: "",
            price: "0",
            billing_cycle: "monthly",
            is_public: true,
            entitlements: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "entitlements",
    });

    // Reset form when plan changes
    useEffect(() => {
        if (open && plan) {
            form.reset({
                name: plan.name,
                price: plan.price?.toString() || "0",
                billing_cycle: plan.billing_cycle,
                is_public: plan.is_public,
                entitlements: plan.entitlements?.map(e => ({
                    feature: e.feature,
                    value: e.value
                })) || [],
            });
        } else if (!open) {
            form.reset({
                name: "",
                price: "0",
                billing_cycle: "monthly",
                is_public: true,
                entitlements: [],
            });
        }
    }, [open, plan, form]);

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen);
    };

    const onSubmit = async (values: PlanFormValues) => {
        try {
            if (!isEditing && (!values.name || !values.price)) {
                toast.error("Name and price are required for new plans.");
                return;
            }

            // Build payload with only provided values to support partial updates
            const payload: any = {};
            if (values.name?.trim()) payload.name = values.name;
            if (values.price !== undefined && values.price !== "") payload.price = Number(values.price);
            if (values.billing_cycle) payload.billing_cycle = values.billing_cycle;
            if (values.is_public !== undefined) payload.is_public = values.is_public;

            if (values.entitlements) {
                payload.entitlements = values.entitlements.map((e: { feature: string; value: any }) => {
                    const feature = features.find(f => f.id === e.feature);
                    let val = e.value;
                    if (feature?.data_type === 'int') val = Number(val);
                    if (feature?.data_type === 'bool') val = val === true || val === 'true';
                    return {
                        feature: e.feature,
                        value: val
                    };
                });
            }

            // Ensure name is present for creation if not provided by accident
            if (!isEditing && !payload.name) {
                toast.error("Plan name is required.");
                return;
            }

            if (isEditing && plan) {
                await updatePlan.mutateAsync({
                    id: plan.id,
                    data: payload,
                });
                toast.success("Plan updated successfully!");
            } else {
                await createPlan.mutateAsync(payload);
                toast.success("Plan created successfully!");
            }
            handleOpenChange(false);
        } catch (error) {
            const apiError = error as ApiError;
            const errorMessage = apiError?.message || "Failed to save plan. Please try again.";
            console.error("Failed to save plan:", errorMessage);
            toast.error(errorMessage);
        }
    };

    const isPending = createPlan.isPending || updatePlan.isPending;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <CreditCard className="h-5 w-5 text-emerald-500" />
                        </div>
                        {isEditing ? "Edit Plan" : "Create Plan"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the plan details and entitlements below."
                            : "Add a new subscription plan with specific entitlements."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Plan Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Basic, Pro, Enterprise"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="price"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price ($)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder="99.99"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="billing_cycle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Billing Cycle</FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select cycle" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="quarterly">Quarterly</SelectItem>
                                                    <SelectItem value="yearly">Yearly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="is_public"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                        <div className="space-y-0.5">
                                            <FormLabel>Public Visibility</FormLabel>
                                            <FormDescription>
                                                Make this plan visible to all new tenants.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-purple-500" />
                                    <h3 className="font-semibold">Entitlements</h3>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ feature: "", value: false })}
                                    className="h-8"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Feature
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => {
                                    const selectedFeatureId = form.watch(`entitlements.${index}.feature`);
                                    const selectedFeature = features.find(f => f.id === selectedFeatureId);

                                    return (
                                        <div key={field.id} className="flex gap-3 items-start group">
                                            <div className="flex-1 grid grid-cols-2 gap-3 p-3 rounded-lg border bg-muted/30">
                                                <FormField
                                                    control={form.control}
                                                    name={`entitlements.${index}.feature`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <Select
                                                                onValueChange={(val) => {
                                                                    field.onChange(val);
                                                                    const feat = features.find(f => f.id === val);
                                                                    const defaultValue = feat?.data_type === 'bool' ? false : (feat?.data_type === 'int' ? 0 : "");
                                                                    form.setValue(`entitlements.${index}.value`, defaultValue);
                                                                }}
                                                                value={field.value}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Select feature" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    {features.map((f) => {
                                                                        const isAlreadyInPlan = plan?.entitlements?.some(e => e.feature === f.id);
                                                                        const isSelectedElsewhere = fields.some((ef, i) => ef.feature === f.id && i !== index);

                                                                        return (
                                                                            <SelectItem
                                                                                key={f.id}
                                                                                value={f.id}
                                                                                disabled={isSelectedElsewhere}
                                                                            >
                                                                                <div className="flex items-center justify-between w-full gap-2">
                                                                                    <span>{f.key}</span>
                                                                                    {isAlreadyInPlan && (
                                                                                        <span className="text-[10px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded-full font-medium">
                                                                                            Included
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </SelectItem>
                                                                        );
                                                                    })}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name={`entitlements.${index}.value`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-col justify-center">
                                                            <FormControl>
                                                                {selectedFeature?.data_type === 'bool' ? (
                                                                    <div className="flex items-center gap-2 h-10 px-3 border rounded-md bg-background">
                                                                        <Switch
                                                                            checked={field.value === true || field.value === 'true'}
                                                                            onCheckedChange={field.onChange}
                                                                        />
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {field.value ? 'Enabled' : 'Disabled'}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <Input
                                                                        type={selectedFeature?.data_type === 'int' ? 'number' : 'text'}
                                                                        placeholder="Value"
                                                                        {...field}
                                                                        onChange={(e) => {
                                                                            const val = selectedFeature?.data_type === 'int' ? Number(e.target.value) : e.target.value;
                                                                            field.onChange(val);
                                                                        }}
                                                                        value={field.value ?? ""}
                                                                    />
                                                                )}
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                className="mt-3 h-9 w-9 text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    );
                                })}

                                {fields.length === 0 && (
                                    <div className="text-center py-6 border-2 border-dashed rounded-lg bg-muted/10">
                                        <p className="text-sm text-muted-foreground">No entitlements added yet.</p>
                                        <Button
                                            type="button"
                                            variant="link"
                                            size="sm"
                                            onClick={() => append({ feature: "", value: false })}
                                            className="mt-1"
                                        >
                                            Add your first feature
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-background py-2">
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
                                    <>{isEditing ? "Update Plan" : "Create Plan"}</>
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
