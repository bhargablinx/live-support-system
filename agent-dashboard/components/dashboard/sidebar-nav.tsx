"use client";

import {
    BarChart3,
    Headset,
    LogOut,
    MessageSquare,
    Settings,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { logoutUser } from "@/lib/store/auth-slice";

const navigation = [
    {
        icon: MessageSquare,
        label: "Inbox",
        active: true,
    },
    {
        icon: BarChart3,
        label: "Analytics",
        active: false,
    },
    {
        icon: Settings,
        label: "Settings",
        active: false,
    },
];

export function SidebarNav() {
    const dispatch = useAppDispatch();
    const { user, organization } = useAppSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <TooltipProvider delay={150}>
            <aside className="flex h-screen w-[72px] flex-col border-r bg-background">
                {/* Logo */}
                <div className="flex h-16 items-center justify-center border-b">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Headset className="h-5 w-5" />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-1 flex-col items-center gap-1 py-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;

                        return (
                            <Tooltip key={item.label}>
                                <TooltipTrigger
                                    render={
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={cn(
                                                "relative h-11 w-11 rounded-xl transition-all duration-200",
                                                item.active
                                                    ? "bg-accent text-accent-foreground"
                                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                            )}
                                        >
                                            {item.active && (
                                                <span className="absolute -left-[13px] h-6 w-1 rounded-r-full bg-primary" />
                                            )}

                                            <Icon className="h-5 w-5" />
                                        </Button>
                                    }
                                />

                                <TooltipContent side="right">
                                    {item.label}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </nav>

                {/* Bottom */}
                <div className="border-t p-3">
                    <Tooltip>
                        <TooltipTrigger
                            render={
                                <button className="group flex w-full items-center justify-center">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted font-semibold text-sm uppercase transition-colors group-hover:bg-accent">
                                        {user?.email?.[0]}
                                    </div>
                                </button>
                            }
                        />

                        <TooltipContent
                            side="right"
                            align="end"
                            className="w-60 space-y-3"
                        >
                            <div>
                                <p className="font-medium truncate">
                                    {user?.email}
                                </p>

                                <p className="text-xs text-muted-foreground truncate">
                                    {organization?.name}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs">
                                <Shield className="h-3.5 w-3.5" />
                                {user?.role}
                            </div>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger
                            render={
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleLogout}
                                    className="mt-3 h-11 w-11 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            }
                        />

                        <TooltipContent side="right">
                            Sign out
                        </TooltipContent>
                    </Tooltip>
                </div>
            </aside>
        </TooltipProvider>
    );
}
