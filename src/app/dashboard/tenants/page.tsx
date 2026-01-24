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
} from "lucide-react";

// Table columns definition
const columns: ColumnDef<Tenant>[] = [
    {
        accessorKey: "gym_name",
        header: ({ column }) => {
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
        cell: ({ row }) => {
            return (
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-orange-500" />
                    </div>
                    <div>
                        <p className="font-medium">{row.getValue("gym_name")}</p>
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
        cell: ({ row }) => (
            <code className="px-2 py-1 bg-muted rounded text-xs">
                {row.getValue("subdomain")}
            </code>
        ),
    },
    {
        accessorKey: "owner_email",
        header: "Owner",
        cell: ({ row }) => {
            const owner = row.original.owner;
            return (
                <div>
                    <p className="text-sm">
                        {owner?.first_name} {owner?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {owner?.email || row.original.owner_email}
                    </p>
                </div>
            );
        },
    },
    {
        accessorKey: "current_plan",
        header: "Plan",
        cell: ({ row }) => {
            const plan = row.original.current_plan;
            if (!plan) {
                return <Badge variant="outline">No Plan</Badge>;
            }
            return (
                <Badge variant="secondary" className="font-medium">
                    {plan.display_name || plan.name}
                </Badge>
            );
        },
    },
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
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
        cell: ({ row }) => {
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
        cell: ({ row }) => {
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
                        <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Assign Plan
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            Manage Features
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];

export default function TenantsPage() {
    const { data: tenants, isLoading, error } = useTenants();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [wizardOpen, setWizardOpen] = useState(false);

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
                                value={(table.getColumn("gym_name")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("gym_name")?.setFilterValue(event.target.value)
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
        </div>
    );
}
