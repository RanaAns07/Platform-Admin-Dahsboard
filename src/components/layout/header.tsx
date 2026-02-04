"use client";

import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Menu, User, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
    title: string;
    onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
    const { user, logout } = useAuth();

    const getInitials = (firstName?: string, lastName?: string) => {
        const first = firstName?.[0] || "";
        const last = lastName?.[0] || "";
        return (first + last).toUpperCase() || "AD";
    };

    return (
        <header className="sticky top-0 z-30 h-16 border-b bg-background/60 backdrop-blur-xl border-border/40">
            <div className="flex h-full items-center justify-between px-4 md:px-6">
                {/* Left side - Menu button and Title */}
                <div className="flex items-center gap-4">
                    {onMenuClick && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={onMenuClick}
                        >
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Toggle menu</span>
                        </Button>
                    )}
                    <h1 className="text-xl font-bold tracking-tight text-foreground">{title}</h1>
                </div>

                {/* Right side - Notifications and Profile */}
                <div className="flex items-center gap-2">
                    <ThemeToggle />

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background"></span>
                        <span className="sr-only">Notifications</span>
                    </Button>

                    {/* Profile Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative flex items-center gap-2 p-1 hover:bg-accent/50 rounded-full"
                            >
                                <Avatar className="h-8 w-8 transition-transform group-hover:scale-105">
                                    <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                                        {getInitials(user?.first_name, user?.last_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="hidden md:flex flex-col items-start">
                                    <span className="text-sm font-medium">
                                        {user?.first_name} {user?.last_name}
                                    </span>
                                    <span className="text-xs text-muted-foreground capitalize">
                                        {user?.role?.replace("_", " ")}
                                    </span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        {user?.first_name} {user?.last_name}
                                    </p>
                                    <p className="text-xs leading-none text-muted-foreground">
                                        {user?.email}
                                    </p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={logout}
                                className="text-destructive focus:text-destructive"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
