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
import { Tenant } from "@/types";
import { useTenants } from "@/hooks/use-tenants";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { OnboardingWizard } from "@/components/tenants/onboarding-wizard";
import {
    Plus,
    Search,
    MoreHorizontal,
    Building2,
    Eye,
    CreditCard,
    Settings,
    ArrowUpDown,
    Loader2,
    Trash2,
} from "lucide-react";
import { TenantDetailDialog } from "@/components/tenants/tenant-detail-dialog";
import { AssignPlanDialog } from "@/components/tenants/assign-plan-dialog";
import { ManageOverridesDialog } from "@/components/tenants/manage-overrides-dialog";
import { useDeleteTenant } from "@/hooks/use-tenants";
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
import { toast } from "sonner";



type TenantActionsProps = {
    tenant: Tenant;
    onView: (tenant: Tenant) => void;
    onAssign: (tenant: Tenant) => void;
    onManage: (tenant: Tenant) => void;
    onDelete: (tenant: Tenant) => void;
};

const TenantActions = ({ tenant, onView, onAssign, onManage, onDelete }: TenantActionsProps) => {
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
                <DropdownMenuItem onClick={() => onView(tenant)}>
                    <Eye className="mr-2 h-4 w-4" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAssign(tenant)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Assign Plan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManage(tenant)}>
                    <Settings className="mr-2 h-4 w-4" />
                    Manage Features
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(tenant)}
                >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Tenant
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default function TenantsPage() {
    const { data: tenants, isLoading, error } = useTenants();
    const deleteTenant = useDeleteTenant();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [wizardOpen, setWizardOpen] = useState(false);

    // Dialog states
    const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [assignPlanOpen, setAssignPlanOpen] = useState(false);
    const [manageOverridesOpen, setManageOverridesOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleView = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setDetailOpen(true);
    };

    const handleAssign = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setAssignPlanOpen(true);
    };

    const handleManage = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setManageOverridesOpen(true);
    };

    const handleDeleteClick = (tenant: Tenant) => {
        setSelectedTenant(tenant);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedTenant) return;
        try {
            await deleteTenant.mutateAsync(selectedTenant.id);
            toast.success("Tenant deleted successfully");
            setDeleteDialogOpen(false);
        } catch (error) {
            toast.error("Failed to delete tenant");
        }
    };



    // I will rewrite the columns definition inside the component to access handlers


    // Memoize columns to include handlers
    const columns = [
        {
            accessorKey: "name",
            header: ({ column }: any) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent px-0"
                    >
                        Gym Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }: any) => {
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                            <Building2 className="h-4 w-4 text-orange-500" />
                        </div>
                        <div>
                            <p className="font-medium">{row.getValue("name")}</p>
                            <p className="text-xs text-muted-foreground">
                                {row.original.subdomain}.forwardthinkingfitness.com
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "subdomain",
            header: "Subdomain",
            cell: ({ row }: any) => (
                <code className="px-2 py-1 bg-muted rounded text-xs">
                    {row.getValue("subdomain")}
                </code>
            ),
        },
        {
            accessorKey: "current_subscription",
            header: "Plan",
            cell: ({ row }: any) => {
                const subscription = row.original.current_subscription;
                if (!subscription) {
                    return <Badge variant="outline">No Plan</Badge>;
                }
                return (
                    <div>
                        <Badge variant="secondary" className="font-medium">
                            {subscription.plan_name}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                            {subscription.status}
                        </p>
                    </div>
                );
            },
        },
        {
            accessorKey: "is_active",
            header: "Status",
            cell: ({ row }: any) => {
                const isActive = row.getValue("is_active");
                return (
                    <Badge variant={isActive ? "success" : "destructive"}>
                        {isActive ? "Active" : "Inactive"}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: "Created",
            cell: ({ row }: any) => {
                const date = new Date(row.getValue("created_at"));
                return (
                    <span className="text-sm text-muted-foreground">
                        {date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                        })}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }: any) => (
                <TenantActions
                    tenant={row.original}
                    onView={handleView}
                    onAssign={handleAssign}
                    onManage={handleManage}
                    onDelete={handleDeleteClick}
                />
            ),
        },
    ];

    const table = useReactTable({
        data: tenants || [],
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

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Tenants</h2>
                    <p className="text-muted-foreground">
                        Manage all registered gyms on your platform
                    </p>
                </div>
                <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
                    <DialogTrigger asChild>
                        <Button className="gradient-primary text-white shadow-lg shadow-orange-500/25">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Tenant
                        </Button>
                    </DialogTrigger>
                    <OnboardingWizard onClose={() => setWizardOpen(false)} />
                </Dialog>
            </div>

            {/* Data Table Card */}
            <Card className="border-none shadow-sm">
                <CardHeader className="border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">All Gyms</CardTitle>
                            <CardDescription>
                                {tenants?.length || 0} total tenants registered
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search gyms..."
                                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("name")?.setFilterValue(event.target.value)
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
                            <p className="text-destructive font-medium">Error loading tenants</p>
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
                                                    <Building2 className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                                    <p className="text-muted-foreground font-medium">
                                                        No tenants found
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Get started by adding your first gym
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

            <TenantDetailDialog
                open={detailOpen}
                onOpenChange={(open) => {
                    setDetailOpen(open);
                    if (!open) setSelectedTenant(null);
                }}
                tenant={selectedTenant}
            />

            <AssignPlanDialog
                open={assignPlanOpen}
                onOpenChange={(open) => {
                    setAssignPlanOpen(open);
                    if (!open) setSelectedTenant(null);
                }}
                tenant={selectedTenant}
            />

            <ManageOverridesDialog
                open={manageOverridesOpen}
                onOpenChange={(open) => {
                    setManageOverridesOpen(open);
                    if (!open) setSelectedTenant(null);
                }}
                tenant={selectedTenant}
            />

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Gym Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete <strong>{selectedTenant?.name}</strong>?
                            This action is permanent and will remove all their data, including members and subscriptions.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteTenant.isPending ? "Deleting..." : "Delete Permanently"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
