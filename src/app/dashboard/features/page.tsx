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
import { Feature } from "@/types";
import { useFeatures, useDeleteFeature } from "@/hooks/use-features";
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
import { FeatureDialog } from "@/components/features/feature-dialog";
import {
    Plus,
    Search,
    MoreHorizontal,
    Zap,
    Edit,
    Trash2,
    ArrowUpDown,
    Loader2,
    ToggleLeft,
    Hash,
    Layers,
} from "lucide-react";

// Feature type icons
const featureTypeIcons = {
    boolean: ToggleLeft,
    limit: Hash,
    tier: Layers,
};

// Feature type labels
const featureTypeLabels = {
    boolean: "Boolean",
    limit: "Limit",
    tier: "Tier",
};

export default function FeaturesPage() {
    const { data: features, isLoading, error } = useFeatures();
    const deleteFeature = useDeleteFeature();
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [featureToDelete, setFeatureToDelete] = useState<Feature | null>(null);

    // Table columns definition
    const columns: ColumnDef<Feature>[] = [
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="hover:bg-transparent px-0"
                    >
                        Feature Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                return (
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Zap className="h-4 w-4 text-purple-500" />
                        </div>
                        <div>
                            <p className="font-medium">{row.getValue("name")}</p>
                            {row.original.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                    {row.original.description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => (
                <code className="px-2 py-1 bg-muted rounded text-xs">
                    {row.getValue("code")}
                </code>
            ),
        },
        {
            accessorKey: "feature_type",
            header: "Type",
            cell: ({ row }) => {
                const type = row.getValue("feature_type") as keyof typeof featureTypeIcons;
                const Icon = featureTypeIcons[type] || Zap;
                return (
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{featureTypeLabels[type] || type}</span>
                    </div>
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
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const feature = row.original;
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
                                    setEditingFeature(feature);
                                    setDialogOpen(true);
                                }}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Feature
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                    setFeatureToDelete(feature);
                                    setDeleteDialogOpen(true);
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Feature
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const table = useReactTable({
        data: features || [],
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

    const handleDeleteFeature = async () => {
        if (featureToDelete) {
            try {
                await deleteFeature.mutateAsync(featureToDelete.id);
                setDeleteDialogOpen(false);
                setFeatureToDelete(null);
            } catch (error) {
                console.error("Failed to delete feature:", error);
            }
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Features</h2>
                    <p className="text-muted-foreground">
                        Manage platform features and capabilities
                    </p>
                </div>
                <Button
                    className="gradient-primary text-white shadow-lg shadow-orange-500/25"
                    onClick={() => {
                        setEditingFeature(null);
                        setDialogOpen(true);
                    }}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Feature
                </Button>
            </div>

            {/* Data Table Card */}
            <Card className="border-none shadow-sm">
                <CardHeader className="border-b">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle className="text-lg">All Features</CardTitle>
                            <CardDescription>
                                {features?.length || 0} features configured
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search features..."
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
                            <p className="text-destructive font-medium">Error loading features</p>
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
                                                    <Zap className="h-12 w-12 text-muted-foreground/50 mb-4" />
                                                    <p className="text-muted-foreground font-medium">
                                                        No features found
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">
                                                        Get started by adding your first feature
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

            {/* Feature Dialog */}
            <FeatureDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (!open) setEditingFeature(null);
                }}
                feature={editingFeature}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Feature</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{featureToDelete?.name}&quot;? This action
                            cannot be undone and may affect plans that use this feature.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteFeature}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deleteFeature.isPending ? (
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
