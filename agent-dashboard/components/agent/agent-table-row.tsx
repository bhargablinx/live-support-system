import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn, formatDate, getInitials } from "@/lib/utils";
import type { Agent } from "@/lib/types";
import { Loader2, MoreVertical, Trash2 } from "lucide-react";

interface AgentTableRowProps {
    agent: Agent;
    isSelf: boolean;
    isDeleting: boolean;
    isAdmin: boolean;
    onDelete: (id: string) => void;
}

export function AgentTableRow({
    agent,
    isSelf,
    isDeleting,
    isAdmin,
    onDelete,
}: AgentTableRowProps) {
    return (
        <TableRow
            className={cn(
                "group border-border/50 transition-colors hover:bg-muted/30",
                isDeleting && "opacity-50 pointer-events-none"
            )}
        >
            {/* Agent identity */}
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        <AvatarFallback
                            className={cn(
                                "text-xs font-semibold",
                                agent.role === "ADMIN"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-muted text-muted-foreground"
                            )}
                        >
                            {getInitials(agent.email)}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-foreground">{agent.email}</p>
                        {isSelf && (
                            <p className="text-[11px] text-muted-foreground">You</p>
                        )}
                    </div>
                </div>
            </TableCell>

            {/* Role badge */}
            <TableCell>
                <Badge
                    variant="outline"
                    className={cn(
                        agent.role === "ADMIN"
                            ? "bg-primary/10 text-primary border-primary/20"
                            : "text-muted-foreground"
                    )}
                >
                    {agent.role}
                </Badge>
            </TableCell>

            {/* Conversations count */}
            <TableCell className="text-muted-foreground">
                {agent._count.conversations}
            </TableCell>

            {/* Joined date */}
            <TableCell className="text-muted-foreground">
                {formatDate(agent.createdAt)}
            </TableCell>

            {/* Actions — ADMIN only */}
            {isAdmin && (
                <TableCell className="text-right">
                    {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity"
                                    >
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                }
                            />
                            <DropdownMenuContent align="end">
                                {isSelf ? (
                                    <DropdownMenuItem disabled>
                                        Cannot remove yourself
                                    </DropdownMenuItem>
                                ) : (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => onDelete(agent.id)}
                                            className="text-destructive focus:text-destructive gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Remove agent
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </TableCell>
            )}
        </TableRow>
    );
}
