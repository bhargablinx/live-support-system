"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { checkAuth } from "@/lib/store/auth-slice";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

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

    return <div className="h-screen overflow-hidden bg-background">{children}</div>;
}
