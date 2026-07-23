"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/store";
import { resetAuth } from "@/lib/store/auth-slice";
import { deleteOrganization } from "@/lib/api/org";

import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DangerZoneCardProps {
    organizationName: string;
    isAdmin: boolean;
}

export function DangerZoneCard({ organizationName, isAdmin }: DangerZoneCardProps) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const [confirmation, setConfirmation] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const canDelete = confirmation === organizationName && !deleting;

    async function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        setDeleting(true);
        setError(null);
        try {
            await deleteOrganization();
            dispatch(resetAuth());
            router.push("/register");
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to delete organization");
            setDeleting(false);
        }
    }

    return (
        <Card className="border-destructive/40">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />

                    <CardTitle className="text-destructive">
                        Danger Zone
                    </CardTitle>
                </div>

                <CardDescription>
                    These actions are permanent and cannot be undone.
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col gap-6 rounded-lg border border-destructive/20 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                        <h3 className="font-semibold">
                            Delete Organization
                        </h3>

                        <p className="max-w-xl text-sm text-muted-foreground">
                            Permanently delete this organization along with all
                            agents, conversations, visitors, analytics, and
                            messages.
                        </p>

                        {!isAdmin && (
                            <p className="text-xs font-semibold text-destructive">
                                * Only organization administrators (ADMIN role) can perform this action.
                            </p>
                        )}
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger>
                            <Button variant="destructive" disabled={!isAdmin}>
                                Delete Organization
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Delete Organization?
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                    This action cannot be undone.
                                    <br />
                                    <br />
                                    All agents, conversations, visitors,
                                    messages, and analytics will be permanently
                                    removed.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <div className="space-y-3">
                                <Label>
                                    Type{" "}
                                    <span className="font-semibold">
                                        {organizationName}
                                    </span>{" "}
                                    to confirm
                                </Label>

                                <Input
                                    value={confirmation}
                                    onChange={(e) =>
                                        setConfirmation(e.target.value)
                                    }
                                    disabled={deleting}
                                    placeholder={organizationName}
                                />
                            </div>

                            {error && (
                                <p className="text-sm font-semibold text-destructive mt-2">
                                    {error}
                                </p>
                            )}

                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={deleting}>
                                    Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                    disabled={!canDelete}
                                    onClick={handleDelete}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    {deleting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete Permanently"
                                    )}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}