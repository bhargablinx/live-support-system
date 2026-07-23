"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

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

export function DangerZoneCard() {
    const organizationName = "Acme Technologies";

    const [confirmation, setConfirmation] = useState("");

    const canDelete = confirmation === organizationName;

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
                    </div>

                    <AlertDialog>
                        <AlertDialogTrigger>
                            <Button variant="destructive">
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
                                    placeholder={organizationName}
                                />
                            </div>

                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                    disabled={!canDelete}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    Delete Permanently
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
        </Card>
    );
}