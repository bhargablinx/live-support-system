import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { createAgent } from "@/lib/api/agent";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "@base-ui/react";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface AddAgentModalProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onCreated: () => void;
}

function AddAgentModal({ open, onOpenChange, onCreated }: AddAgentModalProps) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);
        try {
            await createAgent({ email, password });
            setEmail("");
            setPassword("");
            onOpenChange(false);
            onCreated();
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                "Failed to create agent. Please try again.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = (v: boolean) => {
        if (!submitting) {
            setEmail("");
            setPassword("");
            setError(null);
            onOpenChange(v);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add New Agent</DialogTitle>
                    <DialogDescription>
                        Create a support agent account under your organization. They can log in
                        immediately with the credentials you provide.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="agent-email">Email address</Label>
                        <Input
                            id="agent-email"
                            type="email"
                            placeholder="agent@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={submitting}
                            className="h-10 w-full border border-slate-300 dark:border-slate-700 rounded-md pl-2"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="agent-password">Temporary password</Label>
                        <Input
                            id="agent-password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            disabled={submitting}
                            className="h-10 w-full border border-slate-300 dark:border-slate-700 rounded-md pl-2"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting} className="gap-2">
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {submitting ? "Creating…" : "Create Agent"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddAgentModal