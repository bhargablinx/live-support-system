"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/store";
import { Loader2 } from "lucide-react";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [loading, isAuthenticated, router]);

    if (loading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/40 shadow-inner">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground animate-pulse">
                        Verifying session...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Prevents flashing dashboard content while redirecting
    }

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-background">
            <SidebarNav />
            <div className="flex-1 overflow-y-auto min-w-0">
                {children}
            </div>
        </div>
    );
}
