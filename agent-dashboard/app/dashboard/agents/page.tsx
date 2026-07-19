"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Users, UserCheck, UserMinus, Radio } from "lucide-react";

import { fetchAgents, deleteAgent } from "@/lib/api/agent";
import type { Agent, AgentStats } from "@/lib/types";
import { useAppSelector } from "@/lib/store/store";
import { StatusFilter } from "@/lib/types";

import AgentHeader from "@/components/agent/agent-header";
import AgentFilter from "@/components/agent/agent-filter";
import StatCard from "@/components/agent/StatCard";
import { AgentTable } from "@/components/agent/agent-table";
import AddAgentModal from "@/components/agent/add-agent-modal";

export default function AgentsPage() {
    const { user } = useAppSelector((s) => s.auth);
    const isAdmin = user?.role === "ADMIN";

    // ── Data state ─────────────────────────────────────────────────────────
    const [agents, setAgents] = useState<Agent[]>([]);
    const [stats, setStats] = useState<AgentStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── UI state ───────────────────────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ── Data fetching ──────────────────────────────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchAgents();
            setAgents(res.data.agents);
            setStats(res.data.stats);
        } catch {
            setError("Could not load agents. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    // ── Derived state ──────────────────────────────────────────────────────
    const filtered = useMemo(
        () =>
            agents.filter((a) => {
                const matchSearch = a.email.toLowerCase().includes(search.toLowerCase());
                const matchStatus = statusFilter === "All" || a.role === statusFilter;
                return matchSearch && matchStatus;
            }),
        [agents, search, statusFilter]
    );

    // ── Handlers ───────────────────────────────────────────────────────────
    const handleDelete = async (agentId: string) => {
        setDeletingId(agentId);
        try {
            await deleteAgent(agentId);
            setAgents((prev) => prev.filter((a) => a.id !== agentId));
            setStats((prev) =>
                prev ? { ...prev, total: prev.total - 1, active: prev.active - 1 } : prev
            );
        } catch {
            // keep UI unchanged on error
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <AgentHeader loading={loading} load={load} setDialogOpen={setDialogOpen} />

            {/* Stats strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Total" value={stats?.total} icon={<Users className="h-5 w-5" />} loading={loading} />
                <StatCard label="Active" value={stats?.active} icon={<UserCheck className="h-5 w-5 text-emerald-500" />} accent="border-emerald-500/20" loading={loading} />
                <StatCard label="Inactive" value={stats?.inactive} icon={<UserMinus className="h-5 w-5 text-rose-500" />} accent="border-rose-500/20" loading={loading} />
                <StatCard label="Online Now" value={0} icon={<Radio className="h-5 w-5 text-primary animate-pulse" />} accent="border-primary/20 bg-primary/5" loading={loading} />
            </div>

            <AgentFilter
                search={search}
                setSearch={setSearch}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
            />

            {/* Error banner */}
            {error && (
                <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{error}</span>
                    <Button variant="ghost" size="sm" onClick={load} className="ml-auto text-destructive hover:text-destructive">
                        Retry
                    </Button>
                </div>
            )}

            <AgentTable
                agents={agents}
                filtered={filtered}
                loading={loading}
                isAdmin={isAdmin}
                currentUserId={user?.id}
                deletingId={deletingId}
                search={search}
                statusFilter={statusFilter}
                onDelete={handleDelete}
            />

            <AddAgentModal open={dialogOpen} onOpenChange={setDialogOpen} onCreated={load} />
        </div>
    );
}
