"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetTitle,
} from "@/components/ui/sheet";

// Page titles mapping
const pageTitles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/dashboard/tenants": "Tenant Management",
    "/dashboard/plans": "Plans",
    "/dashboard/features": "Features",
    "/dashboard/settings": "Settings",
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, isLoading } = useAuth();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Get page title
    const getPageTitle = () => {
        // Check for exact match first
        if (pageTitles[pathname]) {
            return pageTitles[pathname];
        }
        // Check for partial match (for nested routes)
        for (const [route, title] of Object.entries(pageTitles)) {
            if (pathname.startsWith(route) && route !== "/dashboard") {
                return title;
            }
        }
        return "Dashboard";
    };

    // Redirect if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [isAuthenticated, isLoading, router]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            {/* Mobile Sidebar */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="w-[260px] p-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <Sidebar collapsed={false} onToggle={() => setMobileMenuOpen(false)} />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div
                className={cn(
                    "min-h-screen transition-all duration-300",
                    sidebarCollapsed ? "md:ml-[70px]" : "md:ml-[260px]"
                )}
            >
                <Header
                    title={getPageTitle()}
                    onMenuClick={() => setMobileMenuOpen(true)}
                />
                <main className="p-4 md:p-6">{children}</main>
            </div>
        </div>
    );
}
