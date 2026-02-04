"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, User, Bell, Shield, Palette } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="flex flex-col h-full">
            <Header title="Settings" />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                <div className="max-w-4xl mx-auto space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
                        <p className="text-muted-foreground mt-1">
                            Manage your account settings and preferences.
                        </p>
                    </div>

                    <Separator className="bg-border/40" />

                    <div className="grid gap-6">
                        {/* Appearance Section */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Palette className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">Appearance</h3>
                            </div>
                            <Card className="glass border-border/20 overflow-hidden">
                                <CardHeader className="pb-3 text-white">
                                    <CardTitle className="text-foreground">Theme Preference</CardTitle>
                                    <CardDescription>
                                        Choose how LookFitter looks to you.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Dark Mode</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Switch between light and dark themes.
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Sun className="h-4 w-4 text-muted-foreground" />
                                            <Switch
                                                checked={theme === "dark"}
                                                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                                            />
                                            <Moon className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Profile Section (Placeholder) */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">Profile</h3>
                            </div>
                            <Card className="glass border-border/20 overflow-hidden">
                                <CardHeader className="pb-3 text-white">
                                    <CardTitle className="text-foreground">Account Information</CardTitle>
                                    <CardDescription>
                                        Update your personal details.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>First Name</Label>
                                            <div className="p-2 rounded-md bg-secondary/50 text-muted-foreground border border-border/20">
                                                Platform
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Last Name</Label>
                                            <div className="p-2 rounded-md bg-secondary/50 text-muted-foreground border border-border/20">
                                                Administrator
                                            </div>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Email Address</Label>
                                            <div className="p-2 rounded-md bg-secondary/50 text-muted-foreground border border-border/20">
                                                admin@lookfitter.com
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Security Section (Placeholder) */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Shield className="h-5 w-5 text-primary" />
                                <h3 className="text-lg font-semibold">Security</h3>
                            </div>
                            <Card className="glass border-border/20 overflow-hidden">
                                <CardHeader className="pb-3 text-white">
                                    <CardTitle className="text-foreground">Two-Factor Authentication</CardTitle>
                                    <CardDescription>
                                        Secure your account with an extra layer of security.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Enable 2FA</Label>
                                            <p className="text-sm text-muted-foreground">
                                                Requires a code from your phone to log in.
                                            </p>
                                        </div>
                                        <Switch disabled />
                                    </div>
                                </CardContent>
                            </Card>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
