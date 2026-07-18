"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { logoutUser } from "@/lib/store/auth-slice";
import { Headset, MessageSquare, BarChart3, Settings, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SidebarNav() {
    const dispatch = useAppDispatch();
    const { user, organization } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <aside className="flex h-full w-18 flex-col items-center justify-between border-r border-border bg-card/60 backdrop-blur-md py-6">
            <div className="flex flex-col items-center gap-8">
                {/* Logo */}
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105">
                    <Headset className="h-6 w-6" />
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col items-center gap-4">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 rounded-xl transition-all"
                        title="Conversations"
                    >
                        <MessageSquare className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground transition-all"
                        title="Analytics (Demo)"
                    >
                        <BarChart3 className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground transition-all"
                        title="Settings (Demo)"
                    >
                        <Settings className="h-5 w-5" />
                    </Button>
                </nav>
            </div>

            {/* Profile & Logout */}
            <div className="flex flex-col items-center gap-6 w-full px-2">
                {/* User avatar/initial info */}
                <div className="relative group flex flex-col items-center cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-primary-foreground font-semibold uppercase shadow-inner">
                        {user?.email?.charAt(0)}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute left-14 bottom-1 z-50 hidden group-hover:flex flex-col w-48 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-xl animate-in fade-in slide-in-from-left-2 duration-200">
                        <p className="font-semibold text-xs truncate">{user?.email}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                            Org: {organization?.name}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-muted px-1.5 py-0.5 w-max text-[9px] font-bold text-muted-foreground uppercase">
                            <ShieldAlert className="h-3 w-3" />
                            {user?.role}
                        </div>
                    </div>
                </div>

                {/* Logout Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    title="Sign Out"
                >
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </aside>
    );
}
