import React from 'react'
import { Button } from '../ui/button'
import { Plus, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentHeaderProps {
    loading: boolean;
    load: () => void;
    setDialogOpen: (open: boolean) => void;
}

function AgentHeader({ loading, load, setDialogOpen }: AgentHeaderProps) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    Manage Agents
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                    Manage your support agents, monitor availability, and assign access.
                </p>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={load}
                    disabled={loading}
                    className="h-11 w-11 shrink-0"
                >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
                <Button
                    className="shrink-0 gap-2 shadow-md hover:shadow-lg transition-all"
                    size="lg"
                    onClick={() => setDialogOpen(true)}
                >
                    <Plus className="h-5 w-5" />
                    Add Agent
                </Button>
            </div>
        </div>
    )
}

export default AgentHeader