"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
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
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const logoSrc = mounted && (theme === 'dark' || resolvedTheme === 'dark')
        ? "/lookfitter Dark.png"
        : "/lookfitter Light.png";

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen bg-sidebar-background/60 backdrop-blur-xl border-r border-sidebar-border transition-all duration-300 ease-in-out",
                collapsed ? "w-[70px]" : "w-[260px]"
            )}
        >
            <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center">
                            {mounted ? (
                                <NextImage
                                    src={logoSrc}
                                    alt="LookFitter Logo"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                    priority
                                />
                            ) : (
                                <div className="h-10 w-10 bg-muted animate-pulse rounded-md" />
                            )}
                        </div>
                        {!collapsed && (
                            <div className="flex flex-col">
                                <span className="font-bold text-lg tracking-tight text-sidebar-foreground">
                                    LookFitter
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
