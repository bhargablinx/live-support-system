import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Plus,
    Search,
    MoreVertical,
    Users,
    UserCheck,
    UserMinus,
    Radio,
    ChevronDown
} from "lucide-react";

export default function AgentsPage() {
    return (
        <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Manage Agents</h1>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Manage your support agents, monitor availability, and assign access.
                    </p>
                </div>
                <Button className="shrink-0 gap-2 shadow-md hover:shadow-lg transition-all" size="lg">
                    <Plus className="h-5 w-5" />
                    Add Agent
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between text-muted-foreground">
                        <p className="font-medium">Total</p>
                        <Users className="h-5 w-5" />
                    </div>
                    <div className="text-3xl font-bold">18</div>
                </Card>

                <Card className="p-6 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between text-muted-foreground">
                        <p className="font-medium">Active</p>
                        <UserCheck className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="text-3xl font-bold">12</div>
                </Card>

                <Card className="p-6 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between text-muted-foreground">
                        <p className="font-medium">Inactive</p>
                        <UserMinus className="h-5 w-5 text-rose-500" />
                    </div>
                    <div className="text-3xl font-bold">6</div>
                </Card>

                <Card className="p-6 flex flex-col gap-2 relative overflow-hidden group hover:shadow-md transition-all border-primary/20 bg-primary/5">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between text-primary">
                        <p className="font-medium">Online Now</p>
                        <Radio className="h-5 w-5 animate-pulse" />
                    </div>
                    <div className="text-3xl font-bold text-primary">8</div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4 py-4">
                <div className="relative flex-1 max-w-md w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search agents..."
                        className="pl-9 h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus-visible:border-primary transition-colors"
                    />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger render={
                        <Button variant="outline" className="h-11 gap-2 border-muted-foreground/20 bg-background/50 backdrop-blur-sm w-full sm:w-auto">
                            Status
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    } />
                    <DropdownMenuContent align="end" className="w-[180px]">
                        <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>All</DropdownMenuItem>
                        <DropdownMenuItem>Active</DropdownMenuItem>
                        <DropdownMenuItem>Inactive</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Agents List */}
            <Card className="overflow-hidden border-border/50 shadow-sm">
                <div className="p-6 border-b border-border/50 bg-muted/20">
                    <h2 className="text-xl font-semibold tracking-tight">Current Agents</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your support team and their availability.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/40">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-medium">Agent</th>
                                <th scope="col" className="px-6 py-4 font-medium">Email</th>
                                <th scope="col" className="px-6 py-4 font-medium">Status</th>
                                <th scope="col" className="px-6 py-4 font-medium">Last Active</th>
                                <th scope="col" className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {/* Row 1 */}
                            <tr className="hover:bg-muted/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-primary/10 text-primary">JD</AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium text-foreground">John Doe</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">john@example.com</td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Active</Badge>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">2 min ago</td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger render={
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        } />
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit profile</DropdownMenuItem>
                                            <DropdownMenuItem>View activity</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>

                            {/* Row 2 */}
                            <tr className="hover:bg-muted/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-muted text-muted-foreground">MS</AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium text-foreground">Mary Smith</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">mary@example.com</td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className="text-muted-foreground">Inactive</Badge>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">2 hrs ago</td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger render={
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        } />
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit profile</DropdownMenuItem>
                                            <DropdownMenuItem>View activity</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-emerald-500">Activate</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>

                            {/* Row 3 */}
                            <tr className="hover:bg-muted/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-primary/10 text-primary">AJ</AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium text-foreground">Alex Johnson</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">alex@example.com</td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Active</Badge>
                                </td>
                                <td className="px-6 py-4 text-primary font-medium">Just now</td>
                                <td className="px-6 py-4 text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger render={
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        } />
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Edit profile</DropdownMenuItem>
                                            <DropdownMenuItem>View activity</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
