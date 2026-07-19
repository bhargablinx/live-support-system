import { Input } from "@/components/ui/input"
import { ChevronDown, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils";
import type { StatusFilter } from "@/lib/types";

interface AgentFilterProps {
    search: string;
    setSearch: (search: string) => void;
    statusFilter: StatusFilter;
    setStatusFilter: (statusFilter: StatusFilter) => void;
}

function AgentFilter({ search, setSearch, statusFilter, setStatusFilter }: AgentFilterProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
            <div className="relative flex-1 max-w-md w-full group ">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 z-10 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search agents…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus-visible:border-primary transition-colors w-full border border-slate-300 dark:border-slate-700 rounded-md"
                />
            </div>

            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="outline"
                            className="h-11 gap-2 border-muted-foreground/20 bg-background/50 backdrop-blur-sm w-full sm:w-auto"
                        >
                            {statusFilter === "All" ? "Status" : statusFilter}
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    }
                />
                <DropdownMenuContent align="end" className="w-[160px]">
                    {(["All", "ADMIN", "AGENT"] as StatusFilter[]).map((s) => (
                        <DropdownMenuItem
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={cn(statusFilter === s && "bg-accent")}
                        >
                            {s}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}

export default AgentFilter