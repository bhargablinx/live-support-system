import { Card } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Agent } from "@/lib/types";
import type { StatusFilter } from "@/lib/types";
import { AgentTableRow } from "./agent-table-row";

interface AgentTableProps {
    agents: Agent[];
    filtered: Agent[];
    loading: boolean;
    isAdmin: boolean;
    currentUserId: string | undefined;
    deletingId: string | null;
    search: string;
    statusFilter: StatusFilter;
    onDelete: (id: string) => void;
}

const SKELETON_ROWS = 4;

export function AgentTable({
    agents,
    filtered,
    loading,
    isAdmin,
    currentUserId,
    deletingId,
    search,
    statusFilter,
    onDelete,
}: AgentTableProps) {
    const colSpan = isAdmin ? 5 : 4;

    const emptyMessage =
        search || statusFilter !== "All"
            ? "No agents match your filters."
            : "No agents in your organization yet.";

    return (
        <Card className="overflow-hidden border-border/50 shadow-sm">
            {/* Card header */}
            <div className="p-6 border-b border-border/50 bg-muted/20">
                <h2 className="text-xl font-semibold tracking-tight">Current Agents</h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage your support team and their availability.
                </p>
            </div>

            <Table>
                <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent border-border/50">
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Agent</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Role</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Conversations</TableHead>
                        <TableHead className="text-xs font-medium text-muted-foreground uppercase">Joined</TableHead>
                        {isAdmin && (
                            <TableHead className="text-xs font-medium text-muted-foreground uppercase text-right">
                                Actions
                            </TableHead>
                        )}
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {/* Skeleton rows */}
                    {loading &&
                        Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                            <TableRow key={i} className="border-border/50">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                                        <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                                    </div>
                                </TableCell>
                                <TableCell><div className="h-4 w-16 rounded bg-muted animate-pulse" /></TableCell>
                                <TableCell><div className="h-4 w-8 rounded bg-muted animate-pulse" /></TableCell>
                                <TableCell><div className="h-4 w-20 rounded bg-muted animate-pulse" /></TableCell>
                                {isAdmin && <TableCell />}
                            </TableRow>
                        ))}

                    {/* Empty state */}
                    {!loading && filtered.length === 0 && (
                        <TableRow className="border-border/50">
                            <TableCell
                                colSpan={colSpan}
                                className="py-16 text-center text-muted-foreground"
                            >
                                {emptyMessage}
                            </TableCell>
                        </TableRow>
                    )}

                    {/* Agent rows */}
                    {!loading &&
                        filtered.map((agent) => (
                            <AgentTableRow
                                key={agent.id}
                                agent={agent}
                                isSelf={agent.id === currentUserId}
                                isDeleting={deletingId === agent.id}
                                isAdmin={isAdmin}
                                onDelete={onDelete}
                            />
                        ))}
                </TableBody>
            </Table>

            {/* Footer count */}
            {!loading && filtered.length > 0 && (
                <div className="px-6 py-3 border-t border-border/50 bg-muted/10 text-xs text-muted-foreground">
                    Showing {filtered.length} of {agents.length} agent
                    {agents.length !== 1 ? "s" : ""}
                </div>
            )}
        </Card>
    );
}
