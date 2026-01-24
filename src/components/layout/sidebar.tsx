"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Dumbbell,
    LayoutDashboard,
    Building2,
    CreditCard,
    Settings,
    ChevronLeft,
    ChevronRight,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NavItem {
    title: string;
    href: string;
    icon: React.ReactNode;
}

const navItems: NavItem[] = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
        title: "Tenants",
        href: "/dashboard/tenants",
        icon: <Building2 className="h-5 w-5" />,
    },
    {
        title: "Plans",
        href: "/dashboard/plans",
        icon: <CreditCard className="h-5 w-5" />,
    },
    {
        title: "Features",
        href: "/dashboard/features",
        icon: <Zap className="h-5 w-5" />,
    },
];

const bottomNavItems: NavItem[] = [
    {
        title: "Settings",
        href: "/dashboard/settings",
        icon: <Settings className="h-5 w-5" />,
    },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen bg-sidebar-background border-r border-sidebar-border transition-all duration-300 ease-in-out",
                collapsed ? "w-[70px]" : "w-[260px]"
            )}
        >
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
                    <Link href="/dashboard" className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20">
                            <Dumbbell className="h-5 w-5 text-white" />
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm text-sidebar-foreground">
                                    Forward Thinking
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Fitness Platform
                                </span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    collapsed && "justify-center px-2"
                                )}
                                title={collapsed ? item.title : undefined}
                            >
                                {item.icon}
                                {!collapsed && <span>{item.title}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <Separator className="mx-3" />

                {/* Bottom Navigation */}
                <div className="p-3 space-y-1">
                    {bottomNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                    collapsed && "justify-center px-2"
                                )}
                                title={collapsed ? item.title : undefined}
                            >
                                {item.icon}
                                {!collapsed && <span>{item.title}</span>}
                            </Link>
                        );
                    })}
                </div>

                {/* Collapse Toggle */}
                <div className="p-3 border-t border-sidebar-border">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onToggle}
                        className={cn(
                            "w-full justify-center text-muted-foreground hover:text-foreground",
                            !collapsed && "justify-start"
                        )}
                    >
                        {collapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <>
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                <span>Collapse</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </aside>
    );
}
