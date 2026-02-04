"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
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
import { Separator } from "@/components/ui/separator";
import { usePlans } from "@/hooks/use-plans";
import { useCreateTenant } from "@/hooks/use-tenants";
import {
    Building2,
    User,
    CreditCard,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Eye,
    EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ApiError } from "@/types";

// Form schema
const wizardSchema = z.object({
    gym_name: z
        .string()
        .min(2, "Gym name must be at least 2 characters")
        .max(100, "Gym name must be less than 100 characters"),
    subdomain: z
        .string()
        .min(3, "Subdomain must be at least 3 characters")
        .max(50, "Subdomain must be less than 50 characters")
        .regex(
            /^[a-z0-9-]+$/,
            "Subdomain can only contain lowercase letters, numbers, and hyphens"
        ),
    owner_email: z.string().email("Please enter a valid email address"),
    owner_password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirm_password: z.string(),
    initial_plan_id: z.string().min(1, "Please select a plan"),
    branding: z.object({
        primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").optional().or(z.literal("")),
        secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").optional().or(z.literal("")),
        logo_url: z.string().url("Invalid URL").optional().or(z.literal("")),
        font_family: z.string().optional().or(z.literal("")),
    }).optional(),
}).refine((data) => data.owner_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});

type WizardFormValues = z.infer<typeof wizardSchema>;

interface OnboardingWizardProps {
    onClose: () => void;
}

const steps = [
    { id: 1, title: "Gym Details", icon: Building2 },
    { id: 2, title: "Branding", icon: Eye }, // New branding step
    { id: 3, title: "Owner Account", icon: User },
    { id: 4, title: "Select Plan", icon: CreditCard },
    { id: 5, title: "Review", icon: CheckCircle2 },
];

export function OnboardingWizard({ onClose }: OnboardingWizardProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { data: plans, isLoading: plansLoading } = usePlans();
    const createTenant = useCreateTenant();

    const form = useForm<WizardFormValues>({
        resolver: zodResolver(wizardSchema),
        defaultValues: {
            gym_name: "",
            subdomain: "",
            owner_email: "",
            owner_password: "",
            confirm_password: "",
            initial_plan_id: "",
            branding: {
                primary_color: "#f97316",
                secondary_color: "#1e293b",
                logo_url: "",
                font_family: "Inter",
            },
        },
        mode: "onChange",
    });

    const watchedValues = form.watch();

    // Generate subdomain from gym name
    const generateSubdomain = (gymName: string) => {
        return gymName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .slice(0, 50);
    };

    // Validate current step before proceeding
    const validateStep = async () => {
        let fieldsToValidate: (keyof WizardFormValues)[] = [];

        switch (currentStep) {
            case 1:
                fieldsToValidate = ["gym_name", "subdomain"];
                break;
            case 2:
                fieldsToValidate = ["branding.primary_color", "branding.secondary_color", "branding.logo_url", "branding.font_family"];
                break;
            case 3:
                fieldsToValidate = ("owner_email", "owner_password", "confirm_password" as any);
                break;
            case 4:
                fieldsToValidate = ["initial_plan_id"];
                break;
        }

        const result = await form.trigger(fieldsToValidate as any);
        return result;
    };

    const handleNext = async () => {
        const isValid = await validateStep();
        if (isValid && currentStep < 5) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const onSubmit = async (values: WizardFormValues) => {
        try {
            await createTenant.mutateAsync({
                gym_name: values.gym_name,
                subdomain: values.subdomain,
                owner_email: values.owner_email,
                owner_password: values.owner_password,
                initial_plan_id: values.initial_plan_id,
                branding: values.branding,
            });
            toast.success("Tenant created successfully!");
            onClose();
        } catch (error) {
            const apiError = error as ApiError;
            const errorMessage = apiError?.message || "Failed to create tenant. Please try again.";
            console.error("Failed to create tenant:", errorMessage);
            toast.error(errorMessage);
        }
    };

    const selectedPlan = (plans?.results || []).find(
        (p) => p.id.toString() === watchedValues.initial_plan_id
    );

    return (
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-6 pb-4">
                <DialogTitle className="text-xl">Add New Tenant</DialogTitle>
                <DialogDescription>
                    Complete the wizard to onboard a new gym to the platform.
                </DialogDescription>
            </DialogHeader>

            {/* Step Indicators */}
            <div className="px-6">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const Icon = step.icon;
                        const isActive = currentStep === step.id;
                        const isCompleted = currentStep > step.id;

                        return (
                            <div key={step.id} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div
                                        className={cn(
                                            "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                                            isActive
                                                ? "border-orange-500 bg-orange-500 text-white"
                                                : isCompleted
                                                    ? "border-orange-500 bg-orange-500/10 text-orange-500"
                                                    : "border-muted-foreground/30 text-muted-foreground"
                                        )}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle2 className="h-5 w-5" />
                                        ) : (
                                            <Icon className="h-5 w-5" />
                                        )}
                                    </div>
                                    <span
                                        className={cn(
                                            "text-xs mt-1.5 font-medium",
                                            isActive
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "w-full h-0.5 mx-2 mt-[-20px]",
                                            isCompleted ? "bg-orange-500" : "bg-muted-foreground/30"
                                        )}
                                        style={{ width: "60px" }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <Separator className="mt-6" />

            {/* Form Content */}
            <div className="p-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Step 1: Gym Details */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-fade-in">
                                <FormField
                                    control={form.control}
                                    name="gym_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gym Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Elite Fitness Center"
                                                    {...field}
                                                    onChange={(e) => {
                                                        field.onChange(e);
                                                        const subdomain = generateSubdomain(e.target.value);
                                                        form.setValue("subdomain", subdomain);
                                                    }}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                The official name of the gym
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="subdomain"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Subdomain</FormLabel>
                                            <FormControl>
                                                <div className="flex items-center">
                                                    <Input
                                                        placeholder="elite-fitness"
                                                        className="rounded-r-none"
                                                        {...field}
                                                    />
                                                    <span className="px-3 py-2 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground">
                                                        .forwardthinkingfitness.com
                                                    </span>
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                The unique URL for this gym&apos;s portal
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Step 2: Branding */}
                        {currentStep === 2 && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="branding.primary_color"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Primary Color</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-2">
                                                        <Input type="color" {...field} className="w-12 p-1 h-10" />
                                                        <Input placeholder="#f97316" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="branding.secondary_color"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Secondary Color</FormLabel>
                                                <FormControl>
                                                    <div className="flex gap-2">
                                                        <Input type="color" {...field} className="w-12 p-1 h-10" />
                                                        <Input placeholder="#1e293b" {...field} />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="branding.logo_url"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Logo URL</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="https://example.com/logo.png"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Direct link to the gym&apos;s logo image
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="branding.font_family"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Font Family</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a font" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Inter">Inter</SelectItem>
                                                    <SelectItem value="Roboto">Roboto</SelectItem>
                                                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                                                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Step 3: Owner Account */}
                        {currentStep === 3 && (
                            <div className="space-y-4 animate-fade-in">
                                <FormField
                                    control={form.control}
                                    name="owner_email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Owner Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="owner@example.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                The gym owner will use this email to log in
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="owner_password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        {...field}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormDescription>
                                                At least 8 characters, 1 uppercase letter, and 1 number
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirm_password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        placeholder="••••••••"
                                                        {...field}
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {/* Step 4: Select Plan */}
                        {currentStep === 4 && (
                            <div className="space-y-4 animate-fade-in">
                                <FormField
                                    control={form.control}
                                    name="initial_plan_id"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Select Plan</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Choose a subscription plan" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {plansLoading ? (
                                                        <div className="flex items-center justify-center p-4">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        </div>
                                                    ) : (
                                                        (plans?.results || []).map((plan) => (
                                                            <SelectItem
                                                                key={plan.id}
                                                                value={plan.id.toString()}
                                                            >
                                                                <div className="flex items-center justify-between w-full">
                                                                    <span>{plan.name}</span>
                                                                    <span className="text-muted-foreground ml-2">
                                                                        ${plan.price}/{plan.billing_cycle}
                                                                    </span>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription>
                                                The initial subscription plan for this gym
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {selectedPlan && (
                                    <div className="p-4 rounded-lg bg-muted/50 border">
                                        <p className="font-medium">{selectedPlan.name}</p>
                                        <p className="text-2xl font-bold mt-1">
                                            ${selectedPlan.price}
                                            <span className="text-sm font-normal text-muted-foreground">
                                                /{selectedPlan.billing_cycle}
                                            </span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 5: Review */}
                        {currentStep === 5 && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="rounded-lg border divide-y">
                                    <div className="p-4">
                                        <p className="text-sm text-muted-foreground">Gym Name</p>
                                        <p className="font-medium">{watchedValues.gym_name}</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-muted-foreground">Subdomain</p>
                                        <p className="font-medium">
                                            {watchedValues.subdomain}.forwardthinkingfitness.com
                                        </p>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-muted-foreground">Branding</p>
                                        <div className="flex gap-2 mt-1">
                                            <div className="w-6 h-6 rounded border" style={{ backgroundColor: watchedValues.branding?.primary_color }} title="Primary Color" />
                                            <div className="w-6 h-6 rounded border" style={{ backgroundColor: watchedValues.branding?.secondary_color }} title="Secondary Color" />
                                            <span className="text-sm">{watchedValues.branding?.font_family}</span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-muted-foreground">Owner Email</p>
                                        <p className="font-medium">{watchedValues.owner_email}</p>
                                    </div>
                                    <div className="p-4">
                                        <p className="text-sm text-muted-foreground">Plan</p>
                                        <p className="font-medium">
                                            {selectedPlan?.name} - $
                                            {selectedPlan?.price}/{selectedPlan?.billing_cycle}
                                        </p>
                                    </div>
                                </div>

                                {createTenant.isError && (
                                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                                        {createTenant.error instanceof Error ? createTenant.error.message : "Failed to create tenant. Please try again."}
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </Form>
            </div>

            <Separator />

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={handleBack}
                    disabled={currentStep === 1}
                >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                {currentStep < 5 ? (
                    <Button type="button" onClick={handleNext}>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={form.handleSubmit(onSubmit)}
                        className="gradient-primary text-white"
                        disabled={createTenant.isPending}
                    >
                        {createTenant.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Create Tenant
                            </>
                        )}
                    </Button>
                )}
            </div>
        </DialogContent>
    );
}
