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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { useAssignPlan } from "@/hooks/use-tenants";
import { usePlans } from "@/hooks/use-plans";
import { Tenant, ApiError } from "@/types";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

const assignPlanSchema = z.object({
    planId: z.string().min(1, "Please select a plan"),
});

type AssignPlanFormValues = z.infer<typeof assignPlanSchema>;

interface AssignPlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tenant: Tenant | null;
}

export function AssignPlanDialog({ open, onOpenChange, tenant }: AssignPlanDialogProps) {
    const assignPlan = useAssignPlan();
    const { data: plans, isLoading: plansLoading } = usePlans();

    const form = useForm<AssignPlanFormValues>({
        resolver: zodResolver(assignPlanSchema),
        defaultValues: {
            planId: "",
        },
    });

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            form.reset();
        }
        onOpenChange(newOpen);
    };

    const onSubmit = async (values: AssignPlanFormValues) => {
        if (!tenant) return;

        try {
            await assignPlan.mutateAsync({
                tenantId: tenant.id,
                planId: values.planId,
            });
            toast.success(`Plan assigned to ${tenant.name} successfully!`);
            handleOpenChange(false);
        } catch (error) {
            const apiError = error as ApiError;
            const errorMessage = apiError?.message || "Failed to assign plan";
            toast.error(errorMessage);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-purple-500" />
                        Assign Plan
                    </DialogTitle>
                    <DialogDescription>
                        Choose a new subscription plan for <strong>{tenant?.name}</strong>.
                        This will cancel their current active subscription.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="planId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Plan</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose a plan" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {plansLoading ? (
                                                <div className="flex items-center justify-center p-2">
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                </div>
                                            ) : (
                                                (plans?.results || []).map((plan) => (
                                                    <SelectItem key={plan.id} value={plan.id}>
                                                        <div className="flex justify-between items-center w-full gap-2">
                                                            <span className="font-medium">{plan.name}</span>
                                                            <span className="text-muted-foreground">
                                                                ${plan.price}/{plan.billing_cycle}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
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
                                disabled={assignPlan.isPending}
                            >
                                {assignPlan.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Assigning...
                                    </>
                                ) : (
                                    "Assign Plan"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
