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
import { useCreatePlan, useUpdatePlan } from "@/hooks/use-plans";
import { Plan, ApiError } from "@/types";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

// Form schema - Backend only accepts: name, price, billing_cycle, is_public
const planSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name must be less than 100 characters"),
    price: z
        .string()
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Price must be a valid positive number"),
    billing_cycle: z.enum(["monthly", "quarterly", "yearly"]),
    is_public: z.boolean(),
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
    const isEditing = !!plan;

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: plan?.name || "",
            price: plan?.price?.toString() || "0",
            billing_cycle: plan?.billing_cycle || "monthly",
            is_public: plan?.is_public ?? true,
        },
    });

    // Reset form when plan changes
    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset({
                name: "",
                price: "0",
                billing_cycle: "monthly",
                is_public: true,
            });
        } else if (plan) {
            form.reset({
                name: plan.name,
                price: plan.price?.toString() || "0",
                billing_cycle: plan.billing_cycle,
                is_public: plan.is_public,
            });
        }
        onOpenChange(newOpen);
    };

    const onSubmit = async (values: PlanFormValues) => {
        try {
            const payload = {
                ...values,
                price: Number(values.price),
            };

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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <CreditCard className="h-5 w-5 text-emerald-500" />
                        </div>
                        {isEditing ? "Edit Plan" : "Create Plan"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the plan details below."
                            : "Add a new subscription plan to the platform."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            disabled={isEditing}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Unique identifier for this plan
                                    </FormDescription>
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
                                <FormItem>
                                    <FormLabel>Visibility</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(value === "true")}
                                        value={field.value ? "true" : "false"}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select visibility" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="true">Public</SelectItem>
                                            <SelectItem value="false">Private</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Public plans are visible to new tenants
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
