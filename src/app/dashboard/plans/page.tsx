"use client";

import { useState } from "react";
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Plan } from "@/types";
import { usePlans, useDeletePlan } from "@/hooks/use-plans";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanDialog } from "@/components/plans/plan-dialog";
import {
    Plus,
    Search,
    MoreHorizontal,
    CreditCard,
    Edit,
    Trash2,
    ArrowUpDown,
    Loader2,
    Calendar,
    Zap,
} from "lucide-react";
import { ApiError } from "@/types";
import { toast } from "sonner";

const billingCycleLabels = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
};

// Billing cycle colors
const billingCycleColors = {
    monthly: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    quarterly: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    yearly: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

export default function PlansPage() {
    const { data: plans, isLoading, error } = usePlans();
    const deletePlan = useDeletePlan();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

    // Table columns definition
    const columns: ColumnDef<Plan>[] = [
        {
            accessorKey: "display_name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent px-0"
                    >
                        Plan Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                            <p className="font-medium">{row.original.name}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "price",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent px-0"
                    >
                        Price
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const price = parseFloat(row.getValue("price") || "0");
                const formatted = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                }).format(price);
                return <span className="font-semibold">{formatted}</span>;
            },
        },
        {
            accessorKey: "billing_cycle",
            header: "Billing Cycle",
            cell: ({ row }) => {
                const cycle = row.getValue("billing_cycle") as keyof typeof billingCycleLabels;
                return (
                    <Badge variant="outline" className={billingCycleColors[cycle] || ""}>
                        <Calendar className="mr-1.5 h-3 w-3" />
                        {billingCycleLabels[cycle] || cycle}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "entitlements",
            header: "Entitlements",
            cell: ({ row }) => {
                const entitlements = row.original.entitlements;
                if (!entitlements || entitlements.length === 0) {
                    return <span className="text-muted-foreground text-xs italic">No features</span>;
                }

                return (
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {entitlements.map((ent) => (
                            <Badge
                                key={ent.id}
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0 h-5 bg-purple-500/5 hover:bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400 font-medium"
                            >
                                {ent.feature_key}: {String(ent.value)}
                            </Badge>
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: "is_public",
            header: "Status",
            cell: ({ row }) => {
                const isPublic = row.getValue("is_public");
                return (
                    <Badge variant={isPublic ? "success" : "destructive"}>
                        {isPublic ? "Public" : "Private"}
                    </Badge>
                );
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const plan = row.original;
                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => {
                                    setEditingPlan(plan);
                                    setDialogOpen(true);
                                }}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Plan
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                    setPlanToDelete(plan);
                                    setDeleteDialogOpen(true);
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Plan
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: plans?.results || [],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },
    });

    const handleDeletePlan = async () => {
        if (planToDelete) {
            try {
                await deletePlan.mutateAsync(planToDelete.id);
                setDeleteDialogOpen(false);
                setPlanToDelete(null);
            } catch (error) {
                const apiError = error as ApiError;
                toast.error(apiError.message || "Failed to delete plan");
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Plans</h2>
                    <p className="text-muted-foreground">
                        Manage subscription plans for tenants
                    </p>
                </div>
                <Button
                    className="gradient-primary text-white shadow-lg shadow-orange-500/25"
                    onClick={() => {
                        setEditingPlan(null);
                        setDialogOpen(true);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Plan
                </Button>
            </div>

            {/* Data Table Card */}
            <Card className="border-none shadow-sm">
                <CardHeader className="border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">All Plans</CardTitle>
                            <CardDescription>
                                {plans?.total || 0} plans available
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search plans..."
                                value={(table.getColumn("display_name")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("display_name")?.setFilterValue(event.target.value)
                                }
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <p className="text-destructive font-medium">Error loading plans</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Please try again later
                            </p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <TableRow key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => (
                                                <TableHead key={header.id}>
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(
                                                            header.column.columnDef.header,
                                                            header.getContext()
                                                        )}
                                                </TableHead>
                                            ))}
                                        </TableRow>
                                    ))}
                                </TableHeader>
                                <TableBody>
                                    {table.getRowModel().rows?.length ? (
                                        table.getRowModel().rows.map((row) => (
                                            <TableRow
                                                key={row.id}
                                                data-state={row.getIsSelected() && "selected"}
                                            >
                                                {row.getVisibleCells().map((cell) => (
                                                    <TableCell key={cell.id}>
                                                        {flexRender(
                                                            cell.column.columnDef.cell,
                                                            cell.getContext()
                                                        )}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={columns.length}
                                                className="h-24 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center py-8">
                                                    <CreditCard className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                                    <p className="text-muted-foreground font-medium">
                                                        No plans found
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Get started by adding your first plan
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-6 py-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                                    {table.getPageCount() || 1}
                                </p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.previousPage()}
                                        disabled={!table.getCanPreviousPage()}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => table.nextPage()}
                                        disabled={!table.getCanNextPage()}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Plan Dialog */}
            <PlanDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setEditingPlan(null);
                }}
                plan={editingPlan}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{planToDelete?.name}&quot;?
                            This action cannot be undone and may affect tenants using this plan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeletePlan}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deletePlan.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
